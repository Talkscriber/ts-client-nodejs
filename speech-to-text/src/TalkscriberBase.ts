export interface TalkscriberOptions {
  apiKey: string;
  language?: string;
  endpoint?: string;
  onTranscription?: (text: string) => void;
  onUtterance?: (text: string) => void;
  enableTurnDetection?: boolean;
  turnDetectionTimeout?: number;
}

export interface TalkscriberMessage {
  session_id?: string;
  status?: "WAIT" | "ERROR";
  message?: "DISCONNECT" | "SERVER_READY" | "UNAUTHORIZED";
  language?: string;
  detected_language?: string;
  language_confidence?: number;
  segments?: { text: string; EOS?: boolean }[];
}

/**
 * Shared base logic for Talkscriber transcription service
 */
export abstract class TalkscriberBase {
  protected finalResult: string = "";
  protected uid: string;
  protected options: Required<TalkscriberOptions>;
  protected isAuthenticated: boolean = false;

  constructor(options: TalkscriberOptions) {
    this.options = {
      apiKey: options.apiKey,
      endpoint: options.endpoint || "wss://api.talkscriber.com:9090",
      language: options.language || "en",
      enableTurnDetection: options.enableTurnDetection ?? false,
      turnDetectionTimeout: options.turnDetectionTimeout ?? 0.6,
      onTranscription: options.onTranscription || (() => {}),
      onUtterance: options.onUtterance || (() => {})
    };
    this.uid = this.generateUID();
  }

  protected abstract generateUID(): string;

  protected getConnectionConfig() {
    return {
      uid: this.uid,
      multilingual: false,
      language: this.options.language,
      task: "transcribe",
      auth: this.options.apiKey,
      enable_turn_detection: this.options.enableTurnDetection,
      turn_detection_timeout: this.options.turnDetectionTimeout
    };
  }

  protected handleMessage(msg: TalkscriberMessage): void {
    if (msg.session_id && this.uid !== msg.session_id) {
      this.uid = msg.session_id;
    }
    
    if (!msg.segments?.length) return;

    this.finalResult = "";
    msg.segments.forEach((segment) => {
      this.options.onUtterance?.(segment.text);
      this.finalResult += ` ${segment.text}`;
      
      if (segment.EOS) {
        console.log("[INFO]: --------End of speech detected----------");
      }
    });

    const combinedResult = this.finalResult.trim();
    if (combinedResult) {
      this.options.onTranscription?.(combinedResult);
    }
  }

  protected resampleTo16kHz(audioData: Float32Array, originalSampleRate: number): Float32Array {
    const targetSampleRate = 16000;
    
    if (originalSampleRate === targetSampleRate) {
      return audioData;
    }
    
    const ratio = originalSampleRate / targetSampleRate;
    const newLength = Math.round(audioData.length / ratio);
    const resampledData = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const index = i * ratio;
      const leftIndex = Math.floor(index);
      const rightIndex = Math.min(leftIndex + 1, audioData.length - 1);
      const fraction = index - leftIndex;
      
      resampledData[i] = audioData[leftIndex] + (audioData[rightIndex] - audioData[leftIndex]) * fraction;
    }
    
    return resampledData;
  }

  public abstract connect(): Promise<void>;
  public abstract send(payload: Float32Array, sampleRate: number): void;
  public abstract close(): void;
  public abstract isConnected(): boolean;
}

