# 🎙️ About ts-client-tts

This is the official TypeScript client for TalkScriber Text-to-Speech (TTS), a state-of-the-art TTS platform tailored for conversational AI enterprises. It provides exceptional speech synthesis services with ultra-low latency streaming and a strong emphasis on privacy and security.

# 🚀 Installation and Getting Started

Follow these steps to install and use the ts-client-tts for TalkScriber:

1. 📦 Install the package:
   ```bash
   npm install @talkscriber-npm/ts-client-tts
   ```

2. 📝 In your project, create a new file (e.g., `tts_example.ts`) and add the following code:
   ```typescript
    import { TalkScriberTTSService } from '@talkscriber-npm/ts-client-tts';

    async function main() {
      const ttsClient = new TalkScriberTTSService({
        apiKey: '<YOUR_API_KEY>',
        speakerName: 'Realistic female voice in the 30s age with american accent. Normal pitch, warm timbre, conversational pacing.',
        enablePlayback: true,
        saveAudioPath: './output/audio.wav',
        text: "Hello, this is a test message.",
        // Optional: Configure Maya generation parameters
        mayaGenerationConfig: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 50
        },
        onAudioChunk: (chunk: Buffer) => {
          console.log(`Received audio chunk: ${chunk.length} bytes`);
        },
        onAudioComplete: () => {
          console.log('Audio generation completed!');
        }
      });

      try {
        console.log('Starting TTS test...');
        const success = await ttsClient.runSimpleTest("Hello, this is a test message.");
        
        if (success) {
          console.log('TTS test completed successfully!');
          const audioInfo = ttsClient.getAudioInfo();
          console.log('Audio Information:');
          console.log(`- Chunks received: ${audioInfo.chunksCount}`);
          console.log(`- Total bytes: ${audioInfo.totalBytes.toLocaleString()}`);
          console.log(`- Sample rate: ${audioInfo.sampleRate}Hz`);
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
      }
    }

    main().catch(console.error);
   ```

3. 🔑 Replace `<YOUR_API_KEY>` with your actual TalkScriber API key.

4. ⚙️ Install the necessary TypeScript dependencies if you haven't already:
   ```bash
   npm install -D typescript ts-node @types/node
   ```

5. ▶️ Compile and run your TypeScript code:
   ```bash
   npx ts-node tts_example.ts
   ```

This will initialize the TalkScriber TTS client and connect to the service. The audio will start playing in less than 0.1 seconds with ultra-low latency streaming. ⚡

For complete examples of TTS usage, refer to the `examples` directory in the package source code.

## 🔊 Supported Audio Formats

- **Sample Rate**: 24kHz (matches server configuration)
- **Channels**: Mono (1 channel)
- **Bit Depth**: 16-bit PCM
- **Protocol**: WebSocket binary streaming

## ⚙️ Configuration Options

| Setting | Default | Description |
|---------|---------|-------------|
| `apiKey` | *required* | Your TalkScriber API authentication key |
| `enablePlayback` | `true` | Enable real-time audio playback |
| `saveAudioPath` | `undefined` | Optional path to save audio file |
| `speakerName` | `"Realistic female voice..."` | Natural language description of desired voice characteristics |
| `endpoint` | `"wss://api.talkscriber.com:9099"` | TTS server endpoint |
| `mayaGenerationConfig` | `undefined` | Optional Maya model generation parameters (see below) |

### Maya Generation Config

The `mayaGenerationConfig` object allows fine-tuning of the TTS model's generation behavior:

| Parameter | Type | Description |
|-----------|------|-------------|
| `temperature` | `number` | Controls randomness (0.0-1.0). Higher = more varied, lower = more consistent |
| `top_p` | `number` | Nucleus sampling threshold (0.0-1.0) |
| `top_k` | `number` | Limits vocabulary to top K tokens |
| `max_tokens` | `number` | Maximum number of tokens to generate |
| `repetition_penalty` | `number` | Penalty for repeating tokens (1.0 = no penalty) |

### Voice Description Format

The `speakerName` parameter now accepts natural language descriptions instead of preset voice names. Describe your desired voice using these attributes:

- **Gender**: male, female, neutral
- **Age**: 20s, 30s, 40s, etc.
- **Accent**: american, british, australian, etc.
- **Pitch**: high, normal, low, deep
- **Timbre**: warm, bright, rich, clear
- **Pacing**: slow, conversational, fast, energetic

**Example descriptions:**
- `"Realistic female voice in the 30s age with american accent. Normal pitch, warm timbre, conversational pacing."`
- `"Deep male voice in the 40s age with british accent. Low pitch, rich timbre, slow pacing."`
- `"Energetic female voice in the 20s age with australian accent. High pitch, bright timbre, fast pacing."`

## 💡 Usage Patterns

### 1. 🎵 Basic Usage with Playback

```typescript
const ttsClient = new TalkScriberTTSService({
  apiKey: 'your_api_key',
  speakerName: 'Realistic female voice in the 30s age with american accent. Normal pitch, warm timbre, conversational pacing.',
  enablePlayback: true
});

await ttsClient.connect();
ttsClient.sendSpeakRequest("Hello, world!");
```

### 2. 🔇 Silent Mode (No Audio Playback)

```typescript
// Useful for testing or when you only want to save audio
const ttsClient = new TalkScriberTTSService({
  apiKey: 'your_api_key',
  speakerName: 'Deep male voice in the 40s age with british accent. Low pitch, rich timbre, slow pacing.',
  enablePlayback: false,
  saveAudioPath: './output/audio.wav'
});

await ttsClient.runSimpleTest("This will be saved but not played.");
```

### 3. 💾 Audio File Saving with Custom Generation Config

```typescript
// Save audio to file with playback and custom generation parameters
const ttsClient = new TalkScriberTTSService({
  apiKey: 'your_api_key',
  speakerName: 'Energetic female voice in the 20s age with australian accent. High pitch, bright timbre, fast pacing.',
  enablePlayback: true,
  saveAudioPath: './output/audio.wav',
  mayaGenerationConfig: {
    temperature: 0.8,
    top_p: 0.95,
    top_k: 100,
    repetition_penalty: 1.1
  }
});

await ttsClient.runSimpleTest("This will be played and saved with custom voice generation settings.");
```

### 4. 📡 Event Handling

```typescript
const ttsClient = new TalkScriberTTSService({
  apiKey: 'your_api_key',
  speakerName: 'Realistic male voice in the 30s age with american accent. Normal pitch, warm timbre, conversational pacing.'
});

// Listen for events
ttsClient.on('audioComplete', () => {
  console.log('Audio generation finished');
});

ttsClient.on('error', (error: Error) => {
  console.error('TTS Error:', error.message);
});

ttsClient.on('audioChunk', (chunk: Buffer) => {
  console.log(`Received audio chunk: ${chunk.length} bytes`);
});
```

## 🏃‍♂️ Running the Example

The project includes a complete example that demonstrates how to use the TalkScriber TTS client. Here's how to run it:

### 📋 Prerequisites

1. 🔑 **Get your API Key**: First, you need to obtain your TalkScriber API key from the [TalkScriber dashboard](https://app.talkscriber.com).

2. 🔊 **Audio Output**: The example will play audio through your system's default audio output device.

### 📝 Step-by-Step Instructions

1. 📁 **Make sure you are in the text-to-speech path**:
   ```bash
   cd /path/to/ts-client-tts-nodejs
   ```

2. 📦 **Install the required dependencies**:
   ```bash
   npm install
   ```

3. ⚙️ **Configure your API key**:
   - Open the file `examples/talkscriber_tts_client.ts`
   - Find line 5 where it says `apiKey: '<YOUR_API_KEY>'`
   - Replace `<YOUR_API_KEY>` with your actual API key:
   ```typescript
   const ttsClient = new TalkScriberTTSService({
     apiKey: 'your-actual-api-key-here', // Replace this with your real API key
     speakerName: 'Realistic female voice in the 30s age with american accent. Normal pitch, warm timbre, conversational pacing.',
     enablePlayback: true,
     // ... rest of configuration
   });
   ```

4. ▶️ **Run the example**:
   ```bash
   npm run example
   ```
📚 For detailed documentation, refer to our [documentation webpage](https://docs.talkscriber.com).



## 📄 License

This code is released under the MIT License. See [LICENSE] for further details.