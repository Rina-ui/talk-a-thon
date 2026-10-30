import { describe, expect, it } from 'vitest';
import { computeSpeechMetrics, countWords } from './computeSpeechMetrics';

describe('computeSpeechMetrics', () => {
  it('computes words per minute on active speech time only', () => {
    const m = computeSpeechMetrics({
      transcript: 'one two three four five six',
      activeSpeechMs: 30_000,
      silenceMs: 10_000,
      elapsedMs: 40_000,
    });
    expect(m.totalWords).toBe(6);
    expect(m.wordsPerMinute).toBe(12);
    expect(m.speakingRatioPct).toBe(75);
  });

  it('counts filler words', () => {
    const m = computeSpeechMetrics({
      transcript: 'Um I think, you know, it was like um fine',
      activeSpeechMs: 10_000,
      silenceMs: 0,
      elapsedMs: 10_000,
    });
    expect(m.fillers).toContainEqual({ word: 'um', count: 2 });
    expect(m.fillers).toContainEqual({ word: 'you know', count: 1 });
    expect(m.fillers).toContainEqual({ word: 'like', count: 1 });
  });

  it('handles empty text', () => {
    expect(countWords('   ')).toBe(0);
  });
});
