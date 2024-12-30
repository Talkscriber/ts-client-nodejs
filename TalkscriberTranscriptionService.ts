import { EventEmitter } from "events";
import WebSocket from "ws";
import { randomUUID } from "node:crypto";

interface TalkscriberOptions {
  apiKey: string;
  language?: "en" | "ar";
  onTranscription?: (text: string) => void;
  onUtterance?: (text: string) => void;
}

export class TalkscriberTranscriptionService extends EventEmitter {
  private ws: WebSocket;
  private finalResult: string = "";
  private speechFinal: boolean = false;
  private uid: string;
  private options: TalkscriberOptions;

  constructor(options: TalkscriberOptions) {
    super();
    this.options = options;
    this.uid = randomUUID();
    this.ws = new WebSocket("wss://api.talkscriber.com:9090");
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.ws.on("open", this.onOpen.bind(this));
    this.ws.on("message", this.onMessage.bind(this));
    this.ws.on("error", this.onError.bind(this));
  }

  private onOpen() {
    console.log("STT -> Talkscriber connection opened");
    this.ws.send(JSON.stringify({
      uid: this.uid,
      multilingual: false,
      language: this.options.language || "en",
      task: "transcribe",
      auth: this.options.apiKey,
    }));
  }

  private onMessage(unparsedMessage: string) {
    const msg = JSON.parse(unparsedMessage) as {
      session_id: string;
      status: "WAIT";
      message: "DISCONNECT" | "SERVER_READY";
      language: string;
      detected_language: string;
      language_confidence: number;
      segments: { text: string }[];
    };

    if (this.uid !== msg.session_id) this.uid = msg.session_id;
    if (!msg.segments?.length) return;

    msg.segments.forEach((segment) => {
      this.options.onUtterance?.(segment.text);
      this.finalResult += ` ${segment.text}`;
    });

    this.speechFinal = true;
    this.options.onTranscription?.(this.finalResult.trim());
    this.emit("transcription", this.finalResult.trim());
    this.finalResult = "";
  }

  private onError(error: Error) {
    console.error("STT -> Talkscriber error", error);
    this.emit("error", error);
  }

  public send(payload: Float32Array, sampleRate: number) {
    if (this.ws.readyState === WebSocket.OPEN) {
      const resampledData = resampleTo16kHZ(payload, sampleRate);
      this.ws.send(resampledData.buffer);
    }
  }

  public close() {
    return this.ws.close();
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
