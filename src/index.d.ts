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
