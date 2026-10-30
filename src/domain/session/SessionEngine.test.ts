import { describe, expect, it } from 'vitest';
import { SessionEngine } from './SessionEngine';

const config = { speechGoalMs: 1000, silenceThresholdMs: 300 };

describe('SessionEngine', () => {
  it('only counts down while the player is speaking', () => {
    const engine = new SessionEngine(config);
    engine.start(0);

    engine.registerVoice(100);
    engine.tick(100);
    expect(engine.snapshot().remainingSpeechMs).toBe(900);

    engine.tick(200);
    expect(engine.snapshot().remainingSpeechMs).toBe(800);

    engine.tick(500); // 400ms since last voice > 300ms threshold
    const snap = engine.snapshot();
    expect(snap.remainingSpeechMs).toBe(800);
    expect(snap.silenceMs).toBe(300);
    expect(snap.frozen).toBe(true);
  });

  it('emits frozen and resumed exactly once per transition', () => {
    const engine = new SessionEngine(config);
    engine.start(0);

    expect(engine.tick(400)).toEqual(['frozen']);
    expect(engine.tick(500)).toEqual([]);

    engine.registerVoice(550);
    expect(engine.tick(600)).toEqual(['resumed']);
    expect(engine.tick(700)).toEqual([]);
  });

  it('finishes once the speech goal is reached', () => {
    const engine = new SessionEngine(config);
    engine.start(0);

    let last: string[] = [];
    for (let t = 100; t <= 1000; t += 100) {
      engine.registerVoice(t);
      last = engine.tick(t);
    }
    expect(last).toContain('finished');
    expect(engine.snapshot().status).toBe('finished');
    expect(engine.snapshot().activeSpeechMs).toBe(1000);
    expect(engine.tick(1100)).toEqual([]);
  });

  it('ignores voice and ticks before start', () => {
    const engine = new SessionEngine(config);
    engine.registerVoice(10);
    expect(engine.tick(100)).toEqual([]);
    expect(engine.snapshot().elapsedMs).toBe(0);
  });
});
