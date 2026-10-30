import { Flame } from 'lucide-react';
import type { Topic } from '@/domain/topic/Topic';
import { SPIN_MS } from '../hooks/useWheel';

interface Props {
    topics: readonly Topic[];
    rotation: number;
    spinning: boolean;
}

const C = 100;
const R = 98;

/** Angle in degrees, clockwise from the top. */
function polar(radius: number, deg: number): [number, number] {
    const rad = (deg * Math.PI) / 180;
    return [C + radius * Math.sin(rad), C - radius * Math.cos(rad)];
}

export function TopicWheel({ topics, rotation, spinning }: Props) {
    const slice = 360 / topics.length;

    return (
        <div className="relative mx-auto h-72 w-72 sm:h-80 sm:w-80" role="img" aria-label="Wheel of topics">
            <svg viewBox="0 0 200 14" className="absolute -top-3 left-1/2 z-20 h-4 w-8 -translate-x-1/2 drop-shadow" aria-hidden>
                <polygon points="0,0 200,0 100,14" className="fill-white" />
            </svg>

            <svg
                viewBox="0 0 200 200"
                className="h-full w-full rounded-full border-4 border-white/25 shadow-[0_0_80px_rgba(120,160,255,0.35)]"
                style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.99, 0.24, 1)` : 'none',
                }}
            >
                {topics.map((topic, i) => {
                    const [x0, y0] = polar(R, i * slice);
                    const [x1, y1] = polar(R, (i + 1) * slice);
                    const [tx, ty] = polar(R * 0.72, (i + 0.5) * slice);
                    return (
                        <g key={topic.id}>
                            <path d={`M${C} ${C} L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z`} fill={topic.color} stroke="#0a0e17" strokeWidth="1.2" />
                            <text x={tx} y={ty} fontSize="15" fontWeight="800" fill="#fff" textAnchor="middle" dominantBaseline="central">
                                {i + 1}
                            </text>
                        </g>
                    );
                })}
            </svg>

            <div className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/25 bg-ink shadow-lg">
                <Flame className="h-7 w-7 text-white" />
            </div>
        </div>
    );
}