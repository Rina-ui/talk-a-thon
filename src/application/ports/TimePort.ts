export interface TimePort {
  now(): number;
  /** Calls `fn` every `ms`; returns a function that cancels it. */
  every(ms: number, fn: () => void): () => void;
}
