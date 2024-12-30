import "colors";
import { EventEmitter } from "events";
import WebSocket from "ws";
import { randomUUID } from "node:crypto";

interface Agent {
  language: string;
}

interface Integration {
  auth: {
    api_key: string;
  };
}

export class TalkscriberTranscriptionService extends EventEmitter {
  ws: WebSocket;
  finalResult: string;
  speechFinal: boolean;
  agent: Agent | null;
  integration: Integration | null;
  onTranscription: ((text: string) => void) | null;
  onUtterance: ((text: string) => void) | null;
  uid: string;
 
  constructor({
    agent,
    integration,
    onTranscription,
    onUtterance,
  }: {
    agent: Agent | null;
    integration: Integration | null;
    onTranscription: ((text: string) => void) | null;
    onUtterance: ((text: string) => void) | null;
  }) {
    super();
    this.agent = agent;
    this.integration = integration;
    this.onTranscription = onTranscription;
    this.onUtterance = onUtterance;
    this.uid = randomUUID();
 
    this.ws = new WebSocket("wss://api.talkscriber.com:9090");
 
    this.ws.on("open", () => {
      console.log("STT -> Talkscriber connection opened".green);
      this.ws.send(
        JSON.stringify({
          uid: this.uid,
          multilingual: false,
          language: this?.agent?.language === "arabic" ? "ar" : "en",
          task: "transcribe",
          auth: (integration?.auth as any)?.api_key as string,
        })
      );
    });
 
    this.finalResult = "";
    this.speechFinal = false;
 
    this.ws.on("message", (unparsedMessage: string) => {
      let msg = JSON.parse(unparsedMessage) as {
        session_id: string;
        status: "WAIT";
        message: "DISCONNECT" | "SERVER_READY";
        language: string;
        detected_language: string;
        language_confidence: number;
        segments: {
          text: string;
        }[];
      };
 
      console.log({ msg });
 
      if (this.uid !== msg.session_id) this.uid = msg.session_id;
 
      if (!msg.segments?.length) return; // no segments received, ignore the message
 
      msg.segments.forEach((segment) => {
        this.onUtterance?.(segment.text);
        this.finalResult += ` ${segment.text}`;
      });
 
      this.speechFinal = true; // this will prevent a utterance end which shows up after speechFinal from sending another response
      this.onTranscription?.(this.finalResult);
      this.finalResult = "";
    });
 
    this.ws.on("error", (error) => {
      console.error("STT -> Talkscriber error");
      console.error(error);
    });
  }
 
  /**
   * Send the payload to Talkscriber
   * @param {String} payload A base64 MULAW/8000 audio stream
   */
  send(payload: Float32Array, sampleRate: number) {
    if (this.ws.readyState === this.ws.OPEN) {
      const resampledData = resampleTo16kHZ(payload, sampleRate);
 
      this.ws.send(resampledData.buffer);
    }
  }
 
  close() {
    return this.ws.close();
  }
}
 
function resampleTo16kHZ(audioData: Float32Array, origSampleRate = 44100) {
  // Convert the audio data to a Float32Array
  const data = new Float32Array(audioData.buffer);
 
  // Calculate the desired length of the resampled data
  const targetLength = Math.round(data.length * (16000 / origSampleRate));
 
  // Create a new Float32Array for the resampled data
  const resampledData = new Float32Array(targetLength);
 
  // Calculate the spring factor and initialize the first and last values
  const springFactor = (data.length - 1) / (targetLength - 1);
  resampledData[0] = data[0];
  resampledData[targetLength - 1] = data[data.length - 1];
 
  // Resample the audio data
  for (let i = 1; i < targetLength - 1; i++) {
    const index = i * springFactor;
    const leftIndex = Number(Math.floor(index).toFixed());
    const rightIndex = Number(Math.ceil(index).toFixed());
    const fraction = index - leftIndex;
    resampledData[i] =
      data[leftIndex] + (data[rightIndex] - data[leftIndex]) * fraction;
  }
 
  // Return the resampled data
  return resampledData;
}
