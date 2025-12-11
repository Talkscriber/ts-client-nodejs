import { TalkScriberTTSService } from '../src/TalkScriberTTSService';

/**
 * Countdown helper function to show what test is about to run
 */
async function countdown(testName: string, seconds: number = 3): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log(`⏱️  Preparing to run: ${testName}`);
    console.log('='.repeat(80));

    for (let i = seconds; i > 0; i--) {
        console.log(`\n⏳ Starting in ${i} second${i > 1 ? 's' : ''}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🚀 Starting test now!\n');
}

async function main() {
    console.log('\n🎙️  TalkScriber TTS Client - Main Test');
    console.log('📝 Testing: Female voice with Maya generation config');

    await countdown('Main TTS Test - Female Voice with Custom Config', 3);

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

// Example with different usage patterns
async function demonstrateUsagePatterns() {
    console.log('\n\n');
    console.log('╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    TalkScriber Usage Pattern Examples                      ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝');

    // ===========================
    // Test 1: Basic usage with playback
    // ===========================
    await countdown('Test 1: Basic Male Voice with Real-time Playback', 3);

    console.log('📋 Test Configuration:');
    console.log('   ├─ Voice: Male, 30s, American accent');
    console.log('   ├─ Playback: Enabled');
    console.log('   ├─ Save to file: Disabled');
    console.log('   └─ Generation config: Default\n');

    const basicClient = new TalkScriberTTSService({
        apiKey: '<YOUR_API_KEY>',
        speakerName: 'Realistic male voice in the 30s age with american accent. Normal pitch, warm timbre, conversational pacing.',
        enablePlayback: true
    });

    try {
        console.log('🔄 Running basic TTS test...');
        await basicClient.runSimpleTest("This is a basic TTS example with real-time playback.");
        console.log('✅ Test 1 completed successfully!\n');
    } catch (error) {
        console.error('❌ Test 1 failed:', error);
    }

    // Wait between tests to ensure cleanup
    console.log('⏸️  Waiting 2 seconds before next test...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ===========================
    // Test 2: Silent mode (no playback, save to file)
    // ===========================
    await countdown('Test 2: Young British Female Voice - Silent Mode (Save Only)', 3);

    console.log('📋 Test Configuration:');
    console.log('   ├─ Voice: Female, 20s, British accent, Energetic');
    console.log('   ├─ Playback: Disabled (Silent mode)');
    console.log('   ├─ Save to file: ./output/silent_audio.wav');
    console.log('   └─ Generation config: Default\n');

    const silentClient = new TalkScriberTTSService({
        apiKey: '<YOUR_API_KEY>',
        speakerName: 'Realistic female voice in the 20s age with british accent. High pitch, bright timbre, energetic pacing.',
        enablePlayback: false,
        saveAudioPath: './output/silent_audio.wav'
    });

    try {
        console.log('🔄 Running silent mode test...');
        await silentClient.runSimpleTest("This audio will be saved but not played.");
        console.log('✅ Test 2 completed - audio saved to file\n');
    } catch (error) {
        console.error('❌ Test 2 failed:', error);
    }

    // Wait between tests to ensure cleanup
    console.log('⏸️  Waiting 2 seconds before next test...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ===========================
    // Test 3: Both playback and file saving with custom generation config
    // ===========================
    await countdown('Test 3: Deep Australian Male Voice - Full Mode with Custom Config', 3);

    console.log('📋 Test Configuration:');
    console.log('   ├─ Voice: Male, 40s, Australian accent, Deep & Slow');
    console.log('   ├─ Playback: Enabled');
    console.log('   ├─ Save to file: ./output/full_audio.wav');
    console.log('   └─ Generation config:');
    console.log('       ├─ temperature: 0.8');
    console.log('       ├─ top_p: 0.95');
    console.log('       └─ top_k: 100\n');

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
        console.log('🔄 Running full mode test with custom generation config...');
        await fullClient.runSimpleTest("This audio will be played and saved to file with custom voice generation settings.");
        console.log('✅ Test 3 completed - audio played and saved\n');
    } catch (error) {
        console.error('❌ Test 3 failed:', error);
    }

    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                     All Usage Pattern Tests Completed!                     ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');
}

// Main execution
async function runAllTests() {
    console.log('\n🎯 TalkScriber TTS Client Test Suite');
    console.log('=====================================\n');

    // Run main test
    await main();

    // Ask if user wants to run additional usage pattern tests
    console.log('\n💡 Tip: Uncomment the line below in the code to run additional usage pattern examples:');
    console.log('   // await demonstrateUsagePatterns();\n');

    // Uncomment the line below to run all usage pattern examples
    // await demonstrateUsagePatterns();
}

// Run the tests
runAllTests().catch(console.error);
