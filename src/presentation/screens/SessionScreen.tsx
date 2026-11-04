import { useEffect, useRef } from 'react';
import { Activity, ShieldAlert } from 'lucide-react';
import type { SessionRunner } from '@/application/services/SessionRunner';
import type { SessionResult } from '@/domain/session/SessionResult';
import type { Topic } from '@/domain/topic/Topic';
import { TranscriptPanel } from '../components/TranscriptPanel';
import { ArrowBadge, DarkCard, LightCard, LiveBars, Notch, Pill, PillLabel } from '../components/ui';
import { useSession } from '../hooks/useSession';
import { formatClock } from '../format';

interface Props {
  topic: Topic;
  create: () => SessionRunner;
  onFinished: (result: SessionResult) => void;
}

const MIC_MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone access was denied. Allow it in your browser settings, then start a new round.',
  'service-not-allowed': 'Microphone access was denied. Allow it in your browser settings, then start a new round.',
  'audio-capture': 'No microphone found. Check that one is plugged in and selected in your system settings.',
  network: 'Speech recognition could not reach its server. It needs an internet connection and does not work in Brave or Firefox: try Chrome or Edge.',
  unsupported: 'This browser has no speech recognition. Use Chrome, Edge or Safari.',
  'start-failed': 'Speech recognition could not start. Reload the page and try again.',
  'meter-unavailable': 'The microphone could not be opened. Check the browser permission and close other apps using the mic.',
};

const RING_R = 120;
const RING_LEN = 2 * Math.PI * RING_R;

export function SessionScreen({ topic, create, onFinished }: Props) {
  const { state, finish, getResult } = useSession(create);
  const notified = useRef(false);

  useEffect(() => {
    if (state?.status !== 'finished' || notified.current) return;
    notified.current = true;
    const result = getResult();
    if (result) onFinished(result);
  }, [state?.status, getResult, onFinished]);

  if (!state) return null;

  const progress = state.speechGoalMs > 0 ? Math.min(1, state.activeSpeechMs / state.speechGoalMs) : 0;
  const micMessage = state.micError ? (MIC_MESSAGES[state.micError] ?? `Speech recognition error: ${state.micError}`) : undefined;
  const ringColor = state.frozen ? '#ff9a9a' : 'var(--color-accent)';

  return (
      <div className="grid animate-fade-in gap-4 lg:grid-cols-[1fr_300px]">
        {/* Hero */}
        <section className="hero relative flex min-h-140 sm:min-h-165 flex-col overflow-hidden rounded-[28px] sm:rounded-[40px] p-4 text-white sm:p-6">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <PillLabel>
              {topic.name}
            </PillLabel>

            <Notch>
            <span className={`grid h-8 w-8 place-items-center rounded-full ${state.frozen ? 'bg-red-400 text-ink' : 'bg-white text-ink'}`}>
              {state.frozen ? <ShieldAlert className="h-4 w-4" /> : <Activity className="h-4 w-4 animate-pulse" />}
            </span>
              <span role="status">{state.frozen ? 'Frozen · keep talking!' : 'Voice active'}</span>
            </Notch>

            <Pill onClick={finish}>Finish</Pill>
          </div>

          {micMessage && (
              <p role="alert" className="glass relative z-10 mt-4 rounded-2xl px-4 py-3 text-sm text-red-200">
                {micMessage}
              </p>
          )}

          <div className="relative z-10 grid flex-1 place-items-center py-8">
            <div className="relative aspect-square w-[min(72vw,20rem)]">
              <svg viewBox="0 0 280 280" className="h-full w-full -rotate-90" aria-hidden>
                <circle cx="140" cy="140" r={RING_R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="10" />
                <circle
                    cx="140"
                    cy="140"
                    r={RING_R}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={RING_LEN}
                    strokeDashoffset={RING_LEN * (1 - progress)}
                    className="transition-[stroke-dashoffset,stroke] duration-200"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-extrabold tabular-nums tracking-tight transition-opacity sm:text-7xl ${state.frozen ? 'opacity-50' : ''}`}>
                {formatClock(state.remainingSpeechMs)}
              </span>
                <span className="mt-1 text-xs font-bold uppercase tracking-widest text-white/60">speech time left</span>
              </div>
            </div>
          </div>

          <div className="glass relative z-10 rounded-3xl sm:rounded-4xl p-5">
            <TranscriptPanel text={state.transcript} />
          </div>
        </section>

        {/* Right column */}
        <div className="grid gap-4 sm:grid-cols-3 lg:flex lg:flex-col">
          <LightCard title="Total elapsed" action={<ArrowBadge />}>
            <p className="text-4xl font-extrabold tabular-nums">{formatClock(state.elapsedMs)}</p>
            <p className="text-sm text-ink/60">
              <strong className="text-ink">{state.wordCount}</strong> words so far
            </p>
          </LightCard>

          <DarkCard title="Live volume" action={<ArrowBadge />}>
            <LiveBars level={state.audioLevel} active={!state.frozen} />
            <p className="mt-3 text-sm text-white/70">{state.frozen ? 'Silence…' : 'Audio detected'}</p>
          </DarkCard>

          <LightCard title="Discussion idea">
            <p className="text-sm leading-relaxed text-ink/70">“{topic.description}”</p>
          </LightCard>
        </div>
      </div>
  );
}