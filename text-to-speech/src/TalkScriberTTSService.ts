import { EventEmitter } from "events";
import WebSocket from "ws";
import { randomUUID } from "node:crypto";
import * as fs from "fs";
import * as path from "path";
import * as AudioOutput from "naudiodon";
import * as WavWriter from "wav";

export interface TalkScriberTTSOptions {
  apiKey: string;
  speakerName?: string;
  endpoint?: string;
  enablePlayback?: boolean;
  saveAudioPath?: string;
  text?: string;
  onAudioChunk?: (chunk: Buffer) => void;
  onAudioComplete?: () => void;
  onError?: (error: Error) => void;
}

// Audio Configuration Constants
const SAMPLE_RATE = 24000;    // 24kHz sample rate (must match server)
const CHANNELS = 1;          // Mono audio
const BITS_PER_SAMPLE = 16;  // 16-bit audio
const BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8;
const MIN_AUDIO_BUFFER_SIZE = 20;

/**
 * TalkScriberTTSService class for real-time text-to-speech conversion.
 * @extends EventEmitter
 */
export class TalkScriberTTSService extends EventEmitter {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private options: TalkScriberTTSOptions & { 
    endpoint: string; 
    speakerName: string; 
    enablePlayback: boolean;
    text?: string;
  };
  private isConnected: boolean = false;
  private isAuthenticated: boolean = false;
  private isClosingIntentionally: boolean = false;
  
  // Audio playback components
  private audioStream: any = null;
  private audioBuffer: Buffer[] = [];
  private isPlaying: boolean = false;
  private generationComplete: boolean = false;
  private chunksReceived: number = 0;
  private totalBytes: number = 0;
  
  // Audio storage for file saving
  private audioChunksForStorage: Buffer[] = [];
  private wavWriter: any = null;

  /**
   * Creates a new TalkScriberTTSService instance.
   * @param {TalkScriberTTSOptions} options - Configuration options for the service.
   */
  constructor(options: TalkScriberTTSOptions) {
    super();
    this.options = {
      ...options,
      endpoint: options.endpoint || "wss://api.talkscriber.com:9099",
      speakerName: options.speakerName || "tara",
      enablePlayback: options.enablePlayback !== false,
      text: options.text
    };
    this.sessionId = randomUUID();
  }

  /**
   * Connects to the TalkScriber TTS service and authenticates.
   * @returns {Promise<void>} A promise that resolves when connected and authenticated.
   */
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.options.endpoint);

      this.ws.on("open", () => {
        console.log("TTS -> TalkScriber connection opened");
        this.isConnected = true;
        
        // Send authentication message
        const authMessage = {
          uid: this.sessionId,
          auth: this.options.apiKey,
          type: "tts",
          speaker_name: this.options.speakerName,
          text: this.options.text || "" // Include text in authentication message
        };
        
        this.ws!.send(JSON.stringify(authMessage));
        console.log("Authentication message sent:", JSON.stringify(authMessage, null, 2));
      });

      let authResponseReceived = false;

      this.ws.on("message", (message: WebSocket.Data) => {
        try {
          // Handle binary audio data
          if (message instanceof Buffer) {
            this.handleAudioChunk(message);
            return;
          }

          // Handle JSON messages
          const msg = JSON.parse(message.toString()) as {
            type: string;
            message?: string;
            status?: string;
          };

          console.log(`Received JSON message: ${msg.type}`);
          console.log(`Received message type '${msg.type}':`, msg);

          authResponseReceived = true;

          if (msg.type === "authenticated" || msg.type === "server_ready") {
            this.isAuthenticated = true;
            console.log("TTS Authentication successful");
            
            // If we have a default text, send speak request immediately after authentication
            // This ensures the server gets the text both in auth message and speak request
            if (this.options.text) {
              console.log("Sending speak request immediately after authentication (text already sent in auth message too)");
              this.sendSpeakRequest(this.options.text);
            }
            
            resolve();
            return;
          }

          if (msg.type === "error") {
            const error = new Error(`Server error: ${msg.message || "Unknown error"}`);
            console.error(`TTS Server error: ${msg.message}`);
            this.emit("error", error);
            this.close();
            reject(error);
            return;
          }

          this.handleJsonMessage(msg);
        } catch (error) {
          console.error("Error handling message:", error);
          this.emit("error", error instanceof Error ? error : new Error(String(error)));
        }
      });

      this.ws.on("error", (error: Error) => {
        console.error("TTS -> TalkScriber error", error);
        this.emit("error", error);
        this.close();
        reject(error);
      });

      this.ws.on("close", (code: number, reason: string) => {
        let errorMessage = "TTS Connection closed unexpectedly.";
        if (code === 1000 && !this.isAuthenticated && !this.isClosingIntentionally) {
          errorMessage = "TTS Authentication failed. Please check your API key.";
          console.error(errorMessage);
          const error = new Error(errorMessage);
          this.emit("error", error);
          reject(error);
        } else if (code === 1000) {
          if (this.isClosingIntentionally) {
            console.log("TTS Connection closed intentionally after successful completion.");
          } else {
            errorMessage = "TTS Connection closed normally.";
            console.log(errorMessage);
          }
        } else if (code === 1006) {
          errorMessage = "TTS Connection closed abnormally (Code: 1006). This usually indicates a network issue or server problem.";
          console.error(errorMessage);
          if (!authResponseReceived) {
            const error = new Error(errorMessage);
            this.emit("error", error);
            reject(error);
          }
        } else {
          errorMessage += ` (Code: ${code}) Please check your internet connection and try again.`;
          console.error(errorMessage);
          if (!authResponseReceived) {
            const error = new Error(errorMessage);
            this.emit("error", error);
            reject(error);
          }
        }
      });

      // Connection timeout
      setTimeout(() => {
        if (!authResponseReceived) {
          const error = new Error("TTS Connection timed out. No response from server.");
          console.error("TTS Connection timed out. No response from server.");
          this.emit("error", error);
          this.close();
          reject(error);
        }
      }, 5000);
    });
  }

  /**
   * Sends a speak request to the TTS service.
   * @param {string} text - The text to convert to speech.
   * @param {string} speakerName - Optional speaker name (overrides constructor setting).
   * @returns {boolean} True if request sent successfully.
   */
  public sendSpeakRequest(text: string, speakerName?: string): boolean {
    if (!this.isAuthenticated) {
      throw new Error("Not authenticated. Call connect() first.");
    }
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const speakMessage = {
        type: "speak",
        text: text,
        speaker: speakerName || this.options.speakerName
      };
      
      console.log(`Sending speak request for text: '${text.substring(0, 50)}${text.length > 50 ? '...' : ''}'`);
      this.ws.send(JSON.stringify(speakMessage));
      return true;
    } else {
      throw new Error("WebSocket is not open. Call connect() first.");
    }
  }

  /**
   * Initializes audio playback system.
   * @returns {boolean} True if audio initialized successfully.
   */
  public initAudio(): boolean {
    if (!this.options.enablePlayback) {
      console.log("Audio playback disabled, skipping audio initialization");
      return true;
    }

    try {
      // Get available audio devices
      const devices = (AudioOutput as any).getDevices();
      const device = devices.find((d: any) => d.maxOutputChannels > 0);
      
      if (!device) {
        throw new Error('No audio output device found');
      }

      // Create audio output using the correct naudiodon API
      this.audioStream = (AudioOutput as any).AudioIO({
        outOptions: {
          deviceId: device.id,
          sampleRate: SAMPLE_RATE,
          channelCount: CHANNELS,
          sampleFormat: 16, // 16-bit audio
          closeOnError: false // Don't close on underflow errors
        }
      });

      this.audioStream.on('error', (err: any) => {
        console.error('Audio streaming error:', err);
      });

      this.audioStream.on('drain', () => {
        console.log('Audio buffer drained');
      });

      this.audioStream.on('close', () => {
        console.log('Audio stream closed');
      });

      this.audioStream.start();
      console.log(`Real-time audio streaming initialized: ${SAMPLE_RATE}Hz, ${CHANNELS} channel(s), ${BITS_PER_SAMPLE}-bit`);
      console.log(`Audio device: ${device.name} (ID: ${device.id})`);

      return true;
    } catch (error) {
      console.error("Failed to initialize audio streaming:", error);
      return false;
    }
  }

  /**
   * Closes the WebSocket connection and stops audio playback.
   */
  public close(): void {
    this.isClosingIntentionally = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.isAuthenticated = false;
    
    // Stop audio streaming
    if (this.audioStream) {
      this.audioStream.end();
      this.audioStream = null;
    }
    
    // Reset audio buffer
    this.audioBuffer = [];
    this.isPlaying = false;
    
    // Close WAV writer if open
    if (this.wavWriter) {
      this.wavWriter.end();
      this.wavWriter = null;
    }
  }

  /**
   * Runs a simple test: connect, send text, receive and play audio.
   * @param {string} text - The text to convert to speech.
   * @returns {Promise<boolean>} True if successful.
   */
  public async runSimpleTest(text?: string): Promise<boolean> {
    const testText = text || "Hello, this is a test of the text-to-speech system.";
    
    // Reset state
    this.chunksReceived = 0;
    this.totalBytes = 0;
    this.generationComplete = false;
    this.audioChunksForStorage = [];

    // Initialize audio if playback is enabled
    if (this.options.enablePlayback) {
      if (!this.initAudio()) {
        console.error("Failed to initialize audio - cannot play audio");
        return false;
      }
    }

    // Initialize WAV writer if saving audio
    if (this.options.saveAudioPath) {
      this.initWavWriter();
    }

    try {
      // Connect to server
      await this.connect();
      console.log("Connected and authenticated successfully");

      // Wait a moment for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Send speak request (only if we didn't already send one during authentication)
      if (!this.options.text && this.sendSpeakRequest(testText)) {
        console.log("Speak request sent, waiting for audio chunks...");
      } else if (this.options.text) {
        console.log("Speak request already sent during authentication (text was also sent in auth message), waiting for audio chunks...");
      }
      
      // Wait for audio generation to complete
      const maxTimeout = 300; // 30 seconds max
      let timeoutCount = 0;
      
      while (!this.generationComplete && timeoutCount < maxTimeout) {
        await new Promise(resolve => setTimeout(resolve, 100));
        timeoutCount++;
      }
      
      if (timeoutCount >= maxTimeout) {
        console.warn("Timeout waiting for audio completion");
      } else {
        console.log("Audio generation completed");
      }
      
      // Wait a bit for audio streaming to finish
      if (this.options.enablePlayback && this.audioStream) {
        console.log("Waiting for audio streaming to finish...");
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for audio to finish
      }
    } catch (error) {
      console.error("Error during TTS test:", error);
      return false;
    } finally {
      this.close();
    }

    return true;
  }

  private handleAudioChunk(chunk: Buffer): void {
    this.chunksReceived++;
    this.totalBytes += chunk.length;
    
    console.log(`Received audio chunk #${this.chunksReceived}: ${chunk.length} bytes (total: ${this.totalBytes.toLocaleString()} bytes)`);
    
    // Store audio chunk for file saving
    this.audioChunksForStorage.push(chunk);
    
    // Write to WAV file if saving
    if (this.wavWriter) {
      this.wavWriter.write(chunk);
    }
    
    // Add to audio buffer for playback
    if (this.options.enablePlayback) {
      this.audioBuffer.push(chunk);
      
      // Start playback if we have enough buffered chunks
      if (this.audioBuffer.length >= MIN_AUDIO_BUFFER_SIZE && !this.isPlaying) {
        console.log(`Starting audio playback with ${this.audioBuffer.length} buffered chunks`);
        this.startAudioPlayback();
      }
    }

    // Call user callback
    this.options.onAudioChunk?.(chunk);
  }

  private startAudioPlayback(): void {
    if (!this.options.enablePlayback || !this.audioStream || this.isPlaying) {
      return;
    }
    
    this.isPlaying = true;
    this.playAudioBuffer();
  }

  private async playAudioBuffer(): Promise<void> {
    if (!this.audioStream) return;
    
    try {
      console.log("Starting audio playback...");
      
      // Play chunks with proper timing
      let chunkIndex = 0;
      
      const playNextChunk = () => {
        if (chunkIndex < this.audioBuffer.length && this.audioStream) {
          const chunk = this.audioBuffer[chunkIndex];
          
          try {
            const bytesWritten = this.audioStream.write(chunk);
            console.log(`Playing chunk ${chunkIndex + 1}/${this.audioBuffer.length} (${bytesWritten} bytes written)`);
            chunkIndex++;
            
            // Calculate delay based on chunk size and sample rate
            // Use fixed chunk size (4096 bytes) for consistent timing, like read_play.ts
            const chunkSize = 4096;
            const samplesPerChunk = chunkSize / (BITS_PER_SAMPLE / 8) / CHANNELS;
            const chunkDuration = samplesPerChunk / SAMPLE_RATE;
            const delayMs = Math.max(1, chunkDuration * 900); // 90% of chunk duration
            
            setTimeout(playNextChunk, delayMs);
          } catch (error) {
            console.error('Error playing audio chunk:', error);
          }
        } else if (this.generationComplete && chunkIndex >= this.audioBuffer.length) {
          console.log('Audio playback completed');
          this.isPlaying = false;
          // Don't end the stream immediately - let it flush naturally
          // The stream will be closed in the close() method
        } else if (!this.generationComplete) {
          // Wait for more chunks
          setTimeout(playNextChunk, 10);
        }
      };
      
      // Start playback
      playNextChunk();
      
    } catch (error) {
      console.error("Error during audio playback:", error);
      this.isPlaying = false;
    }
  }

  private handleJsonMessage(msg: any): void {
    const messageType = msg.type || "unknown";
    console.debug(`Received JSON message: ${messageType}`);
    
    switch (messageType) {
      case "server_ready":
        console.log("Server confirmed ready for TTS");
        break;
        
      case "audio_complete":
        console.log(`Audio generation completed! Received ${this.chunksReceived} chunks, ${this.totalBytes.toLocaleString()} total bytes`);
        this.generationComplete = true;
        
        // Close WAV writer if open
        if (this.wavWriter) {
          this.wavWriter.end();
          this.wavWriter = null;
          console.log(`Audio saved to: ${this.options.saveAudioPath}`);
        }
        
        this.options.onAudioComplete?.();
        this.emit("audioComplete");
        break;
        
      case "error":
        const errorMsg = msg.message || "Unknown error";
        console.error(`Server error: ${errorMsg}`);
        this.emit("error", new Error(errorMsg));
        break;
        
      case "stop_confirmed":
        console.log(`Stop confirmed: ${msg.message || "Generation stopped"}`);
        break;
        
      default:
        console.debug(`Received message type '${messageType}':`, msg);
    }
  }


  private initWavWriter(): void {
    if (!this.options.saveAudioPath) return;
    
    try {
      // Ensure directory exists
      const dir = path.dirname(this.options.saveAudioPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      this.wavWriter = new (WavWriter as any).Writer({
        sampleRate: SAMPLE_RATE,
        channels: CHANNELS,
        bitDepth: BITS_PER_SAMPLE
      });
      
      const writeStream = fs.createWriteStream(this.options.saveAudioPath);
      this.wavWriter.pipe(writeStream);
      
      console.log(`WAV writer initialized for: ${this.options.saveAudioPath}`);
    } catch (error) {
      console.error("Failed to initialize WAV writer:", error);
    }
  }

  /**
   * Gets the raw audio data that was received during generation.
   * @returns {Buffer} The combined audio data.
   */
  public getStoredAudioData(): Buffer {
    return Buffer.concat(this.audioChunksForStorage);
  }

  /**
   * Gets information about the received audio.
   * @returns {object} Audio information including chunks count, total bytes, duration, etc.
   */
  public getAudioInfo(): {
    chunksCount: number;
    totalBytes: number;
    durationSeconds: number;
    sampleRate: number;
    channels: number;
    bitsPerSample: number;
  } {
    const totalBytes = this.audioChunksForStorage.reduce((sum, chunk) => sum + chunk.length, 0);
    return {
      chunksCount: this.audioChunksForStorage.length,
      totalBytes: totalBytes,
      durationSeconds: totalBytes / (SAMPLE_RATE * CHANNELS * BYTES_PER_SAMPLE),
      sampleRate: SAMPLE_RATE,
      channels: CHANNELS,
      bitsPerSample: BITS_PER_SAMPLE
    };
  }

  // Event emitter type definitions
  on(event: 'audioComplete', listener: () => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
  on(event: 'audioChunk', listener: (chunk: Buffer) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}
