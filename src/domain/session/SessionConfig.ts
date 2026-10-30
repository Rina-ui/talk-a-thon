export interface SessionConfig {
  /** Active speaking time the player must accumulate to win. */
  readonly speechGoalSec: number;
  /** Silence longer than this freezes the clock. */
  readonly silenceThresholdMs: number;
  /** Microphone level (0-100) above which we consider the player to be speaking. */
  readonly voiceLevelThreshold: number;
  /** Game loop resolution. */
  readonly tickMs: number;
}

export const DURATION_OPTIONS_SEC = [60, 180, 300] as const;

export function createSessionConfig(speechGoalSec: number = 300): SessionConfig {
  return {
    speechGoalSec,
    silenceThresholdMs: 2500,
    voiceLevelThreshold: 15,
    tickMs: 100,
  };
}
