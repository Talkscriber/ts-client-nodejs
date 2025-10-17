<h3 align="center">
  ts-client: Universal Client API for State-of-the-Art Speech-to-Text, Suitable for Modern Conversational AI
</h3>

# About ts-client
ts-client is the official TypeScript client for Talkscriber, a state-of-the-Art Speech-to-Text (STT) platform tailored for conversational AI enterprises. It provides exceptional transcription services with a strong emphasis on privacy and security to enhance customer communication while protecting sensitive information.

**Cross-Platform Support**: This package works seamlessly in both Node.js and browser environments with clear, explicit class names for each platform.

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
   
   **✨ Simple & Explicit**: Use the appropriate class for your environment.
   
   ```typescript
   // For Node.js (backend, CLI, file processing)
   import { TalkscriberTranscriptionService } from '@talkscriber-npm/ts-client';

   // For Browser (web apps, microphone access) - use the browser subpath
   import { TalkscriberBrowserTranscriptionService } from '@talkscriber-npm/ts-client/browser';
   
   // Or in HTML with CDN:
   // import { TalkscriberBrowserTranscriptionService } from 'https://cdn.jsdelivr.net/npm/@talkscriber-npm/ts-client/dist/index.browser.js';

   async function main() {
     // Use TalkscriberTranscriptionService in Node.js
     // Use TalkscriberBrowserTranscriptionService in Browser
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
   
   For complete working examples, see:
   - **Node.js/CLI**: [examples/nodejs/talkscriber_client.ts](examples/nodejs/talkscriber_client.ts)
   - **Browser/Web**: [examples/ui/](examples/ui/)


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

The Talkscriber client provides **two distinct classes** for different environments:

- **`TalkscriberTranscriptionService`**: For Node.js (backend, CLI, file processing)
- **`TalkscriberBrowserTranscriptionService`**: For Browser (web apps, microphone)

### 📋 Quick Reference

**Node.js Import**:
```typescript
import { TalkscriberTranscriptionService } from '@talkscriber-npm/ts-client';

const talkscriber = new TalkscriberTranscriptionService({ /* config */ });
```

**Browser Import** (with build tools like Vite/Webpack):
```typescript
import { TalkscriberBrowserTranscriptionService } from '@talkscriber-npm/ts-client/browser';

const talkscriber = new TalkscriberBrowserTranscriptionService({ /* config */ });
```

**Browser Import** (direct in HTML):
```html
<script type="module">
import { TalkscriberBrowserTranscriptionService } from '/node_modules/@talkscriber-npm/ts-client/dist/index.browser.js';
// or from CDN:
// import { TalkscriberBrowserTranscriptionService } from 'https://cdn.jsdelivr.net/npm/@talkscriber-npm/ts-client/dist/index.browser.js';

const talkscriber = new TalkscriberBrowserTranscriptionService({ /* config */ });
</script>
```

### 1. 🖥️ Node.js Usage (Backend/CLI)

Perfect for:
- ✅ CLI tools and terminal applications
- ✅ Backend/server-side services
- ✅ Processing pre-recorded audio files
- ✅ Node.js microservices
- ✅ Batch audio processing

**Example**:
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

**Live Example**: `examples/nodejs/talkscriber_client.ts` — Run with `npm run example`

### 2. 🌐 Browser Usage (Web Apps)

Perfect for:
- ✅ Web applications with microphone access
- ✅ Single Page Applications (SPA)
- ✅ React/Vue/Angular apps
- ✅ Real-time browser transcription
- ✅ Client-side audio processing

**Example** (with bundler):
```typescript
import { TalkscriberBrowserTranscriptionService } from '@talkscriber-npm/ts-client/browser';

const talkscriber = new TalkscriberBrowserTranscriptionService({
  apiKey: 'your-api-key',
  language: 'en',
  enableTurnDetection: true
});

await talkscriber.connect();
talkscriber.send(audioData, sampleRate);
```

**Live Example**: `examples/ui/` — Run with `npm run dev:ui`

### 📊 Comparison

| Aspect | 🖥️ Node.js | 🌐 Browser |
|--------|------------|------------|
| **Import** | `@talkscriber-npm/ts-client` | `@talkscriber-npm/ts-client/browser` |
| **Class Name** | `TalkscriberTranscriptionService` | `TalkscriberBrowserTranscriptionService` |
| **Runtime** | Node.js (v14+) | Modern browsers |
| **Dependencies** | Requires `ws` package | Zero dependencies |
| **Typical Use** | File processing, backend APIs | Microphone, web UIs |

### 🔧 Shared Architecture

Both implementations share the same:
- ✅ **API**: Same methods and configuration options
- ✅ **Behavior**: Same transcription quality and features  
- ✅ **Logic**: Audio resampling, message handling, connection management

The ONLY differences are environment-specific WebSocket implementations and UUID generation.

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

# 🚀 Building Your Own Applications

This section provides step-by-step guides to help you build your own Node.js or browser-based applications from scratch using Talkscriber.

## 📦 Building Your Own Node.js Application

Follow this guide to create a Node.js application that transcribes audio files.

### Step 1: Set Up Your Project

Create a new directory and initialize your project:

```bash
mkdir my-talkscriber-app
cd my-talkscriber-app
npm init -y
```

### Step 2: Install Required Dependencies

```bash
# Install Talkscriber client
npm install @talkscriber-npm/ts-client

# Install TypeScript dependencies
npm install -D typescript ts-node @types/node

# Install audio processing dependency
npm install wav-decoder
```

### Step 3: Create TypeScript Configuration

Create a `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Step 4: Create Your Application

Create a file `src/transcribe.ts`:

```typescript
import * as fs from 'fs';
import { decode } from 'wav-decoder';
import { TalkscriberTranscriptionService } from '@talkscriber-npm/ts-client';

// Configuration
const AUDIO_FILE_PATH = './audio.wav'; // Path to your audio file
const API_KEY = 'YOUR_API_KEY'; // Replace with your API key
const LANGUAGE = 'en'; // Change to your desired language

/**
 * Decode a WAV file and return the audio data as Float32Array
 */
async function decodeWavFile(filePath: string): Promise<[Float32Array, number]> {
    // Read the file from disk
    const buffer = fs.readFileSync(filePath);
    
    // Decode the WAV file
    const audioData = await decode(buffer);
    
    console.log(`Audio format: ${audioData.sampleRate}Hz, ${audioData.channelData.length} channel(s)`);
    console.log(`Duration: ${audioData.channelData[0].length / audioData.sampleRate} seconds`);

    // Ensure the audio is mono (single channel)
    if (audioData.channelData.length !== 1) {
        throw new Error('Audio must be mono (single channel). Please convert your audio file.');
    }

    // Return the audio data and sample rate
    return [audioData.channelData[0], audioData.sampleRate];
}

/**
 * Stream audio data to Talkscriber in chunks
 * This simulates real-time audio streaming
 */
async function streamAudioData(
    audioData: Float32Array, 
    chunkSize: number, 
    sampleRate: number, 
    talkscriber: TalkscriberTranscriptionService
) {
    console.log(`Streaming ${audioData.length} samples in chunks of ${chunkSize}...`);
    
    for (let i = 0; i < audioData.length; i += chunkSize) {
        // Extract a chunk of audio
        const chunk = audioData.slice(i, Math.min(i + chunkSize, audioData.length));
        
        // Send the chunk to Talkscriber
        talkscriber.send(chunk, sampleRate);
        
        // Wait to simulate real-time streaming
        // This calculates how long the chunk would take to play in real-time
        const chunkDuration = (chunkSize / sampleRate) * 1000; // in milliseconds
        await new Promise(resolve => setTimeout(resolve, chunkDuration));
    }
    
    console.log('Finished streaming audio data');
}

/**
 * Main function
 */
async function main() {
    // Initialize the Talkscriber service
    const talkscriber = new TalkscriberTranscriptionService({
        apiKey: API_KEY,
        language: LANGUAGE,
        enableTurnDetection: true, // Enable smart turn detection
        turnDetectionTimeout: 0.6,
        
        // Callback for complete transcriptions
        onTranscription: (text: string) => {
            console.log('\n📝 Transcription:', text);
        },
        
        // Callback for ongoing utterances
        onUtterance: (text: string) => {
            console.log('🗣️  Utterance:', text);
        }
    });

    try {
        // Connect to Talkscriber
        console.log('Connecting to Talkscriber service...');
        await talkscriber.connect();
        console.log('✅ Connected successfully!\n');
        
        // Decode the audio file
        console.log(`Reading audio file: ${AUDIO_FILE_PATH}`);
        const [audioData, sampleRate] = await decodeWavFile(AUDIO_FILE_PATH);
        
        // Stream the audio data
        await streamAudioData(audioData, 4096, sampleRate, talkscriber);
        
        // Wait a bit for final transcriptions
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('\n✅ Transcription complete!');
        
    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    } finally {
        // Always close the connection
        talkscriber.close();
        console.log('Connection closed');
    }
}

// Run the application
main().catch(console.error);
```

### Step 5: Add Run Script to package.json

Add this script to your `package.json`:

```json
{
  "scripts": {
    "start": "ts-node src/transcribe.ts"
  }
}
```

### Step 6: Run Your Application

1. Replace `YOUR_API_KEY` with your actual API key from https://docs.talkscriber.com/docs/authentication
2. Place your WAV audio file in the project root as `audio.wav` (or update the path)
3. Run:

```bash
npm start
```

### 📝 Notes for Node.js Applications

- **Audio Format**: The example uses WAV files with the `wav-decoder` package. For MP3, use `@breezystack/lamejs` or similar.
- **Chunk Size**: `4096` samples is a good balance. Smaller = more frequent updates, larger = less overhead.
- **Real-time vs Batch**: Remove the `setTimeout` in `streamAudioData` for faster batch processing.
- **Microphone Input**: For live microphone, use packages like `node-record-lpcm16` or `mic`.

### 🎯 Common Use Cases

**Transcribe Multiple Files:**
```typescript
const files = ['file1.wav', 'file2.wav', 'file3.wav'];
for (const file of files) {
    await talkscriber.connect();
    const [audioData, sampleRate] = await decodeWavFile(file);
    await streamAudioData(audioData, 4096, sampleRate, talkscriber);
    talkscriber.close();
}
```

**Save Transcriptions to File:**
```typescript
let fullTranscription = '';

const talkscriber = new TalkscriberTranscriptionService({
    // ... other options
    onTranscription: (text: string) => {
        fullTranscription = text;
        fs.writeFileSync('output.txt', text);
    }
});
```

---

## 🌐 Building Your Own Browser Application

Follow this guide to create a web application with live microphone transcription.

### Step 1: Project Structure

Create the following files:

```
my-talkscriber-web/
├── index.html
├── app.js
└── styles.css
```

### Step 2: Create HTML File (index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Talkscriber - Live Transcription</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🎤 Talkscriber Live Transcription</h1>
            <p>Real-time speech-to-text in your browser</p>
        </header>

        <div class="settings-panel">
            <div class="form-group">
                <label for="apiKey">API Key:</label>
                <input 
                    type="password" 
                    id="apiKey" 
                    placeholder="Enter your Talkscriber API key"
                    autocomplete="off"
                >
            </div>

            <div class="form-group">
                <label for="language">Language:</label>
                <select id="language">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                    <!-- Add more languages as needed -->
                </select>
            </div>

            <div class="form-group checkbox">
                <label>
                    <input type="checkbox" id="enableTurnDetection" checked>
                    Enable Smart Turn Detection
                </label>
            </div>
        </div>

        <div class="controls">
            <button id="startBtn" class="btn btn-primary">Start Transcribing</button>
            <button id="stopBtn" class="btn btn-secondary" disabled>Stop</button>
            <div id="status" class="status">Ready</div>
        </div>

        <div class="results">
            <div class="result-box">
                <h3>📝 Full Transcription</h3>
                <div id="transcription" class="output">
                    Click "Start Transcribing" and allow microphone access...
                </div>
            </div>

            <div class="result-box">
                <h3>🗣️ Current Utterance</h3>
                <div id="utterance" class="output">
                    Real-time speech will appear here...
                </div>
            </div>
        </div>
    </div>

    <script type="module" src="app.js"></script>
</body>
</html>
```

### Step 3: Create JavaScript File (app.js)

```javascript
import { TalkscriberBrowserTranscriptionService } from 'https://cdn.jsdelivr.net/npm/@talkscriber-npm/ts-client/dist/index.browser.js';

class TalkscriberApp {
    constructor() {
        // State
        this.talkscriber = null;
        this.audioContext = null;
        this.processor = null;
        this.isRecording = false;

        // DOM elements
        this.apiKeyInput = document.getElementById('apiKey');
        this.languageSelect = document.getElementById('language');
        this.turnDetectionCheckbox = document.getElementById('enableTurnDetection');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.statusDiv = document.getElementById('status');
        this.transcriptionDiv = document.getElementById('transcription');
        this.utteranceDiv = document.getElementById('utterance');

        // Load saved API key
        this.loadApiKey();

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.apiKeyInput.addEventListener('input', () => this.saveApiKey());
    }

    async start() {
        const apiKey = this.apiKeyInput.value.trim();
        
        if (!apiKey) {
            alert('Please enter your API key');
            return;
        }

        try {
            // Update UI
            this.updateStatus('Connecting...', 'connecting');
            this.startBtn.disabled = true;

            // Initialize Talkscriber
            this.talkscriber = new TalkscriberBrowserTranscriptionService({
                apiKey: apiKey,
                language: this.languageSelect.value,
                enableTurnDetection: this.turnDetectionCheckbox.checked,
                turnDetectionTimeout: 0.6,
                
                onTranscription: (text) => {
                    console.log('Transcription:', text);
                    this.transcriptionDiv.textContent = text;
                },
                
                onUtterance: (text) => {
                    console.log('Utterance:', text);
                    this.utteranceDiv.textContent = text;
                }
            });

            // Connect to Talkscriber
            await this.talkscriber.connect();
            this.updateStatus('Connected', 'connected');

            // Start microphone
            await this.startMicrophone();

            // Update UI
            this.stopBtn.disabled = false;
            this.updateStatus('Recording...', 'recording');

        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
            this.updateStatus('Error', 'error');
            this.startBtn.disabled = false;
            this.cleanup();
        }
    }

    async startMicrophone() {
        // Check for HTTPS or localhost
        if (location.protocol !== 'https:' && 
            location.hostname !== 'localhost' && 
            location.hostname !== '127.0.0.1') {
            throw new Error('Microphone access requires HTTPS or localhost');
        }

        // Check for getUserMedia support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Your browser does not support microphone access');
        }

        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        // Create audio context
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContextClass();
        console.log('Audio context sample rate:', this.audioContext.sampleRate);

        // Create audio processing nodes
        const source = this.audioContext.createMediaStreamSource(stream);
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

        // Process audio data
        this.processor.onaudioprocess = (event) => {
            if (this.isRecording && this.talkscriber?.isConnected()) {
                const audioData = event.inputBuffer.getChannelData(0);
                const float32Array = new Float32Array(audioData);
                
                // Send audio to Talkscriber
                this.talkscriber.send(float32Array, this.audioContext.sampleRate);
            }
        };

        // Connect the nodes
        source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);

        this.isRecording = true;
    }

    stop() {
        this.cleanup();
        this.updateStatus('Stopped', 'stopped');
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
    }

    cleanup() {
        this.isRecording = false;

        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        if (this.talkscriber) {
            this.talkscriber.close();
            this.talkscriber = null;
        }
    }

    updateStatus(text, className) {
        this.statusDiv.textContent = text;
        this.statusDiv.className = `status ${className}`;
    }

    loadApiKey() {
        const savedKey = localStorage.getItem('talkscriber_api_key');
        if (savedKey) {
            this.apiKeyInput.value = savedKey;
        }
    }

    saveApiKey() {
        const key = this.apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('talkscriber_api_key', key);
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TalkscriberApp();
});
```

### Step 4: Create CSS File (styles.css)

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}

.container {
    max-width: 900px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

header {
    text-align: center;
    margin-bottom: 30px;
}

header h1 {
    color: #333;
    font-size: 2.5em;
    margin-bottom: 10px;
}

header p {
    color: #666;
    font-size: 1.1em;
}

.settings-panel {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group:last-child {
    margin-bottom: 0;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #333;
}

.form-group input[type="password"],
.form-group input[type="text"],
.form-group select {
    width: 100%;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1em;
    transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #667eea;
}

.form-group.checkbox label {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.form-group.checkbox input {
    width: auto;
    margin-right: 10px;
}

.controls {
    display: flex;
    gap: 15px;
    align-items: center;
    margin-bottom: 30px;
}

.btn {
    padding: 12px 30px;
    border: none;
    border-radius: 8px;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
    background: #e74c3c;
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    background: #c0392b;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.status {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    margin-left: auto;
}

.status.connecting { background: #f39c12; color: white; }
.status.connected { background: #3498db; color: white; }
.status.recording { background: #2ecc71; color: white; }
.status.error { background: #e74c3c; color: white; }
.status.stopped { background: #95a5a6; color: white; }

.results {
    display: grid;
    gap: 20px;
}

.result-box {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
}

.result-box h3 {
    color: #333;
    margin-bottom: 15px;
    font-size: 1.2em;
}

.output {
    background: white;
    padding: 20px;
    border-radius: 8px;
    min-height: 100px;
    font-size: 1.1em;
    line-height: 1.6;
    color: #333;
    border: 2px solid #e0e0e0;
}

@media (max-width: 768px) {
    .container {
        padding: 20px;
    }
    
    header h1 {
        font-size: 1.8em;
    }
    
    .controls {
        flex-direction: column;
    }
    
    .status {
        margin-left: 0;
        width: 100%;
        text-align: center;
    }
}
```

### Step 5: Serve Your Application

You need to serve the application over HTTP/HTTPS. Choose one of these methods:

**Option 1: Using Python (simplest)**
```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

**Option 2: Using Node.js**
```bash
npm install -g http-server
http-server -p 8000

# Then open: http://localhost:8000
```

**Option 3: Using VS Code Live Server**
- Install "Live Server" extension in VS Code
- Right-click `index.html` → "Open with Live Server"

### Step 6: Use Your Application

1. Open the app in your browser
2. Enter your API key (it will be saved in localStorage)
3. Select your language
4. Click "Start Transcribing"
5. Allow microphone access when prompted
6. Start speaking!

### 📝 Notes for Browser Applications

- **HTTPS Requirement**: Browsers require HTTPS for microphone access (except on localhost)
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge) support the Web Audio API
- **Sample Rate**: The browser's AudioContext may use 44100Hz or 48000Hz - Talkscriber handles this automatically
- **Permissions**: Users must grant microphone permission - handle permission denials gracefully
- **CDN vs Local**: The example uses CDN import. For production, bundle the package with Webpack/Vite

### 🎯 Advanced Features

**Add a Visual Audio Indicator:**
```javascript
this.processor.onaudioprocess = (event) => {
    const audioData = event.inputBuffer.getChannelData(0);
    
    // Calculate volume level
    const volume = Math.sqrt(
        audioData.reduce((sum, val) => sum + val * val, 0) / audioData.length
    );
    
    // Update a visual indicator
    document.getElementById('volumeBar').style.width = `${volume * 1000}%`;
    
    // Send to Talkscriber
    if (this.isRecording && this.talkscriber?.isConnected()) {
        this.talkscriber.send(new Float32Array(audioData), this.audioContext.sampleRate);
    }
};
```

**Using with Modern Build Tools (Vite/Webpack):**
```bash
npm install @talkscriber-npm/ts-client
```

Then in your TypeScript/JavaScript:
```typescript
import { TalkscriberBrowserTranscriptionService } from '@talkscriber-npm/ts-client/browser';
```

**Handle Connection Errors:**
```javascript
try {
    await this.talkscriber.connect();
} catch (error) {
    if (error.message.includes('401')) {
        alert('Invalid API key. Please check your credentials.');
    } else if (error.message.includes('network')) {
        alert('Network error. Please check your internet connection.');
    } else {
        alert(`Connection failed: ${error.message}`);
    }
}
```

---

## 🆘 Troubleshooting

### Node.js Issues

**"Cannot find module 'wav-decoder'"**
- Solution: Run `npm install wav-decoder`

**"API key is invalid"**
- Solution: Get your API key from https://docs.talkscriber.com/docs/authentication
- Ensure no extra spaces or quotes around the key

**"Audio must be mono"**
- Solution: Convert your audio to mono using FFmpeg:
  ```bash
  ffmpeg -i input.wav -ac 1 output.wav
  ```

### Browser Issues

**"Microphone access requires HTTPS"**
- Solution: Use `localhost` for development, or serve over HTTPS for production
- For local HTTPS: Use tools like `mkcert` or `http-server` with SSL

**"Your browser does not support microphone access"**
- Solution: Use a modern browser (Chrome 47+, Firefox 52+, Safari 11+, Edge 79+)
- Ensure you're not in a very old browser or private/incognito mode with strict settings

**"Permission denied" when accessing microphone**
- Solution: User must grant permission. Check browser settings if permission was previously denied
- In Chrome: Settings → Privacy and security → Site Settings → Microphone

**CDN module not loading**
- Solution: Ensure you're serving the page via HTTP/HTTPS, not opening as `file://`
- Check browser console for CORS errors

**No transcription appearing**
- Solution: Check that you're speaking clearly and the microphone is working
- Verify the API key is correct
- Open browser console to check for errors
- Ensure the microphone isn't muted

### General Issues

**High latency or slow transcription**
- Check your internet connection speed
- Reduce chunk size for lower latency (but higher overhead)
- Ensure the Talkscriber service status is operational

**Transcription quality issues**
- Ensure audio is clear with minimal background noise
- Use the correct language setting
- Enable `enableTurnDetection` for better sentence boundaries
- For Node.js: Ensure audio file is good quality (16kHz+ sample rate recommended)

---

# License
This code is released under the MIT License. See [LICENSE] for further details.
