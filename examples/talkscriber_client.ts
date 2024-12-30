import * as fs from 'fs';
import { decode } from 'wav-decoder';
import { TalkscriberTranscriptionService } from '../src/TalkscriberTranscriptionService';

const audioFilePath = './examples/sample.wav';

// Function to decode WAV file
async function decodeWavFile(filePath: string): Promise<[Float32Array, number]> {
    const buffer = fs.readFileSync(filePath);
    const audioData = await decode(buffer);
    
    console.log(`Audio format: ${audioData.sampleRate}Hz, ${audioData.channelData.length} channel(s), ${audioData.channelData[0].length} samples`);

    // Verify format meets requirements
    if (audioData.channelData.length !== 1) {
        throw new Error(`Invalid audio format. Expected: mono`);
    }

    return [audioData.channelData[0], audioData.sampleRate];
}

// Function to mimic stream audio data
async function streamAudioData(audioData: Float32Array, chunkSize: number, sampleRate: number) {
    for (let i = 0; i < audioData.length; i += chunkSize) {
        const chunk = audioData.slice(i, Math.min(i + chunkSize, audioData.length));
        // Convert Float32Array to base64 string
        talkscriber.send(chunk, sampleRate);
        // Wait ~64ms between chunks (simulating 16kHz streaming)
        // calculate the best chunk wait based on the sample rate
        const chunkWait = 1000 / sampleRate * chunkSize;
        await new Promise(resolve => setTimeout(resolve, chunkWait));
    }
}

// Create TalkscriberTranscriptionService instance
const talkscriber = new TalkscriberTranscriptionService({
    apiKey: 'YOUR_API_KEY_HERE', // Replace with your actual Talkscriber API key
    onTranscription: (text: string) => {
        console.log('Transcription:', text);
    },
    onUtterance: (text: string) => {
        console.log('Utterance:', text);
    }
});

// Process and stream the audio
(async () => {
    try {
        await talkscriber.connect();
        console.log('Connected and authenticated successfully');
        const [audioData, sampleRate] = await decodeWavFile(audioFilePath);
        await streamAudioData(audioData, 4096, sampleRate);
    } catch (err) {
        console.error('Failed to process audio:', err);
    }
})();

// Handle cleanup
process.on('SIGINT', () => {
    talkscriber.close();
    process.exit();
});
