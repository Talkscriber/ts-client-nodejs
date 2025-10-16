import { TalkscriberBase, TalkscriberMessage } from './TalkscriberBase.js';
export { TalkscriberOptions } from './TalkscriberBase.js';

/**
 * Browser-compatible TalkscriberTranscriptionService class for real-time audio transcription.
 */
export class TalkscriberTranscriptionService extends TalkscriberBase {
  private ws: WebSocket | null = null;

  protected generateUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.options.endpoint);
      let authResponseReceived = false;

      this.ws.onopen = () => {
        console.log("STT -> Talkscriber connection opened");
        this.ws!.send(JSON.stringify(this.getConnectionConfig()));
      };

      this.ws.onmessage = (event: MessageEvent) => {
        const msg: TalkscriberMessage = JSON.parse(event.data);
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
      };

      this.ws.onerror = () => {
        const error = new Error("WebSocket connection failed");
        console.error(error.message);
        this.close();
        reject(error);
      };

      this.ws.onclose = (event: CloseEvent) => {
        if (event.code === 1000 && !this.isAuthenticated) {
          const error = new Error("Authentication failed. Please check your API key.");
          console.error(error.message);
          reject(error);
        } else if (event.code !== 1000 && !authResponseReceived) {
          const error = new Error(`Connection closed unexpectedly (Code: ${event.code})`);
          console.error(error.message);
          reject(error);
        }
      };

      setTimeout(() => {
        if (!authResponseReceived) {
          const error = new Error("Connection timed out. No response from server.");
          console.error(error.message);
          this.close();
          reject(error);
        }
      }, 10000);
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
