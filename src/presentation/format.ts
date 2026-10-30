/** 187000 -> "3:07" */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatDuration(sec: number): string {
  return sec % 60 === 0 ? `${sec / 60} min` : `${sec}s`;
}
