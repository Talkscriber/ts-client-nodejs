import { TalkscriberTranscriptionService } from '../src/TalkscriberTranscriptionService';
import * as fs from 'fs';
import * as wavDecoder from 'wav-decoder';

async function main() {
    // Initialize the TalkscriberTranscriptionService
    const service = new TalkscriberTranscriptionService({
        apiKey: 'ALLbolf7H9nAo88ypkfwYLytOH9fosKMXpZcc-uZlhA',
        language: 'en',
        onTranscription: (text) => console.log('Transcription:', text),
        onUtterance: (text) => console.log('Utterance:', text)
    });

    // Read and decode a WAV file
    const buffer = fs.readFileSync('./examples/sample.wav');
    const decodedAudio = await wavDecoder.decode(buffer);

    // Send the audio data to the service
    service.send(decodedAudio.channelData[0], decodedAudio.sampleRate);

    console.log('Audio data sent to the service');

    // Listen for transcription events
    service.on('transcription', (text) => {
        console.log('Final transcription:', text);
    });

    // Listen for error events
    service.on('error', (error) => {
        console.error('Error:', error);
    });

    // Close the service when done
    // Note: In a real application, you'd want to close the service after all processing is complete
    setTimeout(() => {
        service.close();
        console.log('Service closed');
    }, 5000);
}

main().catch(console.error);
