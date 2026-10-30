import type { EngineEvent, EngineSnapshot } from '@/domain/session/SessionEngine';
import { SessionEngine } from '@/domain/session/SessionEngine';
import type { SessionConfig } from '@/domain/session/SessionConfig';
import type { SessionResult } from '@/domain/session/SessionResult';
import { countWords } from '@/domain/metrics/computeSpeechMetrics';
import type { AudioLevelMeterPort } from '../ports/AudioLevelMeterPort';
import type { SoundPlayerPort } from '../ports/SoundPlayerPort';
import type { SpeechRecognizerPort } from '../ports/SpeechRecognizerPort';
import type { TimePort } from '../ports/TimePort';

export interface SessionState extends EngineSnapshot {
  readonly audioLevel: number;
  readonly transcript: string;
  readonly wordCount: number;
  readonly recognizerSupported: boolean;
  readonly micError: string | null;
}

export interface SessionRunnerDeps {
  readonly recognizer: SpeechRecognizerPort;
  readonly levelMeter: AudioLevelMeterPort;
  readonly sound: SoundPlayerPort;
  readonly time: TimePort;
  readonly config: SessionConfig;
}

const LEVEL_EMIT_STEP = 3;

/**
 * Runs ONE session: wires the pure engine to the microphone, the recognizer,
 * the sounds and the clock. Exposes an observable state (subscribe/getState),
 * compatible with React's useSyncExternalStore, but knows nothing about React.
 */
export class SessionRunner {
  private readonly engine: SessionEngine;
  private readonly listeners = new Set<() => void>();
  private state: SessionState;
  private finalText = '';
  private interimText = '';
  private audioLevel = 0;
  private micError: string | null = null;
  private stopTicker: (() => void) | null = null;
  private tornDown = false;

  constructor(private readonly deps: SessionRunnerDeps) {
    this.engine = new SessionEngine({
      speechGoalMs: deps.config.speechGoalSec * 1000,
      silenceThresholdMs: deps.config.silenceThresholdMs,
    });
    this.state = this.buildState();
  }

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly getState = (): SessionState => this.state;

  async start(): Promise<void> {
    if (this.engine.snapshot().status !== 'idle') return;
    const { recognizer, levelMeter, time, config } = this.deps;

    this.engine.start(time.now());

    recognizer.start({
      onTranscript: ({ final, interim }) => {
        this.finalText = final;
        this.interimText = interim;
        this.engine.registerVoice(time.now());
        this.emit();
      },
      onError: (code) => {
        this.micError = code;
        this.emit();
      },
    });

    this.stopTicker = time.every(config.tickMs, () => this.onTick());
    this.emit();

    try {
      await levelMeter.start((level) => this.onLevel(level));
    } catch {
      // The volume meter is optional: speech recognition alone can drive the game.
      this.micError ??= 'meter-unavailable';
      this.emit();
    }
  }

  /** Stops the session early (the player clicked "Finish"). */
  finish(): void {
    if (this.engine.snapshot().status !== 'running') return;
    this.engine.finish();
    this.teardown();
    this.deps.sound.play('complete');
    this.emit();
  }

  getResult(): SessionResult {
    const snap = this.engine.snapshot();
    return {
      transcript: this.fullTranscript(),
      activeSpeechMs: snap.activeSpeechMs,
      silenceMs: snap.silenceMs,
      elapsedMs: snap.elapsedMs,
    };
  }

  dispose(): void {
    this.teardown();
    this.listeners.clear();
  }

  // ---- internals ----

  private onTick(): void {
    const events = this.engine.tick(this.deps.time.now());
    for (const event of events) this.handleEvent(event);
    this.emit();
  }

  private handleEvent(event: EngineEvent): void {
    const { sound } = this.deps;
    if (event === 'frozen') sound.play('freeze');
    else if (event === 'resumed') sound.play('resume');
    else {
      this.teardown();
      sound.play('complete');
    }
  }

  private onLevel(level: number): void {
    if (level >= this.deps.config.voiceLevelThreshold) {
      this.engine.registerVoice(this.deps.time.now());
    }
    if (Math.abs(level - this.audioLevel) >= LEVEL_EMIT_STEP) {
      this.audioLevel = level;
      this.emit();
    }
  }

  private teardown(): void {
    if (this.tornDown) return;
    this.tornDown = true;
    this.stopTicker?.();
    this.stopTicker = null;
    this.deps.recognizer.stop();
    this.deps.levelMeter.stop();
  }

  private fullTranscript(): string {
    return `${this.finalText} ${this.interimText}`.trim();
  }

  private buildState(): SessionState {
    const transcript = this.fullTranscript();
    return {
      ...this.engine.snapshot(),
      audioLevel: this.audioLevel,
      transcript,
      wordCount: countWords(transcript),
      recognizerSupported: this.deps.recognizer.isSupported,
      micError: this.micError,
    };
  }

  private emit(): void {
    this.state = this.buildState();
    this.listeners.forEach((l) => l());
  }
}
