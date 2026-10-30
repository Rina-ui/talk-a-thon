import type { SpeechRecognizerHandlers, SpeechRecognizerPort } from '@/application/ports/SpeechRecognizerPort';

// The Web Speech API is not part of TypeScript's DOM lib: minimal typings.
interface RecognitionResultLike {
  readonly isFinal: boolean;
  readonly 0: { readonly transcript: string };
}
interface RecognitionEventLike {
  readonly resultIndex: number;
  readonly results: ArrayLike<RecognitionResultLike>;
}
interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => RecognitionLike;

function getCtor(): RecognitionCtor | null {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const FATAL_ERRORS = new Set(['not-allowed', 'service-not-allowed']);
const IGNORED_ERRORS = new Set(['no-speech', 'aborted']);

export class WebSpeechRecognizer implements SpeechRecognizerPort {
  private recognition: RecognitionLike | null = null;
  private shouldRun = false;
  private finalText = '';

  constructor(private readonly lang: string = 'en-US') {}

  get isSupported(): boolean {
    return getCtor() !== null;
  }

  start(handlers: SpeechRecognizerHandlers): void {
    const Ctor = getCtor();
    if (!Ctor) {
      handlers.onError('unsupported');
      return;
    }

    this.stop();
    this.finalText = '';
    this.shouldRun = true;

    const rec = new Ctor();
    rec.lang = this.lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result) continue;
        if (result.isFinal) this.finalText += `${result[0].transcript.trim()} `;
        else interim += result[0].transcript;
      }
      handlers.onTranscript({ final: this.finalText.trim(), interim: interim.trim() });
    };

    rec.onerror = (event) => {
      if (FATAL_ERRORS.has(event.error)) this.shouldRun = false;
      if (!IGNORED_ERRORS.has(event.error)) handlers.onError(event.error);
    };

    // Browsers end continuous sessions after a while: restart transparently.
    rec.onend = () => {
      if (!this.shouldRun) return;
      try {
        rec.start();
      } catch {
        /* already started */
      }
    };

    this.recognition = rec;
    try {
      rec.start();
    } catch {
      handlers.onError('start-failed');
    }
  }

  stop(): void {
    this.shouldRun = false;
    const rec = this.recognition;
    this.recognition = null;
    if (!rec) return;
    rec.onresult = null;
    rec.onerror = null;
    rec.onend = null;
    try {
      rec.stop();
    } catch {
      /* not running */
    }
  }
}
