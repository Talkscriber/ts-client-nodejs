import { TalkScriberTTSService } from '../src/TalkScriberTTSService';

async function main() {
    console.log('\n🎙️  TalkScriber TTS Client - Main Test');
    console.log('📝 Testing: Female voice with Maya generation config');

    const ttsClient = new TalkScriberTTSService({
        apiKey: 'hrmz9MfyUsHHBN0qdAYiWSqEJimrQ6oqkRTCxOVVH9k',
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
            console.log(`📦 Received audio chunk: ${chunk.length} bytes`);
        },
        onAudioComplete: () => {
            console.log('✅ Audio generation completed!');
        },
        onError: (error: Error) => {
            console.error('❌ TTS Error:', error.message);
        }
    });

    // Listen for events
    ttsClient.on('audioComplete', () => {
        console.log('🎉 Audio generation finished');
    });

    ttsClient.on('error', (error: Error) => {
        console.error('❌ TTS Error:', error.message);
    });

    try {
        console.log('🔄 Starting TTS test...');
        const success = await ttsClient.runSimpleTest("Hello, this is a test of the text-to-speech system. The audio should start playing in less than 0.1 seconds with ultra-low latency streaming.");

        if (success) {
            console.log('\n✅ TTS test completed successfully!');

            // Get audio information
            const audioInfo = ttsClient.getAudioInfo();
            console.log('\n📊 Audio Information:');
            console.log(`   ├─ Chunks received: ${audioInfo.chunksCount}`);
            console.log(`   ├─ Total bytes: ${audioInfo.totalBytes.toLocaleString()}`);
            console.log(`   ├─ Duration: ${audioInfo.durationSeconds.toFixed(2)} seconds`);
            console.log(`   ├─ Sample rate: ${audioInfo.sampleRate}Hz`);
            console.log(`   ├─ Channels: ${audioInfo.channels}`);
            console.log(`   └─ Bit depth: ${audioInfo.bitsPerSample}-bit`);
        } else {
            console.error('❌ TTS test failed');
        }
    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    }

    console.log('\n✅ Main test completed!\n');
}

// Main execution
async function runAllTests() {
    console.log('\n🎯 TalkScriber TTS Client Test Suite');
    console.log('=====================================\n');

    // Run main test
    await main();

}

// Run the tests
runAllTests().catch(console.error);
