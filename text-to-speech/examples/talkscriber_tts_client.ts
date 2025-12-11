import { TalkScriberTTSService } from '../src/TalkScriberTTSService';

async function main() {
    const ttsClient = new TalkScriberTTSService({
        apiKey: '<YOUR_API_KEY>',
        speakerName: 'Realistic female voice in the 30s age with american accent. Normal pitch, warm timbre, conversational pacing.',
        text: "Hello, this is a test of the text-to-speech system.",
        enablePlayback: true,
        saveAudioPath: './output/tts_output.wav',
        // Optional: Configure Maya generation parameters
        mayaGenerationConfig: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 50,
            // max_tokens: 1000,
            // repetition_penalty: 1.1
        },
        onAudioChunk: (chunk: Buffer) => {
            console.log(`Received audio chunk: ${chunk.length} bytes`);
        },
        onAudioComplete: () => {
            console.log('Audio generation completed!');
        },
        onError: (error: Error) => {
            console.error('TTS Error:', error.message);
        }
    });

    // Listen for events
    ttsClient.on('audioComplete', () => {
        console.log('Audio generation finished');
    });

    ttsClient.on('error', (error: Error) => {
        console.error('TTS Error:', error.message);
    });

    try {
        console.log('Starting TTS test...');
        const success = await ttsClient.runSimpleTest("Hello, this is a test of the text-to-speech system. The audio should start playing in less than 0.1 seconds with ultra-low latency streaming.");
        
        if (success) {
            console.log('TTS test completed successfully!');
            
            // Get audio information
            const audioInfo = ttsClient.getAudioInfo();
            console.log('Audio Information:');
            console.log(`- Chunks received: ${audioInfo.chunksCount}`);
            console.log(`- Total bytes: ${audioInfo.totalBytes.toLocaleString()}`);
            console.log(`- Duration: ${audioInfo.durationSeconds.toFixed(2)} seconds`);
            console.log(`- Sample rate: ${audioInfo.sampleRate}Hz`);
            console.log(`- Channels: ${audioInfo.channels}`);
            console.log(`- Bit depth: ${audioInfo.bitsPerSample}-bit`);
        } else {
            console.error('TTS test failed');
        }
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
    }
}

// Example with different usage patterns
async function demonstrateUsagePatterns() {
    console.log('\n=== Usage Pattern Examples ===\n');

    // 1. Basic usage with playback
    console.log('1. Basic usage with playback:');
    const basicClient = new TalkScriberTTSService({
        apiKey: '<YOUR_API_KEY>',
        speakerName: 'Realistic male voice in the 30s age with american accent. Normal pitch, warm timbre, conversational pacing.',
        enablePlayback: true
    });
    
    try {
        await basicClient.connect();
        basicClient.sendSpeakRequest("This is a basic TTS example with real-time playback.");
        // Wait for completion
        await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
        console.error('Basic client error:', error);
    } finally {
        basicClient.close();
    }

    // 2. Silent mode (no playback, save to file)
    console.log('\n2. Silent mode (save to file only):');
    const silentClient = new TalkScriberTTSService({
        apiKey: '<YOUR_API_KEY>',
        speakerName: 'Realistic female voice in the 20s age with british accent. High pitch, bright timbre, energetic pacing.',
        enablePlayback: false,
        saveAudioPath: './output/silent_audio.wav'
    });
    
    try {
        await silentClient.runSimpleTest("This audio will be saved but not played.");
        console.log('Silent mode completed - audio saved to file');
    } catch (error) {
        console.error('Silent client error:', error);
    }

    // 3. Both playback and file saving with custom generation config
    console.log('\n3. Playback + file saving with custom generation config:');
    const fullClient = new TalkScriberTTSService({
        apiKey: '<YOUR_API_KEY>',
        speakerName: 'Deep male voice in the 40s age with australian accent. Low pitch, rich timbre, slow pacing.',
        enablePlayback: true,
        saveAudioPath: './output/full_audio.wav',
        mayaGenerationConfig: {
            temperature: 0.8,
            top_p: 0.95,
            top_k: 100
        }
    });
    
    try {
        await fullClient.runSimpleTest("This audio will be played and saved to file.");
        console.log('Full mode completed - audio played and saved');
    } catch (error) {
        console.error('Full client error:', error);
    }
}

// Run the main example
main().catch(console.error);

// Uncomment to run usage pattern examples
// demonstrateUsagePatterns().catch(console.error);
