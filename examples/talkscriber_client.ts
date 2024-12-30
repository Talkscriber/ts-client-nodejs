import * as fs from 'fs';
import { decode } from 'wav-decoder';
import { TalkscriberTranscriptionService } from 'ts-client';

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
        //apiKey: 'YOUR_API_KEY_HERE', // Replace this with your actual Talkscriber API key
        apiKey: 'ALLbolf7H9nAo88ypkfwYLytOH9fosKMXpZcc-uZlhA',
        language: 'en', // This is now optional, 'en' is the default
        endpoint: 'wss://api.talkscriber.com:9090', // This is now optional, the shown value is the default
        onTranscription: (text: string) => {
            console.log('Transcription:', text);
        },
        onUtterance: (text: string) => {
            console.log('Utterance:', text);
        }
    });

    // Process and stream the audio
    try {
        console.log('Connecting to Talkscriber service...');
        await talkscriber.connect();
        console.log('Connected and authenticated successfully');
        const [audioData, sampleRate] = await decodeWavFile(audioFilePath);
        await streamAudioData(audioData, 4096, sampleRate, talkscriber);
    } catch (err) {
        console.error('Error:', err instanceof Error ? err.message : String(err));
        if (err instanceof Error) {
            if (err.message.includes('Authentication failed')) {
                console.error('Please check your API key and try again.');
            } else if (err.message.includes('Connection closed unexpectedly')) {
                console.error('The connection was closed. Please check your internet connection and try again.');
            }
        }
    }
    talkscriber.close();
    process.exit(1);
}

// Handle cleanup
process.on('SIGINT', () => {
    console.log('Received SIGINT. Exiting...');
    process.exit();
});

main().catch(console.error);
