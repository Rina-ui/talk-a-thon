import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Lightbulb, RotateCcw, Sparkles } from 'lucide-react';
import type { SessionReport } from '@/domain/SessionReport';
import { Card } from '../components/Card';
import { ArrowBadge, DarkCard, LightCard, Notch, PillLabel } from '../components/ui';

interface Props {
    report: SessionReport;
    onReplay: () => void;
}

export function ReportScreen({ report, onReplay }: Props) {
    const { metrics, analysis, topic, transcript } = report;

    return (
        <div className="flex animate-fade-in flex-col gap-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                {/* Hero */}
                <section className="hero relative flex min-h-[520px] flex-col overflow-hidden rounded-[40px] p-4 text-white sm:p-6">
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                        <PillLabel>
                            {topic.name}
                        </PillLabel>
                        <Notch>Round complete</Notch>
                        <PillLabel>{analysis?.source === 'local' ? 'Offline check' : 'AI feedback'}</PillLabel>
                    </div>

                    <div className="relative z-10 grid flex-1 place-items-center py-8 text-center">
                        {analysis ? (
                            <div>
                                <p className="text-[88px] font-extrabold leading-none tabular-nums tracking-tight sm:text-[110px]">
                                    {analysis.score}
                                    <span className="text-3xl font-bold text-white/50">/100</span>
                                </p>
                                <p className="mt-4 inline-block rounded-full bg-white px-5 py-1.5 text-sm font-extrabold text-ink">
                                    Level {analysis.level ?? '–'}
                                </p>
                            </div>
                        ) : (
                            <p className="max-w-sm text-white/80">
                                Not enough speech was captured to analyze. Speak a bit longer, closer to the microphone, and check that
                                your browser supports speech recognition.
                            </p>
                        )}
                    </div>

                    {analysis && (
                        <div className="glass relative z-10 rounded-[32px] p-5">
                            <p className="text-xs font-bold uppercase tracking-widest text-white/60">Summary</p>
                            <p className="mt-1 text-base leading-relaxed">{analysis.summary}</p>
                        </div>
                    )}
                </section>

                {/* Stats */}
                <div className="flex flex-col gap-4">
                    <LightCard title="Words / min" action={<ArrowBadge />}>
                        <p className="text-4xl font-extrabold tabular-nums">{metrics.wordsPerMinute}</p>
                        <p className="text-sm text-ink/60">{metrics.totalWords} words in total</p>
                    </LightCard>

                    <DarkCard title="Speaking ratio" action={<ArrowBadge />}>
                        <p className="text-4xl font-extrabold tabular-nums">{metrics.speakingRatioPct}%</p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                            <div className="h-full rounded-full bg-accent" style={{ width: `${metrics.speakingRatioPct}%` }} />
                        </div>
                        <p className="mt-2 text-sm text-white/60">of the round spent speaking</p>
                    </DarkCard>

                    <LightCard title="Frozen silence">
                        <p className="text-4xl font-extrabold tabular-nums">{metrics.silenceSec}s</p>
                        <p className="text-sm text-ink/60">out of {metrics.totalSec}s total</p>
                    </LightCard>
                </div>
            </div>

            {analysis && (
                <>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card title="Your transcript" icon={<BookOpen className="h-5 w-5" />}>
                            <p className="rounded-2xl bg-white/70 p-4 text-sm leading-relaxed text-ink/80">{transcript}</p>
                        </Card>
                        <Card title="Corrected version" icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}>
                            <p className="rounded-2xl bg-white/70 p-4 text-sm leading-relaxed">{analysis.corrected}</p>
                        </Card>
                    </div>

                    <Card title="Mistakes to fix" icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}>
                        {analysis.mistakes.length > 0 ? (
                            <ul className="grid gap-3 md:grid-cols-2">
                                {analysis.mistakes.map((m, i) => (
                                    <li key={i} className="space-y-1 rounded-2xl bg-white/70 p-4">
                                        <div className="flex flex-wrap items-center gap-2 text-sm">
                                            <span className="font-semibold text-red-600 line-through">{m.original}</span>
                                            <ArrowRight className="h-3.5 w-3.5 text-ink/40" />
                                            <span className="font-bold text-emerald-700">{m.fix}</span>
                                        </div>
                                        <p className="text-xs text-ink/60">{m.explanation}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="py-2 text-center text-sm italic text-ink/60">No major mistakes detected. Great job!</p>
                        )}
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card title="Vocabulary upgrades" icon={<Sparkles className="h-5 w-5 text-amber-600" />}>
                            {analysis.vocabulary.length > 0 ? (
                                <ul className="space-y-3">
                                    {analysis.vocabulary.map((v) => (
                                        <li key={v.used} className="space-y-1.5 rounded-2xl bg-white/70 p-4">
                                            <div className="text-xs text-ink/60">
                                                Instead of <strong className="text-ink">“{v.used}”</strong>, try:
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {v.alternatives.map((alt) => (
                                                    <span key={alt} className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
                            {alt}
                          </span>
                                                ))}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="py-2 text-center text-sm italic text-ink/60">No suggestions this time.</p>
                            )}
                        </Card>

                        <Card title="Fillers and hesitations" icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}>
                            {metrics.fillers.length > 0 ? (
                                <ul className="flex flex-wrap gap-2">
                                    {metrics.fillers.map((f) => (
                                        <li key={f.word} className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2">
                                            <span className="text-sm font-bold">“{f.word}”</span>
                                            <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] text-white">{f.count}×</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="py-2 text-center text-sm italic text-ink/60">Zero fillers detected. Direct and clear!</p>
                            )}
                        </Card>
                    </div>

                    {analysis.tips.length > 0 && (
                        <Card title="How to improve" icon={<Lightbulb className="h-5 w-5 text-amber-600" />}>
                            <ul className="list-disc space-y-1 pl-5 text-sm text-ink/80">
                                {analysis.tips.map((tip) => (
                                    <li key={tip}>{tip}</li>
                                ))}
                            </ul>
                            {analysis.source === 'local' && (
                                <p className="text-xs text-ink/50">Offline analysis: AI correction was unavailable.</p>
                            )}
                        </Card>
                    )}
                </>
            )}

            <button
                type="button"
                onClick={onReplay}
                className="mx-auto flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-extrabold text-white shadow-lg transition active:scale-95"
            >
                <RotateCcw className="h-4 w-4" />
                Play a new round
            </button>
        </div>
    );
}