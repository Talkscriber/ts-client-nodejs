import WebSocket from "ws";
import { randomUUID } from "node:crypto";
import { TalkscriberBase, TalkscriberMessage } from './TalkscriberBase.js';
export { TalkscriberOptions } from './TalkscriberBase.js';

/**
 * Node.js TalkscriberTranscriptionService class for real-time audio transcription.
 */
export class TalkscriberTranscriptionService extends TalkscriberBase {
  private ws: WebSocket | null = null;

  protected generateUID(): string {
    return randomUUID();
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.options.endpoint);
      let authResponseReceived = false;

      this.ws.on("open", () => {
        console.log("STT -> Talkscriber connection opened");
        this.ws!.send(JSON.stringify(this.getConnectionConfig()));
      });

      this.ws.on("message", (unparsedMessage: string) => {
        const msg: TalkscriberMessage = JSON.parse(unparsedMessage);
        authResponseReceived = true;

        if (msg.status === "ERROR" && msg.message === "UNAUTHORIZED") {
          const error = new Error("Authentication failed. Please check your API key.");
          console.error(error.message);
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
          console.error(error.message);
          this.close();
          reject(error);
          return;
        }

        this.handleMessage(msg);
      });

      this.ws.on("error", (error: Error) => {
        console.error("STT -> Talkscriber error", error);
        this.close();
        reject(error);
      });

      this.ws.on("close", (code: number) => {
        if (code === 1000 && !this.isAuthenticated) {
          const error = new Error("Authentication failed. Please check your API key.");
          console.error(error.message);
          reject(error);
        } else if (code !== 1000 && !authResponseReceived) {
          const error = new Error(`Connection closed unexpectedly (Code: ${code})`);
          console.error(error.message);
          reject(error);
        }
      });

      setTimeout(() => {
        if (!authResponseReceived) {
          const error = new Error("Connection timed out. No response from server.");
          console.error(error.message);
          this.close();
          reject(error);
        }
      }, 5000);
    });
  }

  public send(payload: Float32Array, sampleRate: number): void {
    if (!this.isAuthenticated) {
      throw new Error("Not authenticated. Call connect() first.");
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const resampledData = this.resampleTo16kHz(payload, sampleRate);
      this.ws.send(resampledData.buffer);
    } else {
      throw new Error("WebSocket is not open. Call connect() first.");
    }
  }

  public isConnected(): boolean {
    return this.isAuthenticated && this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isAuthenticated = false;
  }
}
