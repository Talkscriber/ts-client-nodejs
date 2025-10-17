import { EventEmitter } from "events";

export interface TalkscriberOptions {
  apiKey: string;
  language?: string;
  endpoint?: string;
  onTranscription?: (text: string) => void;
  onUtterance?: (text: string) => void;
  enableTurnDetection?: boolean;
  turnDetectionTimeout?: number;
}

export class TalkscriberTranscriptionService extends EventEmitter {
  constructor(options: TalkscriberOptions);
  
  /**
   * Connects to the Talkscriber service and authenticates.
   * @returns {Promise<void>} A promise that resolves when connected and authenticated.
   */
  connect(): Promise<void>;

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
  on(event: 'endOfSpeech', listener: (text: string) => void): this;
}
