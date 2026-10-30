/** Raw outcome of a finished (or stopped) session. */
export interface SessionResult {
  readonly transcript: string;
  readonly activeSpeechMs: number;
  readonly silenceMs: number;
  readonly elapsedMs: number;
}
