import type { FeedbackLanguage } from '@/domain/analysis/Analysis';
import { computeSpeechMetrics, countWords } from '@/domain/metrics/computeSpeechMetrics';
import type { SessionReport } from '@/domain/SessionReport';
import type { SessionResult } from '@/domain/session/SessionResult';
import type { Topic } from '@/domain/topic/Topic';
import type { SpeechAnalyzerPort } from '../ports/SpeechAnalyzerPort';

const MIN_WORDS_TO_ANALYZE = 5;

export class AnalyzeSession {
  constructor(
    private readonly analyzer: SpeechAnalyzerPort,
    private readonly feedbackLanguage: FeedbackLanguage,
  ) {}

  async execute(topic: Topic, result: SessionResult): Promise<SessionReport> {
    const transcript = result.transcript.trim();
    const metrics = computeSpeechMetrics({ ...result, transcript });

    const analysis =
      countWords(transcript) < MIN_WORDS_TO_ANALYZE
        ? null
        : await this.analyzer.analyze({
            transcript,
            topicName: topic.name,
            feedbackLanguage: this.feedbackLanguage,
          });

    return { topic, transcript, metrics, analysis };
  }
}
