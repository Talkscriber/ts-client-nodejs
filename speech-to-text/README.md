<h3 align="center">
  ts-client: Node.js Client API for State-of-the-Art Speech-to-Text, Suitable for Modern Conversational AI
</h3>

# About ts-client
ts-client is the official TypeScript client for Talkscriber, a state-of-the-Art Speech-to-Text (STT) platform tailored for conversational AI enterprises. It provides exceptional transcription services with a strong emphasis on privacy and security to enhance customer communication while protecting sensitive information.

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

2. In your project, create a new file (e.g., `transcribe.ts`) and add the following code:
   ```typescript
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

3. Replace `<YOUR_API_KEY>` with your actual Talkscriber API key.

4. Install the necessary TypeScript dependencies if you haven't already:
   ```bash
   npm install -D typescript ts-node @types/node
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

## Smart Turn Detection

The client supports advanced turn detection using machine learning for better endpoint detection:

- **enableTurnDetection** (boolean, default: false): Enables smart turn detection using ML model for better endpoint detection
- **turnDetectionTimeout** (number, default: 0.6): Timeout threshold for end-of-speech detection in seconds (fallback when ML model confidence is low)

When `enableTurnDetection` is set to `true`, the system uses an ML model to predict turn completion in addition to the standard timeout-based method. This provides:
- Improved accuracy over time-based thresholds alone
- Context awareness of speech patterns
- Reduced false positives
- Adaptive behavior across different speakers and languages

You can listen for end-of-speech events:

```typescript
talkscriber.on('endOfSpeech', (text: string) => {
  console.log('End of speech detected for:', text);
});
```

## Running the Examples

The project includes a complete example that demonstrates how to use the Talkscriber client with audio file processing. Here's how to run it:

### Prerequisites

1. **Get your API Key**: First, you need to obtain your Talkscriber API key from the [Talkscriber dashboard](https://app.talkscriber.com).

2. **Audio File**: The example uses a sample audio file located at `examples/sample.wav`. You can replace this with your own audio file if needed.

### Step-by-Step Instructions

1. **Navigate to the project directory**:
   ```bash
   cd /path/to/ts-client-nodejs
   ```

2. **Install the required dependencies**:
   ```bash
   npm install
   ```

3. **Configure your API key**:
   - Open the file `examples/talkscriber_client.ts`
   - Find line 30 where it says `apiKey: '<YOUR_API_KEY>'`
   - Replace `<YOUR_API_KEY>` with your actual API key:
   ```typescript
   const talkscriber = new TalkscriberTranscriptionService({
     apiKey: 'your-actual-api-key-here', // Replace this with your real API key
     language: 'en',
     enableTurnDetection: true,
     turnDetectionTimeout: 0.6,
     // ... rest of configuration
   });
   ```

4. **Run the example**:
   ```bash
   npm run example
   ```

### Example Code Location

The main example code is located in:
- **File**: `examples/talkscriber_client.ts`
- **Purpose**: Demonstrates how to transcribe an audio file using the Talkscriber service
- **Features**: Shows smart turn detection, event handling, and audio streaming

### What the Example Does

The example script will:
1. Connect to the Talkscriber service using your API key
2. Load and decode the sample audio file (`examples/sample.wav`)
3. Stream the audio data to the transcription service
4. Display real-time transcription results
5. Show end-of-speech detection events (if enabled)

### Audio File Requirements

The provided code is agnostic towards the sample rate and should be able to handle any .wav file/buffer that is pcm_s16le encoded. You can replace `examples/sample.wav` with your own audio file by:

1. Placing your audio file in the `examples/` directory
2. Updating the `audioFilePath` variable in `examples/talkscriber_client.ts`:
   ```typescript
   const audioFilePath = './examples/your-audio-file.wav';
   ```

### Troubleshooting

- **Authentication Error**: Make sure you've replaced `<YOUR_API_KEY>` with your actual API key
- **File Not Found**: Ensure the audio file exists in the `examples/` directory
- **Connection Issues**: Check your internet connection and verify the API key is valid

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
