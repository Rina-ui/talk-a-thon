export interface FillerCount {
  readonly word: string;
  readonly count: number;
}

export interface SpeechMetrics {
  readonly totalWords: number;
  readonly wordsPerMinute: number;
  /** Share of the session actually spent speaking (0-100). */
  readonly speakingRatioPct: number;
  readonly activeSpeechSec: number;
  readonly silenceSec: number;
  readonly totalSec: number;
  readonly fillers: readonly FillerCount[];
}
