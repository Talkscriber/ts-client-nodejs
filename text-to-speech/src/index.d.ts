import { EventEmitter } from "events";

export interface TalkScriberTTSOptions {
  apiKey: string;
  speakerName?: string;
  endpoint?: string;
  enablePlayback?: boolean;
  saveAudioPath?: string;
  onAudioChunk?: (chunk: Buffer) => void;
  onAudioComplete?: () => void;
  onError?: (error: Error) => void;
}

export class TalkScriberTTSService extends EventEmitter {
  constructor(options: TalkScriberTTSOptions);
  
  /**
   * Connects to the TalkScriber TTS service and authenticates.
   * @returns {Promise<void>} A promise that resolves when connected and authenticated.
   */
  connect(): Promise<void>;

  /**
   * Sends a speak request to the TTS service.
   * @param text - The text to convert to speech.
   * @param speakerName - Optional speaker name (overrides constructor setting).
   * @returns {boolean} True if request sent successfully.
   */
  sendSpeakRequest(text: string, speakerName?: string): boolean;

  /**
   * Initializes audio playback system.
   * @returns {boolean} True if audio initialized successfully.
   */
  initAudio(): boolean;
  
  /**
   * Closes the WebSocket connection and stops audio playback.
   */
  close(): void;

  /**
   * Runs a simple test: connect, send text, receive and play audio.
   * @param text - The text to convert to speech.
   * @returns {Promise<boolean>} True if successful.
   */
  runSimpleTest(text?: string): Promise<boolean>;

  /**
   * Gets the raw audio data that was received during generation.
   * @returns {Buffer} The combined audio data.
   */
  getStoredAudioData(): Buffer;

  /**
   * Gets information about the received audio.
   * @returns {object} Audio information including chunks count, total bytes, duration, etc.
   */
  getAudioInfo(): {
    chunksCount: number;
    totalBytes: number;
    durationSeconds: number;
    sampleRate: number;
    channels: number;
    bitsPerSample: number;
  };

  on(event: 'audioComplete', listener: () => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
  on(event: 'audioChunk', listener: (chunk: Buffer) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
}
