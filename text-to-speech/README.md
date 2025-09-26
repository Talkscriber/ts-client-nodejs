## Table of Contents

- [About ts-client-tts](#about-ts-client-tts)
- [Key Features of TalkScriber TTS](#key-features-of-talkscriber-tts)
- [Installation and Getting Started](#installation-and-getting-started)
- [Supported Audio Formats](#supported-audio-formats)
- [Configuration Options](#configuration-options)
- [Usage Patterns](#usage-patterns)
  - [1. Basic Usage with Playback](#1-basic-usage-with-playback)
  - [2. Silent Mode (No Audio Playback)](#2-silent-mode-no-audio-playback)
  - [3. Audio File Saving](#3-audio-file-saving)
  - [4. Event Handling](#4-event-handling)
- [Running the Examples](#running-the-examples)
  - [Prerequisites](#prerequisites)
  - [Step-by-Step Instructions](#step-by-step-instructions)
  - [Example Code Location](#example-code-location)
  - [What the Example Does](#what-the-example-does)
- [API Reference](#api-reference)
  - [TalkScriberTTSService](#talkscriberttsservice)
    - [Constructor](#constructor)
    - [Methods](#methods)
      - [connect()](#connect-promisevoid)
      - [sendSpeakRequest()](#sendspeakrequesttext-string-speakername-string-boolean)
      - [initAudio()](#initaudio-boolean)
      - [close()](#close-void)
      - [runSimpleTest()](#runsimpletesttext-string-promiseboolean)
      - [getStoredAudioData()](#getstoredaudiodata-buffer)
      - [getAudioInfo()](#getaudioinfo-object)
    - [Events](#events)
      - [audioComplete](#audiocomplete)
      - [error](#error)
      - [audioChunk](#audiochunk)
- [Error Handling](#error-handling)
- [Common Issues](#common-issues)
- [Supported Speakers](#supported-speakers)
- [License](#license)


# About ts-client-tts

This is the official TypeScript client for TalkScriber Text-to-Speech (TTS), a state-of-the-art TTS platform tailored for conversational AI enterprises. It provides exceptional speech synthesis services with ultra-low latency streaming and a strong emphasis on privacy and security.

# Installation and Getting Started

Follow these steps to install and use the ts-client-tts for TalkScriber:

1. Install the package:
   ```bash
   npm install @talkscriber-npm/ts-client-tts
   ```

2. In your project, create a new file (e.g., `tts_example.ts`) and add the following code:
   ```typescript
   import { TalkScriberTTSService } from '@talkscriber-npm/ts-client-tts';

   async function main() {
     const ttsClient = new TalkScriberTTSService({
       apiKey: '<YOUR_API_KEY>',
       speakerName: 'tara',
       enablePlayback: true,
       saveAudioPath: './output/audio.wav',
       onAudioChunk: (chunk: Buffer) => {
         console.log(`Received audio chunk: ${chunk.length} bytes`);
       },
       onAudioComplete: () => {
         console.log('Audio generation completed!');
       }
     });

     try {
       await ttsClient.connect();
       console.log('Connected to TalkScriber TTS service');

       // Send text to convert to speech
       ttsClient.sendSpeakRequest("Hello, this is a test message.");

     } catch (error) {
       console.error('Error:', error instanceof Error ? error.message : String(error));
     } finally {
       ttsClient.close();
     }
   }

   main().catch(console.error);
   ```

3. Replace `<YOUR_API_KEY>` with your actual TalkScriber API key.

4. Install the necessary TypeScript dependencies if you haven't already:
   ```bash
   npm install -D typescript ts-node @types/node
   ```

5. Compile and run your TypeScript code:
   ```bash
   npx ts-node tts_example.ts
   ```

This will initialize the TalkScriber TTS client and connect to the service. The audio will start playing in less than 0.1 seconds with ultra-low latency streaming.

For complete examples of TTS usage, refer to the `examples` directory in the package source code.

## Supported Audio Formats

- **Sample Rate**: 24kHz (matches server configuration)
- **Channels**: Mono (1 channel)
- **Bit Depth**: 16-bit PCM
- **Protocol**: WebSocket binary streaming

## Configuration Options

| Setting | Default | Description |
|---------|---------|-------------|
| `enablePlayback` | `true` | Enable real-time audio playback |
| `saveAudioPath` | `undefined` | Optional path to save audio file |
| `speakerName` | `"tara"` | Voice to use for speech synthesis |
| `endpoint` | `"wss://api.talkscriber.com:9099"` | TTS server endpoint |

## Usage Patterns

### 1. Basic Usage with Playback

```typescript
const ttsClient = new TalkScriberTTSService({
  apiKey: 'your_api_key',
  speakerName: 'tara',
  enablePlayback: true
});

await ttsClient.connect();
ttsClient.sendSpeakRequest("Hello, world!");
```

### 2. Silent Mode (No Audio Playback)

```typescript
// Useful for testing or when you only want to save audio
const ttsClient = new TalkScriberTTSService({
  apiKey: 'your_api_key',
  speakerName: 'tara',
  enablePlayback: false,
  saveAudioPath: './output/silent_audio.wav'
});

await ttsClient.runSimpleTest("This will be saved but not played.");
```

### 3. Audio File Saving

```typescript
// Save audio to file with playback
const ttsClient = new TalkScriberTTSService({
  apiKey: 'your_api_key',
  speakerName: 'tara',
  enablePlayback: true,
  saveAudioPath: './output/audio.wav'
});

await ttsClient.runSimpleTest("This will be played and saved.");
```

### 4. Event Handling

```typescript
const ttsClient = new TalkScriberTTSService({
  apiKey: 'your_api_key',
  speakerName: 'tara'
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

## Running the Examples

The project includes a complete example that demonstrates how to use the TalkScriber TTS client. Here's how to run it:

### Prerequisites

1. **Get your API Key**: First, you need to obtain your TalkScriber API key from the [TalkScriber dashboard](https://app.talkscriber.com).

2. **Audio Output**: The example will play audio through your system's default audio output device.

### Step-by-Step Instructions

1. **Navigate to the project directory**:
   ```bash
   cd /path/to/ts-client-tts-nodejs
   ```

2. **Install the required dependencies**:
   ```bash
   npm install
   ```

3. **Configure your API key**:
   - Open the file `examples/talkscriber_tts_client.ts`
   - Find line 5 where it says `apiKey: '<YOUR_API_KEY>'`
   - Replace `<YOUR_API_KEY>` with your actual API key:
   ```typescript
   const ttsClient = new TalkScriberTTSService({
     apiKey: 'your-actual-api-key-here', // Replace this with your real API key
     speakerName: 'tara',
     enablePlayback: true,
     // ... rest of configuration
   });
   ```

4. **Run the example**:
   ```bash
   npm run example
   ```

### Example Code Location

The main example code is located in:
- **File**: `examples/talkscriber_tts_client.ts`
- **Purpose**: Demonstrates how to use the TalkScriber TTS service
- **Features**: Shows real-time playback, file saving, event handling, and audio streaming

### What the Example Does

The example script will:
1. Connect to the TalkScriber TTS service using your API key
2. Send a text message for speech synthesis
3. Receive and play audio in real-time with ultra-low latency
4. Save the audio to a WAV file (if configured)
5. Display audio information and statistics

## API Reference

### TalkScriberTTSService

The main class for interacting with the TalkScriber TTS service.

#### Constructor

```typescript
new TalkScriberTTSService(options: TalkScriberTTSOptions)
```

#### Methods

##### `connect(): Promise<void>`
Establishes WebSocket connection to the TTS server and authenticates.

**Returns:** `Promise<void>` - Resolves when connected and authenticated

##### `sendSpeakRequest(text: string, speakerName?: string): boolean`
Sends a TTS request to the server.

**Parameters:**
- `text` (string): Text to convert to speech
- `speakerName` (string, optional): Voice to use (overrides constructor setting)

**Returns:** `boolean` - True if request sent successfully

##### `initAudio(): boolean`
Initializes audio playback system.

**Returns:** `boolean` - True if audio initialized successfully

##### `close(): void`
Closes the WebSocket connection and stops audio playback.

##### `runSimpleTest(text?: string): Promise<boolean>`
Runs a complete TTS session: connect, send text, receive audio, and play.

**Parameters:**
- `text` (string, optional): Text to convert to speech

**Returns:** `Promise<boolean>` - True if successful

##### `getStoredAudioData(): Buffer`
Gets the raw audio data that was received during generation.

**Returns:** `Buffer` - The combined audio data

##### `getAudioInfo(): object`
Gets information about the received audio.

**Returns:** `object` - Audio information including chunks count, total bytes, duration, etc.

#### Events

##### `audioComplete`
Emitted when audio generation is completed.

##### `error`
Emitted when an error occurs.

##### `audioChunk`
Emitted when an audio chunk is received.

## Error Handling

```typescript
try {
  const ttsClient = new TalkScriberTTSService({
    apiKey: 'your_key',
    speakerName: 'tara'
  });
  
  await ttsClient.connect();
  ttsClient.sendSpeakRequest("Hello world!");
  
} catch (error) {
  if (error instanceof Error) {
    console.error('TTS Error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Common Issues

**Authentication Error**: Make sure you've replaced `<YOUR_API_KEY>` with your actual API key

**Audio Playback Issues**: 
- Ensure your system has audio output capabilities
- Check that no other applications are blocking audio access
- On Linux, you may need to install ALSA or PulseAudio

**Connection Issues**: 
- Check your internet connection
- Verify the API key is valid
- Ensure firewall settings allow WebSocket connections

## Supported Speakers

The TalkScriber TTS service supports multiple speaker voices. You can specify the speaker using the `speakerName` parameter:

- `"tara"` - Default female voice
- Additional speakers may be available - check the TalkScriber documentation for the complete list

## License

This code is released under the MIT License. See [LICENSE] for further details.
