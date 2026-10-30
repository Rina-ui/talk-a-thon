import type { SoundEffect, SoundPlayerPort } from '@/application/ports/SoundPlayerPort';

export class WebAudioSoundPlayer implements SoundPlayerPort {
  private ctx: AudioContext | null = null;
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  prime(): void {
    const ctx = this.context();
    if (ctx.state === 'suspended') void ctx.resume();
  }

  play(effect: SoundEffect): void {
    if (!this.enabled) return;
    try {
      switch (effect) {
        case 'tick':
          this.tone(400, 0, 0.05, 'sine', 0.05);
          break;
        case 'freeze':
          this.tone(220, 0, 0.3, 'sawtooth', 0.15, 110);
          break;
        case 'resume':
          this.tone(300, 0, 0.2, 'triangle', 0.1, 600);
          break;
        case 'complete':
          [440, 554.37, 659.25, 880].forEach((freq, i) => this.tone(freq, i * 0.12, 0.3, 'sine', 0.1));
          break;
      }
    } catch {
      // Audio is a nice-to-have; never break the game because of it.
    }
  }

  private context(): AudioContext {
    return (this.ctx ??= new AudioContext());
  }

  private tone(freq: number, offset: number, duration: number, type: OscillatorType, volume: number, endFreq?: number): void {
    const ctx = this.context();
    const t0 = ctx.currentTime + offset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration);
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration);
  }
}
