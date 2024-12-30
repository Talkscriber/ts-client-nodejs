declare module 'wav-decoder' {
    export interface WavData {
        sampleRate: number;
        channelData: Float32Array[];
        length?: number;
        numberOfChannels?: number;
        bitDepth?: number;
    }

    export function decode(buffer: Buffer | Uint8Array): Promise<WavData>;
}