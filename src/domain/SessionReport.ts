import type { Analysis } from './analysis/Analysis';
import type { SpeechMetrics } from './metrics/SpeechMetrics';
import type { Topic } from './topic/Topic';

export interface SessionReport {
  readonly topic: Topic;
  readonly transcript: string;
  readonly metrics: SpeechMetrics;
  /** null when there was not enough speech to analyze. */
  readonly analysis: Analysis | null;
}
