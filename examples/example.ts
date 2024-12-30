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
async function streamAudioData(audioData: Float32Array, chunkSize: number, sampleRate: number, talkscriber: TalkscriberTranscriptionService) {
    for (let i = 0; i < audioData.length; i += chunkSize) {
        const chunk = audioData.slice(i, Math.min(i + chunkSize, audioData.length));
        talkscriber.send(chunk, sampleRate);
        // Wait between chunks (simulating streaming)
        const chunkWait = 1000 / sampleRate * chunkSize;
        await new Promise(resolve => setTimeout(resolve, chunkWait));
    }
}

async function main() {
    // Create TalkscriberTranscriptionService instance
    const talkscriber = new TalkscriberTranscriptionService({
        apiKey: 'YOUR_API_KEY_HERE', // Replace with your actual Talkscriber API key
        language: 'en',
        onTranscription: (text: string) => {
            console.log('Transcription:', text);
        },
        onUtterance: (text: string) => {
            console.log('Utterance:', text);
        }
    });

    // Process and stream the audio
    try {
        const [audioData, sampleRate] = await decodeWavFile(audioFilePath);
        await streamAudioData(audioData, 4096, sampleRate, talkscriber);
    } catch (err) {
        console.error('Failed to process audio:', err);
    } finally {
        // Close the service when done
        setTimeout(() => {
            talkscriber.close();
            console.log('Service closed');
        }, 5000);
    }
}

// Handle cleanup
process.on('SIGINT', () => {
    console.log('Received SIGINT. Exiting...');
    process.exit();
});

main().catch(console.error);
