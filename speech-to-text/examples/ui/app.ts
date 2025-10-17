// Get the browser client from the global set by index.html (from local node_modules)
function getBrowserService(): any {
	return (window as any).TalkscriberBrowserTranscriptionService;
}

class TalkscriberWebUI {
	private talkscriber: any = null;
    private isRecording: boolean = false;
    private audioContext: AudioContext | null = null;
    private processor: ScriptProcessorNode | null = null;

    // DOM elements
    private apiKeyInput!: HTMLInputElement;
    private languageSelect!: HTMLSelectElement;
    private turnDetectionCheckbox!: HTMLInputElement;
    private micBtn!: HTMLButtonElement;
    private statusIndicator!: HTMLElement;
    private transcriptionBox!: HTMLElement;
    private utteranceBox!: HTMLElement;

    constructor() {
        this.initializeElements();
        this.loadApiKey();
        this.setupEventListeners();
    }

    private initializeElements(): void {
        this.apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
        this.languageSelect = document.getElementById('language') as HTMLSelectElement;
        this.turnDetectionCheckbox = document.getElementById('enableTurnDetection') as HTMLInputElement;
        this.micBtn = document.getElementById('micBtn') as HTMLButtonElement;
        this.statusIndicator = document.getElementById('status') as HTMLElement;
        this.transcriptionBox = document.getElementById('transcription') as HTMLElement;
        this.utteranceBox = document.getElementById('utterance') as HTMLElement;
    }

    private setupEventListeners(): void {
        this.micBtn.addEventListener('click', () => this.handleMicClick());
        
        this.apiKeyInput.addEventListener('input', () => {
            this.saveApiKey();
        });
        
        const testBtn = document.getElementById('testBtn');
        const clearBtn = document.getElementById('clearBtn');
        
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                this.updateTranscription('This is a test transcription to verify the display is working correctly.');
                this.updateUtterance('Test utterance');
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearTranscription();
            });
        }
    }

    private async handleMicClick(): Promise<void> {
        if (!this.talkscriber) {
            await this.connect();
        } else if (!this.isRecording) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }

    private async connect(): Promise<void> {
        const apiKey = this.apiKeyInput.value.trim();
        if (!apiKey) {
            alert('Please enter your API key');
            return;
        }

        try {
            this.updateStatus('Connecting...', 'connecting');
            this.updateMicButton('Connecting...');

            const language = this.languageSelect.value;
            const enableTurnDetection = this.turnDetectionCheckbox.checked;
            
			const BrowserService = getBrowserService();
			this.talkscriber = new BrowserService({
                apiKey,
                language,
                enableTurnDetection,
                turnDetectionTimeout: 0.6,
                onTranscription: (text: string) => {
                    console.log('Transcription:', text);
                    this.updateTranscription(text);
                },
                onUtterance: (text: string) => {
                    console.log('Utterance:', text);
                    this.updateUtterance(text);
                }
            });

            await this.talkscriber.connect();
            
            this.updateStatus('Ready to Transcribe', 'connected');
            this.updateMicButton('Start Transcribing');
            
            // Auto-start transcribing after connection
            setTimeout(() => {
                this.startRecording();
            }, 500);
            
        } catch (error) {
            console.error('Connection failed:', error);
            this.updateStatus('Connection Failed', 'disconnected');
            this.updateMicButton('Click to Start');
            alert(`Connection failed: ${(error as Error).message}`);
            this.talkscriber = null;
        }
    }

    private async startRecording(): Promise<void> {
        try {
            // Check if we're on HTTPS or localhost
            if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                throw new Error('Microphone access requires HTTPS or localhost.');
            }

            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Your browser does not support microphone access.');
            }

            console.log('Requesting microphone access...');
            this.updateStatus('Requesting microphone...', 'connecting');

            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });

            console.log('Microphone access granted, setting up audio processing...');
            this.updateStatus('Setting up audio...', 'connecting');

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.audioContext = new AudioContextClass();
            console.log('AudioContext created with sample rate:', this.audioContext.sampleRate);

            const source = this.audioContext.createMediaStreamSource(stream);
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            this.processor.onaudioprocess = (event: AudioProcessingEvent) => {
                if (this.isRecording && this.talkscriber?.isConnected()) {
                    const audioData = event.inputBuffer.getChannelData(0);
                    const float32Array = new Float32Array(audioData);
                    
                    this.talkscriber.send(float32Array, this.audioContext!.sampleRate);
                }
            };

            source.connect(this.processor);
            this.processor.connect(this.audioContext.destination);

            this.isRecording = true;
            this.updateStatus('Transcribing...', 'recording');
            this.updateMicButton('Stop Transcribing');

            console.log('Audio recording started successfully');

        } catch (error) {
            console.error('Error starting recording:', error);
            
            let errorMessage = 'Error accessing microphone. ';
            
            if ((error as any).name === 'NotAllowedError') {
                errorMessage += 'Microphone access was denied.';
            } else if ((error as any).name === 'NotFoundError') {
                errorMessage += 'No microphone found.';
            } else if ((error as any).name === 'NotSupportedError') {
                errorMessage += 'Microphone access is not supported in this browser.';
            } else if ((error as any).name === 'NotReadableError') {
                errorMessage += 'Microphone is already in use.';
            } else {
                errorMessage += (error as Error).message;
            }
            
            alert(errorMessage);
            this.updateStatus('Microphone Error', 'disconnected');
            this.updateMicButton('Start Transcribing');
        }
    }

    private stopRecording(): void {
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.isRecording = false;
        this.updateStatus('Ready to Transcribe', 'connected');
        this.updateMicButton('Start Transcribing');
    }

    private disconnect(): void {
        if (this.isRecording) {
            this.stopRecording();
        }

        if (this.talkscriber) {
            this.talkscriber.close();
            this.talkscriber = null;
        }

        this.updateStatus('Disconnected', 'disconnected');
        this.updateMicButton('Click to Start');
        this.clearTranscription();
    }

    private updateStatus(text: string, className: string): void {
        this.statusIndicator.textContent = text;
        this.statusIndicator.className = `status-indicator ${className}`;
    }

    private updateMicButton(text: string): void {
        this.micBtn.textContent = text;
    }

    private updateTranscription(text: string): void {
        if (text.trim()) {
            this.transcriptionBox.innerHTML = `<p>${text}</p>`;
        }
    }

    private updateUtterance(text: string): void {
        if (text.trim()) {
            this.utteranceBox.innerHTML = `<p>${text}</p>`;
        }
    }

    private clearTranscription(): void {
        this.transcriptionBox.innerHTML = '<p class="placeholder">Your transcribed text will appear here...</p>';
        this.utteranceBox.innerHTML = '<p class="placeholder">Current speech will appear here...</p>';
    }

    private loadApiKey(): void {
        const savedApiKey = localStorage.getItem('talkscriber_api_key');
        if (savedApiKey) {
            this.apiKeyInput.value = savedApiKey;
        }
    }

    private saveApiKey(): void {
        const apiKey = this.apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('talkscriber_api_key', apiKey);
        } else {
            localStorage.removeItem('talkscriber_api_key');
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TalkscriberWebUI();
});

// Handle beforeunload to clean up connections
window.addEventListener('beforeunload', () => {
    const instance = (window as any).talkscriberWebUI;
    if (instance) {
        instance.disconnect();
    }
});
