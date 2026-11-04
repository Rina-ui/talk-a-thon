import { Flame } from 'lucide-react';
import type { Topic } from '@/domain/topic/Topic';
import { SPIN_MS } from '../hooks/useWheel';

interface Props {
    topics: readonly Topic[];
    rotation: number;
    spinning: boolean;
    /** Topic currently under the pointer (highlighted once the wheel stops). */
    activeId: string | null;
}

const C = 100;
const R = 98;
const TONES = ['#141b29', '#1b2435'] as const;
const ACCENT = '#9bbcff';

/** Angle in degrees, clockwise from the top. */
function polar(radius: number, deg: number): [number, number] {
    const rad = (deg * Math.PI) / 180;
    return [C + radius * Math.sin(rad), C - radius * Math.cos(rad)];
}

export function TopicWheel({ topics, rotation, spinning, activeId }: Props) {
    const slice = 360 / topics.length;

    return (
        <div className="relative mx-auto aspect-square w-[min(76vw,20rem)]" role="img" aria-label="Wheel of topics">
            <svg viewBox="0 0 20 14" className="absolute -top-3 left-1/2 z-20 h-4 w-6 -translate-x-1/2 drop-shadow" aria-hidden>
                <polygon points="0,0 20,0 10,14" fill={ACCENT} />
            </svg>

            <svg
                viewBox="0 0 200 200"
                className="h-full w-full rounded-full border border-white/20 shadow-[0_0_60px_rgba(120,160,255,0.18)]"
                style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.99, 0.24, 1)` : 'none',
                }}
            >
                <defs>
                    <radialGradient id="wheel-depth" cx="50%" cy="50%" r="50%">
                        <stop offset="55%" stopColor="#000" stopOpacity="0" />
                        <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
                    </radialGradient>
                </defs>

                {topics.map((topic, i) => {
                    const [x0, y0] = polar(R, i * slice);
                    const [x1, y1] = polar(R, (i + 1) * slice);
                    const [tx, ty] = polar(R * 0.72, (i + 0.5) * slice);
                    const active = topic.id === activeId;
                    return (
                        <g key={topic.id}>
                            <path
                                d={`M${C} ${C} L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z`}
                                fill={active ? ACCENT : TONES[i % 2]}
                                stroke="rgba(255,255,255,0.10)"
                                strokeWidth="0.8"
                                style={{ transition: 'fill 0.3s' }}
                            />
                            <text
                                x={tx}
                                y={ty}
                                fontSize="14"
                                fontWeight="700"
                                fill={active ? '#0c0c0e' : 'rgba(255,255,255,0.7)'}
                                textAnchor="middle"
                                dominantBaseline="central"
                            >
                                {i + 1}
                            </text>
                        </g>
                    );
                })}

                <circle cx={C} cy={C} r={R} fill="url(#wheel-depth)" pointerEvents="none" />
            </svg>

            <div className="absolute inset-0 m-auto flex h-14 w-14 items-center sm:h-16 sm:w-16 justify-center rounded-full border border-white/20 bg-ink shadow-lg">
                <Flame className="h-7 w-7 text-white" />
            </div>
        </div>
    );
}