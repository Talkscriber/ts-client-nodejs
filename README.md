<h3 align="center">
  Node.js Client API for State-of-the-Art Speech-to-Text, Suitable for Modern Conversational AI
</h3>

# About
Talkscriber offers a state-of-the-art Speech-to-Text (STT) platform tailored for conversational AI enterprises. It provides exceptional transcription services with a strong emphasis on privacy and security to enhance customer communication while protecting their sensitive information. 

# Key Features
- **A Word Error Rate (WER) of less than 4%**
- **Very low latency (under 150 ms)**
- **Support for 50+ languages**

# Getting Started
Below is an example of how to connect to Talkscriber's Speech-to-Text API using Node.js.
Follow these steps to get started:

1. In `talkscriber_client.ts`, replace `<YOUR_API_KEY>` with your actual API key.
2. Ensure your sample file `example_8k.wav` is in place.
3. Run the code using the following commands:

```bash
tsc && node [talkscriber_client.js](http://_vscodecontentref_/1)
```

Please note that the provided code is agnostic towards the sample rate and should be able to handle 
any .wav file/buffer that is pcm_s16le encoded.

# Supported Languages
The Talkscriber engine handles the following languages:
"en": "english",
"zh": "chinese"
"de": "german"
"es": "spanish"
"ru": "russian"
"ko": "korean"
"fr": "french"
"ja": "japanese"
"pt": "portuguese"
"tr": "turkish"
"pl": "polish"
"ca": "catalan"
"nl": "dutch"
"ar": "arabic"
"sv": "swedish"
"it": "italian"
"id": "indonesian"
"hi": "hindi"
"fi": "finnish"
"vi": "vietnamese"
"he": "hebrew"
"uk": "ukrainian"
"el": "greek"
"ms": "malay"
"cs": "czech"
"ro": "romanian"
"da": "danish"
"hu": "hungarian"
"ta": "tamil"
"no": "norwegian"
"th": "thai"
"ur": "urdu"
"hr": "croatian"
"bg": "bulgarian"
"lt": "lithuanian"
"la": "latin"
"mi": "maori"
"ml": "malayalam"
"cy": "welsh"
"sk": "slovak"
"te": "telugu"
"fa": "persian"
"lv": "latvian"
"bn": "bengali"
"sr": "serbian"
"az": "azerbaijani"
"sl": "slovenian"
"kn": "kannada"
"et": "estonian"
"mk": "macedonian"
"br": "breton"
"eu": "basque"
"is": "icelandic"
"hy": "armenian"
"ne": "nepali"
"mn": "mongolian"
"bs": "bosnian"
"kk": "kazakh"
"sq": "albanian"
"sw": "swahili"
"gl": "galician"
"mr": "marathi"
"pa": "punjabi"
"si": "sinhala"
"km": "khmer"
"sn": "shona"
"yo": "yoruba"
"so": "somali"
"af": "afrikaans"
"oc": "occitan"
"ka": "georgian"
"be": "belarusian"
"tg": "tajik"
"sd": "sindhi"
"gu": "gujarati"
"am": "amharic"
"yi": "yiddish"
"lo": "lao"
"uz": "uzbek"
"fo": "faroese"
"ht": "haitian creole"
"ps": "pashto"
"tk": "turkmen"
"nn": "nynorsk"
"mt": "maltese"
"sa": "sanskrit"
"lb": "luxembourgish"
"my": "myanmar"
"bo": "tibetan"
"tl": "tagalog"
"mg": "malagasy"
"as": "assamese"
"tt": "tatar"
"haw": "hawaiian"
"ln": "lingala"
"ha": "hausa"
"ba": "bashkir"
"jw": "javanese"
"su": "sundanese"
"yue": "cantonese"

# License
This code is released under the MIT License. See [LICENSE] for further details.