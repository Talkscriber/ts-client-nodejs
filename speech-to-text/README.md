<h3 align="center">
  ts-client: Universal Client API for State-of-the-Art Speech-to-Text, Suitable for Modern Conversational AI
</h3>

# About ts-client
ts-client is the official TypeScript client for Talkscriber, a state-of-the-Art Speech-to-Text (STT) platform tailored for conversational AI enterprises. It provides exceptional transcription services with a strong emphasis on privacy and security to enhance customer communication while protecting sensitive information.

**Cross-Platform Support**: This package works seamlessly in both Node.js and browser environments using the same import statement. The package automatically uses the appropriate implementation based on your environment.

# Key Features of Talkscriber
- **A Word Error Rate (WER) of less than 4%**
- **Very low latency (under 150 ms)**
- **Support for 50+ languages**

# Installation and Getting Started

Follow these steps to install and use the ts-client for Talkscriber:

1. Install the package:
   ```bash
   npm install @talkscriber-npm/ts-client
   ```
2. Install the necessary TypeScript dependencies if you haven't already:
   ```bash
   npm install -D typescript ts-node @types/node
   ```

3. Generate your API key and replace `<YOUR_API_KEY>` below with your actual Talkscriber API key.
For more details, see: https://docs.talkscriber.com/docs/authentication

4. Add the Talkscriber client to your project. The code below shows the basic integration pattern.
   
   **✨ Universal Import**: Use the same import in both Node.js and browser environments. The package automatically selects the correct implementation for your platform.
   
   For complete working examples with detailed implementation, see:
   - **Node.js/CLI usage**: [Platform-Specific Implementations - Node.js](#1-️-nodejs-implementation-for-backendcli)
   - **Browser/Web usage**: [Platform-Specific Implementations - Browser](#2--browser-implementation-for-web-apps)
   
   ```typescript
   // Works in both Node.js and browser!
   import { TalkscriberTranscriptionService } from '@talkscriber-npm/ts-client';

   async function main() {
   const talkscriber = new TalkscriberTranscriptionService({
     apiKey: '<YOUR_API_KEY>',
     language: 'en', // Specify the language here (e.g., 'en' for English)
     enableTurnDetection: true, // Enable smart turn detection using ML model
     turnDetectionTimeout: 0.6, // Timeout threshold for end-of-speech detection in seconds
     onTranscription: (text: string) => {
       console.log('Transcription:', text);
     },
     onUtterance: (text: string) => {
       console.log('Utterance:', text);
     }
   });

     try {
       await talkscriber.connect();
       console.log('Connected to Talkscriber service');

       // Your audio processing code here
       // For example:
       // const audioData = new Float32Array(/* your audio data */);
       // const sampleRate = 44100; // or your actual sample rate
       // talkscriber.send(audioData, sampleRate);

     } catch (error) {
       console.error('Error:', error instanceof Error ? error.message : String(error));
     } finally {
       talkscriber.close();
     }
   }

   main().catch(console.error);
   ```


5. Compile and run your TypeScript code:
   ```bash
   npx ts-node transcribe.ts
   ```

This will initialize the Talkscriber client and connect to the service. You'll need to add your own audio processing logic to send audio data to the `talkscriber.send()` method.

For complete examples of audio file processing, refer to the `examples` directory in the package source code.

## Transcription Data Structure

The Talkscriber service returns transcription data in the following structured format:

```json
{
  "uid": "xxxxxxxxxxxxxxxxx",
  "segments": [
    {
      "start": 0.0,
      "end": 0.9503124999999999,
      "text": "This is the first sentence.",
      "EOS": true
    },
    {
      "start": 1.5903125,
      "end": 4.5903125,
      "text": "Second ongoing sentence is happening in here",
      "EOS": false
    }
  ]
}
```

### Data Structure Explanation

Each segment contains the following properties:

- **`uid`**: Unique identifier for the transcription session
- **`start`**: Start time of the segment in seconds
- **`end`**: End time of the segment in seconds  
- **`text`**: The transcribed text content
- **`EOS`**: End-of-Sentence flag indicating whether the segment is complete

### Callback Behavior

The transcription service provides two distinct callback mechanisms:

- **`onTranscription`**: Receives all the segments. This callback provides the full accumulated transcription text with all completed/uncompleted sentences.

- **`onUtterance`**: Receives the latest ongoing segment where `EOS: false`. This callback provides real-time updates for sentences currently being processed, allowing for live transcription display.

## Running the Examples

This package includes **two complete examples** demonstrating different use cases:

### 1. Node.js Example
Process pre-recorded audio files from the command line:

```bash
npm run example
```

- **Location**: `examples/nodejs/talkscriber_client.ts`
- **What it does**: Transcribes a `.wav` audio file using Node.js
- **Features**: File processing, smart turn detection

**Quick Setup**:
1. Edit `examples/nodejs/talkscriber_client.ts`
2. Replace `<YOUR_API_KEY>` with your actual API key
3. Run `npm run example`

### 2. Browser UI Example (Web)
Real-time microphone transcription in the browser:

```bash
npm run dev:ui
```

- **Location**: `examples/ui/`
- **What it does**: Live transcription from your microphone in a web interface
- **Features**: Real-time audio, visual UI, multiple languages

**Quick Setup**:
1. Run `npm run dev:ui` (auto-opens browser)
2. Enter your API key in the web interface
3. Click "Click to Start" and allow microphone access

For detailed implementation guides, see [Platform-Specific Implementations](#-platform-specific-implementations) below.

## 🔀 Platform-Specific Implementations

**IMPORTANT**: The Talkscriber client provides **TWO SEPARATE IMPLEMENTATIONS** for different environments:

### 📋 Quick Decision Guide

**Choose Node.js Implementation if:**
- ✅ Building a CLI tool or terminal application
- ✅ Running on a Node.js server/backend
- ✅ Processing audio files from disk
- ✅ Need server-side audio processing

**Choose Browser Implementation if:**
- ✅ Building a web application
- ✅ Using microphone in the browser
- ✅ Creating a Single Page Application (SPA)
- ✅ Need zero Node.js dependencies

---

### Detailed Implementation Guide

### 1. 🖥️ Node.js Implementation (for Backend/CLI)

**File**: `src/TalkscriberTranscriptionService.ts`

**Environment**: Node.js, server-side, terminal applications

**Import Statement**:
```typescript
import { TalkscriberTranscriptionService } from '@talkscriber-npm/ts-client';
```

**Use Cases**:
- ✅ CLI tools and terminal applications
- ✅ Backend/server-side services
- ✅ Processing pre-recorded audio files
- ✅ Node.js microservices
- ✅ Batch audio processing

**Technical Details**:
- Requires Node.js runtime
- Uses `ws` npm package for WebSocket
- Uses Node.js `crypto.randomUUID()` for session IDs
- Callback-based event handling
- Includes Node.js dependencies

**Example Code**:
```typescript
import { TalkscriberTranscriptionService } from '@talkscriber-npm/ts-client';

const talkscriber = new TalkscriberTranscriptionService({
  apiKey: 'your-api-key',
  language: 'en',
  enableTurnDetection: true
});

await talkscriber.connect();
talkscriber.send(audioData, sampleRate);
```

**Live Example**: `examples/nodejs/talkscriber_client.ts`

> **💡 Quick Start**: Run `npm run example` to test with an audio file. See [Running the Examples](#running-the-examples) for details.

### 2. 🌐 Browser Implementation (for Web Apps)

**File**: `src/TalkscriberTranscriptionService.browser.ts`

**Environment**: Web browsers, frontend applications

**Import Statement**:
```typescript
import { TalkscriberTranscriptionService } from '@talkscriber-npm/ts-client/TalkscriberTranscriptionService.browser.js';
```

**Use Cases**:
- ✅ Web applications with microphone access
- ✅ Single Page Applications (SPA)
- ✅ React/Vue/Angular apps
- ✅ Real-time browser transcription
- ✅ Client-side audio processing

**Technical Details**:
- Runs in web browsers
- Uses native browser `WebSocket` API (no npm packages needed)
- Custom UUID generation (browser-compatible)
- Zero Node.js dependencies
- Works with modern bundlers (Webpack, Vite, etc.)

**Example Code**:
```typescript
import { TalkscriberTranscriptionService } from '@talkscriber-npm/ts-client/TalkscriberTranscriptionService.browser.js';

const talkscriber = new TalkscriberTranscriptionService({
  apiKey: 'your-api-key',
  language: 'en',
  enableTurnDetection: true
});

await talkscriber.connect();
// Get microphone stream and send audio
talkscriber.send(audioData, sampleRate);
```

**Live Example**: `examples/ui/` - Complete web UI with microphone access

> **💡 Quick Start**: Run `npm run dev:ui` to launch the browser example. See [Running the Examples](#running-the-examples) for details.

### 📊 Side-by-Side Comparison

| Aspect | 🖥️ Node.js Implementation | 🌐 Browser Implementation |
|--------|---------------------------|---------------------------|
| **Import Path** | `@talkscriber-npm/ts-client` | `@talkscriber-npm/ts-client/TalkscriberTranscriptionService.browser.js` |
| **Runtime** | Node.js (v14+) | Modern browsers (Chrome, Firefox, Safari, Edge) |
| **WebSocket** | `ws` npm package | Native browser `WebSocket` API |
| **UUID** | `crypto.randomUUID()` | Custom Math.random() implementation |
| **Dependencies** | ✅ Requires `ws` package | ❌ Zero external dependencies |
| **Event System** | Callbacks | Callbacks |
| **Typical Use** | CLI tools, backend APIs, file processing | Web UIs, microphone capture, SPAs |
| **Example Location** | `examples/nodejs/` | `examples/ui/` |
| **Run Command** | `npm run example` | `npm run dev:ui` |

### 🔧 Shared Architecture

Both implementations extend the same `TalkscriberBase` class, which means:
- ✅ **Identical API**: Same methods, same configuration options
- ✅ **Consistent behavior**: Same transcription quality and features
- ✅ **Shared logic**: Audio resampling, message handling, connection management
- ✅ **Easy to switch**: Minimal code changes when migrating between platforms

**The ONLY difference is the environment-specific code** (WebSocket implementation and UUID generation).

## Smart Turn Detection

The client supports advanced turn detection using machine learning for better endpoint detection:

- **enableTurnDetection** (boolean, default: false): Enables smart turn detection using ML model for better endpoint detection
- **turnDetectionTimeout** (number, default: 0.6): Timeout threshold for end-of-speech detection in seconds (fallback when ML model confidence is low)

When `enableTurnDetection` is set to `true`, the system uses an ML model to predict turn completion in addition to the standard timeout-based method. This provides:
- Improved accuracy over time-based thresholds alone
- Context awareness of speech patterns
- Reduced false positives
- Adaptive behavior across different speakers and languages

# Supported Languages
The Talkscriber engine handles the following languages:
- "en": "english",
- "zh": "chinese"
- "de": "german"
- "es": "spanish"
- "ru": "russian"
- "ko": "korean"
- "fr": "french"
- "ja": "japanese"
- "pt": "portuguese"
- "tr": "turkish"
- "pl": "polish"
- "ca": "catalan"
- "nl": "dutch"
- "ar": "arabic"
- "sv": "swedish"
- "it": "italian"
- "id": "indonesian"
- "hi": "hindi"
- "fi": "finnish"
- "vi": "vietnamese"
- "he": "hebrew"
- "uk": "ukrainian"
- "el": "greek"
- "ms": "malay"
- "cs": "czech"
- "ro": "romanian"
- "da": "danish"
- "hu": "hungarian"
- "ta": "tamil"
- "no": "norwegian"
- "th": "thai"
- "ur": "urdu"
- "hr": "croatian"
- "bg": "bulgarian"
- "lt": "lithuanian"
- "la": "latin"
- "mi": "maori"
- "ml": "malayalam"
- "cy": "welsh"
- "sk": "slovak"
- "te": "telugu"
- "fa": "persian"
- "lv": "latvian"
- "bn": "bengali"
- "sr": "serbian"
- "az": "azerbaijani"
- "sl": "slovenian"
- "kn": "kannada"
- "et": "estonian"
- "mk": "macedonian"
- "br": "breton"
- "eu": "basque"
- "is": "icelandic"
- "hy": "armenian"
- "ne": "nepali"
- "mn": "mongolian"
- "bs": "bosnian"
- "kk": "kazakh"
- "sq": "albanian"
- "sw": "swahili"
- "gl": "galician"
- "mr": "marathi"
- "pa": "punjabi"
- "si": "sinhala"
- "km": "khmer"
- "sn": "shona"
- "yo": "yoruba"
- "so": "somali"
- "af": "afrikaans"
- "oc": "occitan"
- "ka": "georgian"
- "be": "belarusian"
- "tg": "tajik"
- "sd": "sindhi"
- "gu": "gujarati"
- "am": "amharic"
- "yi": "yiddish"
- "lo": "lao"
- "uz": "uzbek"
- "fo": "faroese"
- "ht": "haitian creole"
- "ps": "pashto"
- "tk": "turkmen"
- "nn": "nynorsk"
- "mt": "maltese"
- "sa": "sanskrit"
- "lb": "luxembourgish"
- "my": "myanmar"
- "bo": "tibetan"
- "tl": "tagalog"
- "mg": "malagasy"
- "as": "assamese"
- "tt": "tatar"
- "haw": "hawaiian"
- "ln": "lingala"
- "ha": "hausa"
- "ba": "bashkir"
- "jw": "javanese"
- "su": "sundanese"
- "yue": "cantonese"

# License
This code is released under the MIT License. See [LICENSE] for further details.
