Here is an example for connecting to the Talkscriber's Speec-to-Text API using node.js.

Here are the required steps:
 
1. In talkscriber_client.ts, replace your API Key
2. Make sure your sample file ‘example_8k.wav’ is in place
3. Run the code using:
`tsc ; node dist/talkscriber_client.js`
 
Please note that the provided code is agnostic towards the sample rate and should be able to handle 
any .wav file/buffer that is pcm_s16le encoded.