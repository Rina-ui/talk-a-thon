export type FeedbackLanguage = 'fr' | 'en';
export type AnalysisSource = 'ai' | 'local';

export interface Mistake {
  readonly original: string;
  readonly fix: string;
  readonly explanation: string;
}

export interface VocabTip {
  readonly used: string;
  readonly alternatives: readonly string[];
}

export interface Analysis {
  readonly source: AnalysisSource;
  /** 0-100 */
  readonly score: number;
  /** CEFR estimate (A2…C2) when known. */
  readonly level: string | null;
  readonly summary: string;
  readonly corrected: string;
  readonly mistakes: readonly Mistake[];
  readonly vocabulary: readonly VocabTip[];
  readonly tips: readonly string[];
}
