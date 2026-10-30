import type { Analysis, AnalysisSource, Mistake, VocabTip } from './Analysis';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const str = (v: unknown, max = 2000): string | null => (typeof v === 'string' ? v.slice(0, max) : null);
const strArray = (v: unknown, maxItems: number): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, maxItems) : [];

/**
 * Validates untrusted data (LLM output, network payload) and turns it into an
 * `Analysis`. Returns null if the shape is not usable.
 */
export function parseAnalysis(raw: unknown, source: AnalysisSource): Analysis | null {
  if (!isRecord(raw)) return null;

  const summary = str(raw.summary);
  const corrected = str(raw.corrected, 20_000);
  if (summary === null || corrected === null || typeof raw.score !== 'number') return null;

  const mistakes: Mistake[] = [];
  if (Array.isArray(raw.mistakes)) {
    for (const m of raw.mistakes.slice(0, 15)) {
      if (!isRecord(m)) continue;
      const original = str(m.original);
      const fix = str(m.fix);
      const explanation = str(m.explanation);
      if (original !== null && fix !== null && explanation !== null) {
        mistakes.push({ original, fix, explanation });
      }
    }
  }

  const vocabulary: VocabTip[] = [];
  if (Array.isArray(raw.vocabulary)) {
    for (const v of raw.vocabulary.slice(0, 8)) {
      if (!isRecord(v)) continue;
      const used = str(v.used);
      const alternatives = strArray(v.alternatives, 5);
      if (used !== null && alternatives.length > 0) vocabulary.push({ used, alternatives });
    }
  }

  return {
    source,
    score: Math.min(100, Math.max(0, Math.round(raw.score))),
    level: str(raw.level, 10),
    summary,
    corrected,
    mistakes,
    vocabulary,
    tips: strArray(raw.tips, 5),
  };
}
