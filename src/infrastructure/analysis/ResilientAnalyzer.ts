import type { AnalysisInput, SpeechAnalyzerPort } from '@/application/ports/SpeechAnalyzerPort';
import type { Analysis } from '@/domain/analysis/Analysis';

/** Tries the primary analyzer and silently falls back to the secondary one on failure. */
export class ResilientAnalyzer implements SpeechAnalyzerPort {
  constructor(
    private readonly primary: SpeechAnalyzerPort,
    private readonly fallback: SpeechAnalyzerPort,
  ) {}

  async analyze(input: AnalysisInput): Promise<Analysis> {
    try {
      return await this.primary.analyze(input);
    } catch (error) {
      console.warn('Primary analyzer failed, using fallback:', error);
      return this.fallback.analyze(input);
    }
  }
}
