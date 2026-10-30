import type { AudioLevelMeterPort } from '@/application/ports/AudioLevelMeterPort';

export class WebAudioLevelMeter implements AudioLevelMeterPort {
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private raf = 0;
  /** Incremented on every start/stop so stale async work can detect it was cancelled. */
  private generation = 0;

  async start(onLevel: (level: number) => void): Promise<void> {
    const gen = ++this.generation;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    if (gen !== this.generation) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    ctx.createMediaStreamSource(stream).connect(analyser);

    this.stream = stream;
    this.ctx = ctx;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const loop = (): void => {
      if (gen !== this.generation) return;
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, v) => sum + v, 0) / data.length;
      onLevel(Math.min(100, Math.round((avg / 128) * 100)));
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  stop(): void {
    this.generation++;
    cancelAnimationFrame(this.raf);
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.ctx?.close();
    this.stream = null;
    this.ctx = null;
  }
}
