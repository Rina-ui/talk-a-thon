export interface TranscriptUpdate {
  /** Text the recognizer is sure about, accumulated since start. */
  readonly final: string;
  /** Text still being recognized. */
  readonly interim: string;
}

export interface SpeechRecognizerHandlers {
  onTranscript(update: TranscriptUpdate): void;
  onError(code: string): void;
}

export interface SpeechRecognizerPort {
  readonly isSupported: boolean;
  start(handlers: SpeechRecognizerHandlers): void;
  stop(): void;
}
