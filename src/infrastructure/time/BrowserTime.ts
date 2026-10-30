import type { TimePort } from '@/application/ports/TimePort';

export class BrowserTime implements TimePort {
  now(): number {
    return Date.now();
  }

  every(ms: number, fn: () => void): () => void {
    const id = window.setInterval(fn, ms);
    return () => window.clearInterval(id);
  }
}
