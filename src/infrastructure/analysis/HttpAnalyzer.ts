import type { AnalysisInput, SpeechAnalyzerPort } from '@/application/ports/SpeechAnalyzerPort';
import type { Analysis } from '@/domain/analysis/Analysis';
import { parseAnalysis } from '@/domain/analysis/parseAnalysis';

/**
 * Calls our own backend (`server/`), which holds the API key and talks to Claude.
 * The key never reaches the browser.
 */
export class HttpAnalyzer implements SpeechAnalyzerPort {
  constructor(
    private readonly endpoint: string,
    private readonly timeoutMs = 45_000,
  ) {}

  async analyze(input: AnalysisInput): Promise<Analysis> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: input.transcript,
        topic: input.topicName,
        feedbackLanguage: input.feedbackLanguage,
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!response.ok) throw new Error(`Analysis service returned ${response.status}`);

    const analysis = parseAnalysis(await response.json(), 'ai');
    if (!analysis) throw new Error('Analysis service returned an invalid payload');
    return analysis;
  }
}
