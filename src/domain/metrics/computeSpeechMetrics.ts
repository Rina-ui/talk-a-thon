import type { SessionResult } from '../session/SessionResult';
import type { SpeechMetrics } from './SpeechMetrics';

const FILLERS = ['um', 'uh', 'er', 'you know', 'basically', 'literally', 'actually', 'like'] as const;

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function computeSpeechMetrics(result: SessionResult): SpeechMetrics {
  const totalWords = countWords(result.transcript);
  const activeMinutes = result.activeSpeechMs / 60_000;
  const lower = result.transcript.toLowerCase();

  const fillers = FILLERS.map((word) => ({
    word,
    count: (lower.match(new RegExp(`\\b${word}\\b`, 'g')) ?? []).length,
  })).filter((f) => f.count > 0);

  return {
    totalWords,
    wordsPerMinute: activeMinutes > 0 ? Math.round(totalWords / activeMinutes) : 0,
    speakingRatioPct:
      result.elapsedMs > 0 ? Math.round((result.activeSpeechMs / result.elapsedMs) * 100) : 0,
    activeSpeechSec: Math.round(result.activeSpeechMs / 1000),
    silenceSec: Math.round(result.silenceMs / 1000),
    totalSec: Math.round(result.elapsedMs / 1000),
    fillers,
  };
}
