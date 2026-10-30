import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Mic, Play, RefreshCw } from 'lucide-react';
import type { Topic } from '@/domain/topic/Topic';
import { createSessionConfig, DURATION_OPTIONS_SEC } from '@/domain/session/SessionConfig';
import { TopicWheel } from '../components/TopicWheel';
import { ArrowBadge, CircleButton, DarkCard, LightCard, Notch, Pill, PillLabel, StaticBars } from '../components/ui';
import { useWheel } from '../hooks/useWheel';
import { formatClock, formatDuration } from '../format';

interface Props {
  topics: readonly Topic[];
  pickTopic: (excludeId?: string) => Topic;
  recognizerSupported: boolean;
  onStart: (topic: Topic, durationSec: number) => void;
}

const FREEZE_SEC = createSessionConfig().silenceThresholdMs / 1000;

export function TopicSelectScreen({ topics, pickTopic, recognizerSupported, onStart }: Props) {
  const first = topics[0];
  if (!first) throw new Error('No topics configured');

  const { topic, rotation, spinning, spin } = useWheel(topics, pickTopic, first);
  const [durationSec, setDurationSec] = useState<number>(DURATION_OPTIONS_SEC[2]);

  return (
      <div className="grid animate-fade-in gap-4 lg:grid-cols-[1fr_300px]">
        {/* Hero */}
        <section className="hero relative flex min-h-[660px] flex-col overflow-hidden rounded-[40px] p-4 text-white sm:p-6">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div role="radiogroup" aria-label="Speaking time" className="flex gap-2">
              {DURATION_OPTIONS_SEC.map((sec) => (
                  <Pill key={sec} role="radio" aria-checked={sec === durationSec} selected={sec === durationSec} onClick={() => setDurationSec(sec)}>
                    {formatDuration(sec)}
                  </Pill>
              ))}
            </div>

            <Notch>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-ink">
              <Mic className="h-4 w-4" />
            </span>
              Wheel of topics
            </Notch>

            <PillLabel>English only</PillLabel>
          </div>

          <div className="relative z-10 grid flex-1 place-items-center py-8">
            <TopicWheel topics={topics} rotation={rotation} spinning={spinning} />
          </div>

          <div className="glass relative z-10 flex flex-col gap-4 rounded-[32px] p-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">Your topic</p>
              <h2 className="mt-1 text-2xl font-extrabold uppercase leading-tight sm:text-3xl">
                {topic.name}
              </h2>
              <p className="mt-2 max-w-md text-sm text-white/80">{topic.description}</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <CircleButton label="Spin the wheel" tone="white" size="lg" onClick={spin} disabled={spinning}>
                <RefreshCw className={`h-6 w-6 ${spinning ? 'animate-spin' : ''}`} />
              </CircleButton>
              <button
                  type="button"
                  onClick={() => onStart(topic, durationSec)}
                  disabled={spinning}
                  className="flex h-16 items-center gap-2 rounded-full bg-accent px-7 text-base font-extrabold text-ink shadow-lg transition active:scale-95 disabled:opacity-50"
              >
                <Play className="h-5 w-5 fill-current" />
                Start
              </button>
            </div>
          </div>
        </section>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <LightCard title="Speaking goal" action={<ArrowBadge />}>
            <svg viewBox="0 0 200 60" className="mb-2 h-14 w-full" aria-hidden>
              <path d="M0 50 C30 48 45 20 80 26 S130 12 160 18 S190 8 200 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <rect x="170" y="2" width="9" height="56" rx="4.5" fill="var(--color-accent)" />
            </svg>
            <p className="text-4xl font-extrabold tabular-nums">{formatClock(durationSec * 1000)}</p>
            <p className="text-sm text-ink/60">of active speaking to complete the round</p>
          </LightCard>

          <DarkCard title="Freeze rule" action={<ArrowBadge />}>
            <p className="mb-4 text-sm text-white/70">
              Stay silent for {FREEZE_SEC} seconds and the clock freezes until you talk again.
            </p>
            <StaticBars />
          </DarkCard>

          <LightCard title="Mic check">
            {recognizerSupported ? (
                <p className="flex items-center gap-2 text-sm text-ink/70">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  Speech recognition is ready. Your browser will ask for the microphone.
                </p>
            ) : (
                <p className="flex items-center gap-2 text-sm text-ink/70">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                  No speech recognition in this browser, so there will be no transcript. Use Chrome, Edge or Safari.
                </p>
            )}
          </LightCard>
        </div>
      </div>
  );
}