import { EventEmitter } from "events";
import WebSocket from "ws";
import { randomUUID } from "node:crypto";

interface TalkscriberOptions {
  apiKey: string;
  language?: "en" | "ar";
  onTranscription?: (text: string) => void;
  onUtterance?: (text: string) => void;
}

/**
 * TalkscriberTranscriptionService class for real-time audio transcription.
 * @extends EventEmitter
 */
export class TalkscriberTranscriptionService extends EventEmitter {
  private ws: WebSocket | null = null;
  private finalResult: string = "";
  private speechFinal: boolean = false;
  private uid: string;
  private options: TalkscriberOptions;
  private isAuthenticated: boolean = false;

  /**
   * Creates a new TalkscriberTranscriptionService instance.
   * @param {TalkscriberOptions} options - Configuration options for the service.
   */
  constructor(options: TalkscriberOptions) {
    super();
    this.options = options;
    this.uid = randomUUID();
  }

  /**
   * Connects to the Talkscriber service and authenticates.
   * @returns {Promise<void>} A promise that resolves when connected and authenticated.
   */
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket("wss://api.talkscriber.com:9090");

      this.ws.on("open", () => {
        console.log("STT -> Talkscriber connection opened");
        this.ws!.send(JSON.stringify({
          uid: this.uid,
          multilingual: false,
          language: this.options.language || "en",
          task: "transcribe",
          auth: this.options.apiKey,
        }));
      });

      let authResponseReceived = false;

      this.ws.on("message", (unparsedMessage: string) => {
        const msg = JSON.parse(unparsedMessage) as {
          session_id: string;
          status: "WAIT" | "ERROR";
          message: "DISCONNECT" | "SERVER_READY" | "UNAUTHORIZED";
          language: string;
          detected_language: string;
          language_confidence: number;
          segments: { text: string }[];
        };

        authResponseReceived = true;

        if (msg.status === "ERROR" && msg.message === "UNAUTHORIZED") {
          const error = new Error("Authentication failed. Please check your API key.");
          console.error("Authentication failed. Please check your API key.");
          this.emit("error", error);
          this.close();
          reject(error);
          return;
        }

        if (msg.message === "SERVER_READY") {
          this.isAuthenticated = true;
          console.log("Authentication successful");
          resolve();
          return;
        }

        if (msg.status === "ERROR") {
          const error = new Error(`Server error: ${msg.message}`);
          console.error(`Server error: ${msg.message}`);
          this.emit("error", error);
          this.close();
          reject(error);
          return;
        }

        this.handleMessage(msg);
      });

      this.ws.on("error", (error: Error) => {
        console.error("STT -> Talkscriber error", error);
        this.emit("error", error);
        this.close();
        reject(error);
      });

      this.ws.on("close", (code: number, reason: string) => {
        let errorMessage = "Connection closed unexpectedly.";
        if (code === 1000 && !this.isAuthenticated) {
          errorMessage = "Authentication failed. Please check your API key.";
          console.error(errorMessage);
          const error = new Error(errorMessage);
          this.emit("error", error);
          reject(error);
        } else if (code === 1000) {
          errorMessage = "Connection closed normally.";
          console.log(errorMessage);
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

      // Reduce timeout to 5 seconds
      setTimeout(() => {
        if (!authResponseReceived) {
          const error = new Error("Connection timed out. No response from server.");
          console.error("Connection timed out. No response from server.");
          this.emit("error", error);
          this.close();
          reject(error);
        }
      }, 5000); // 5 seconds timeout
    });
  }

  private handleMessage(msg: any) {
    if (this.uid !== msg.session_id) this.uid = msg.session_id;
    if (!msg.segments?.length) return;

    msg.segments.forEach((segment: { text: string }) => {
      this.options.onUtterance?.(segment.text);
      this.finalResult += ` ${segment.text}`;
    });

    this.speechFinal = true;
    this.options.onTranscription?.(this.finalResult.trim());
    this.emit("transcription", this.finalResult.trim());
    this.finalResult = "";
  }

  /**
   * Sends audio data to the transcription service.
   * @param {Float32Array} payload - The audio data to send.
   * @param {number} sampleRate - The sample rate of the audio data.
   */
  public send(payload: Float32Array, sampleRate: number): void {
    if (!this.isAuthenticated) {
      throw new Error("Not authenticated. Call connect() first.");
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const resampledData = resampleTo16kHZ(payload, sampleRate);
      this.ws.send(resampledData.buffer);
    } else {
      throw new Error("WebSocket is not open. Call connect() first.");
    }
  }

  /**
   * Closes the WebSocket connection to the transcription service.
   */
  public close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isAuthenticated = false;
  }
}

function resampleTo16kHZ(audioData: Float32Array, origSampleRate = 44100): Float32Array {
  const targetSampleRate = 16000;
  const data = new Float32Array(audioData.buffer);
  const targetLength = Math.round(data.length * (targetSampleRate / origSampleRate));
  const resampledData = new Float32Array(targetLength);
  const springFactor = (data.length - 1) / (targetLength - 1);

  resampledData[0] = data[0];
  resampledData[targetLength - 1] = data[data.length - 1];

  for (let i = 1; i < targetLength - 1; i++) {
    const index = i * springFactor;
    const leftIndex = Math.floor(index);
    const rightIndex = Math.ceil(index);
    const fraction = index - leftIndex;
    resampledData[i] = data[leftIndex] + (data[rightIndex] - data[leftIndex]) * fraction;
  }

  return resampledData;
}
