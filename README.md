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

## Running the Examples

To run the provided examples:

1. Ensure you're in the root directory of the project where `package.json` is located.

2. Install the required dependencies if you haven't already:
   ```bash
   npm install
   ```

3. Run the example:
   ```bash
   npm run example
   ```

Please note that you need to replace `<YOUR_API_KEY>` in the example script with your actual Talkscriber API key before running it.

The provided code is agnostic towards the sample rate and should be able to handle any .wav file/buffer that is pcm_s16le encoded.

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
