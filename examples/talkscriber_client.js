"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const wav_decoder_1 = require("wav-decoder");
const ts_client_1 = require("@talkscriber-npm/ts-client");
const audioFilePath = './examples/sample.wav';
async function decodeWavFile(filePath) {
    const buffer = fs.readFileSync(filePath);
    const audioData = await (0, wav_decoder_1.decode)(buffer);
    console.log(`Audio format: ${audioData.sampleRate}Hz, ${audioData.channelData.length} channel(s), ${audioData.channelData[0].length} samples`);
    if (audioData.channelData.length !== 1) {
        throw new Error(`Invalid audio format. Expected: mono`);
    }
    return [audioData.channelData[0], audioData.sampleRate];
}
async function streamAudioData(audioData, chunkSize, sampleRate, talkscriber) {
    for (let i = 0; i < audioData.length; i += chunkSize) {
        const chunk = audioData.slice(i, Math.min(i + chunkSize, audioData.length));
        talkscriber.send(chunk, sampleRate);
        await new Promise(resolve => setTimeout(resolve, 1000 / sampleRate * chunkSize));
    }
}
async function main() {
    const talkscriber = new ts_client_1.TalkscriberTranscriptionService({
        apiKey: '<YOUR_API_KEY>',
        language: 'en',
        onTranscription: (text) => console.log('Transcription:', text),
        onUtterance: (text) => console.log('Utterance:', text)
    });
    try {
        console.log('Connecting to Talkscriber service...');
        await talkscriber.connect();
        console.log('Connected and authenticated successfully');
        const [audioData, sampleRate] = await decodeWavFile(audioFilePath);
        await streamAudioData(audioData, 4096, sampleRate, talkscriber);
    }
    catch (err) {
        console.error('Error:', err instanceof Error ? err.message : String(err));
    }
    finally {
        talkscriber.close();
    }
}
main().catch(console.error);
//# sourceMappingURL=talkscriber_client.js.map