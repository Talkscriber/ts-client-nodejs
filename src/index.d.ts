import { EventEmitter } from 'events';

interface TalkscriberOptions {
  apiKey: string;
  language?: "en" | "ar";
  onTranscription?: (text: string) => void;
  onUtterance?: (text: string) => void;
}

declare class TalkscriberTranscriptionService extends EventEmitter {
  constructor(options: TalkscriberOptions);
  send(payload: Float32Array, sampleRate: number): void;
  close(): void;
}

export = TalkscriberTranscriptionService;
import { EventEmitter } from "events";

export interface TalkscriberOptions {
  apiKey: string;
  language?: "en" | "ar";
  onTranscription?: (text: string) => void;
  onUtterance?: (text: string) => void;
}

export class TalkscriberTranscriptionService extends EventEmitter {
  constructor(options: TalkscriberOptions);
  
  /**
   * Sends audio data to the transcription service.
   * @param payload - The audio data to send.
   * @param sampleRate - The sample rate of the audio data.
   */
  send(payload: Float32Array, sampleRate: number): void;
  
  /**
   * Closes the WebSocket connection to the transcription service.
   */
  close(): void;

  on(event: 'transcription', listener: (text: string) => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
}
