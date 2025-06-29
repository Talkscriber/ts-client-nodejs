import * as fs from 'fs';
import { decode } from 'wav-decoder';
import { TalkscriberTranscriptionService } from '@talkscriber-npm/ts-client';

const audioFilePath = './examples/sample.wav';

async function decodeWavFile(filePath: string): Promise<[Float32Array, number]> {
    const buffer = fs.readFileSync(filePath);
    const audioData = await decode(buffer);
    
    console.log(`Audio format: ${audioData.sampleRate}Hz, ${audioData.channelData.length} channel(s), ${audioData.channelData[0].length} samples`);

    if (audioData.channelData.length !== 1) {
        throw new Error(`Invalid audio format. Expected: mono`);
    }

    return [audioData.channelData[0], audioData.sampleRate];
}

async function streamAudioData(audioData: Float32Array, chunkSize: number, sampleRate: number, talkscriber: TalkscriberTranscriptionService) {
    for (let i = 0; i < audioData.length; i += chunkSize) {
        const chunk = audioData.slice(i, Math.min(i + chunkSize, audioData.length));
        talkscriber.send(chunk, sampleRate);
        await new Promise(resolve => setTimeout(resolve, 1000 / sampleRate * chunkSize));
    }
}

async function main() {
    const talkscriber = new TalkscriberTranscriptionService({
        apiKey: '<YOUR_API_KEY>',
        language: 'en',
        onTranscription: (text: string) => console.log('Transcription:', text),
        onUtterance: (text: string) => console.log('Utterance:', text)
    });

    try {
        console.log('Connecting to Talkscriber service...');
        await talkscriber.connect();
        console.log('Connected and authenticated successfully');
        const [audioData, sampleRate] = await decodeWavFile(audioFilePath);
        await streamAudioData(audioData, 4096, sampleRate, talkscriber);
    } catch (err) {
        console.error('Error:', err instanceof Error ? err.message : String(err));
    } finally {
        talkscriber.close();
    }
}

main().catch(console.error);
