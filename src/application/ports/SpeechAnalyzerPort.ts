import type { Analysis, FeedbackLanguage } from '@/domain/analysis/Analysis';

export interface AnalysisInput {
  readonly transcript: string;
  readonly topicName: string;
  readonly feedbackLanguage: FeedbackLanguage;
}

export interface SpeechAnalyzerPort {
  analyze(input: AnalysisInput): Promise<Analysis>;
}
