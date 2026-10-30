export type EngineStatus = 'idle' | 'running' | 'finished';
export type EngineEvent = 'frozen' | 'resumed' | 'finished';

export interface EngineConfig {
  readonly speechGoalMs: number;
  readonly silenceThresholdMs: number;
}

export interface EngineSnapshot {
  readonly status: EngineStatus;
  readonly speechGoalMs: number;
  readonly remainingSpeechMs: number;
  readonly activeSpeechMs: number;
  readonly elapsedMs: number;
  readonly silenceMs: number;
  readonly frozen: boolean;
}

/**
 * Pure game rules: the clock only counts down while the player is speaking.
 * No timers, no DOM, no React: time is injected through `now`, so it is fully
 * deterministic and unit-testable.
 */
export class SessionEngine {
  private status: EngineStatus = 'idle';
  private remainingSpeechMs: number;
  private elapsedMs = 0;
  private silenceMs = 0;
  private frozen = false;
  private lastVoiceAt = 0;
  private lastTickAt = 0;

  constructor(private readonly config: EngineConfig) {
    this.remainingSpeechMs = config.speechGoalMs;
  }

  start(now: number): void {
    if (this.status !== 'idle') return;
    this.status = 'running';
    this.lastVoiceAt = now;
    this.lastTickAt = now;
  }

  /** Call whenever the player is heard (speech recognition result or mic level). */
  registerVoice(now: number): void {
    if (this.status === 'running') this.lastVoiceAt = now;
  }

  /** Advance the clock. Returns the state transitions that happened. */
  tick(now: number): EngineEvent[] {
    if (this.status !== 'running') return [];

    const dt = Math.max(0, now - this.lastTickAt);
    this.lastTickAt = now;
    this.elapsedMs += dt;

    const events: EngineEvent[] = [];
    const speaking = now - this.lastVoiceAt <= this.config.silenceThresholdMs;

    if (speaking) {
      this.remainingSpeechMs = Math.max(0, this.remainingSpeechMs - dt);
      if (this.frozen) {
        this.frozen = false;
        events.push('resumed');
      }
    } else {
      this.silenceMs += dt;
      if (!this.frozen) {
        this.frozen = true;
        events.push('frozen');
      }
    }

    if (this.remainingSpeechMs <= 0) {
      this.status = 'finished';
      this.frozen = false;
      events.push('finished');
    }
    return events;
  }

  finish(): void {
    if (this.status === 'running') {
      this.status = 'finished';
      this.frozen = false;
    }
  }

  snapshot(): EngineSnapshot {
    return {
      status: this.status,
      speechGoalMs: this.config.speechGoalMs,
      remainingSpeechMs: this.remainingSpeechMs,
      activeSpeechMs: this.config.speechGoalMs - this.remainingSpeechMs,
      elapsedMs: this.elapsedMs,
      silenceMs: this.silenceMs,
      frozen: this.frozen,
    };
  }
}
