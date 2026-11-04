import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

export function ArrowBadge() {
    return (
        <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-white">
      <ArrowUpRight className="h-4 w-4" />
    </span>
    );
}

interface CircleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    tone?: 'light' | 'dark' | 'white';
    size?: 'md' | 'lg';
}

const CIRCLE_TONES = {
    light: 'neo text-ink hover:brightness-105',
    dark: 'bg-ink text-white shadow-lg',
    white: 'bg-white text-ink shadow-lg',
} as const;
const CIRCLE_SIZES = { md: 'h-14 w-14', lg: 'h-16 w-16' } as const;

export function CircleButton({ label, tone = 'light', size = 'md', className = '', children, ...rest }: CircleProps) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={`grid shrink-0 place-items-center rounded-full transition active:scale-95 disabled:opacity-40 ${CIRCLE_TONES[tone]} ${CIRCLE_SIZES[size]} ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}

/** Pill used on top of dark hero panels. */
export function Pill({
                         selected = false,
                         className = '',
                         children,
                         ...rest
                     }: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
    return (
        <button
            type="button"
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-95 disabled:opacity-50 ${
                selected ? 'bg-white text-ink shadow' : 'bg-white/15 text-white hover:bg-white/25'
            } ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}

export function PillLabel({ children }: { children: ReactNode }) {
    return <span className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow">{children}</span>;
}

/** The black capsule at the top center of a hero panel. */
export function Notch({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-center gap-3 rounded-full bg-black/80 px-3 py-2 pr-5 text-sm font-medium text-white ring-1 ring-white/10">
            {children}
        </div>
    );
}

interface CardProps {
    title?: string;
    action?: ReactNode;
    className?: string;
    children: ReactNode;
}

function CardHeader({ title, action }: Pick<CardProps, 'title' | 'action'>) {
    if (!title && !action) return null;
    return (
        <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold leading-tight">{title}</h3>
            {action}
        </div>
    );
}

export function LightCard({ title, action, className = '', children }: CardProps) {
    return (
        <section className={`neo rounded-[24px] sm:rounded-[32px] p-5 ${className}`}>
            <CardHeader title={title} action={action} />
            {children}
        </section>
    );
}

export function DarkCard({ title, action, className = '', children }: CardProps) {
    return (
        <section className={`rounded-[24px] sm:rounded-[32px] bg-ink p-5 text-white ${className}`}>
            <CardHeader title={title} action={action} />
            {children}
        </section>
    );
}

const FACTORS = Array.from({ length: 32 }, (_, i) => 0.35 + 0.65 * Math.abs(Math.sin(i * 1.7)));

/** Decorative equalizer bars; `level` (0-100) makes them live. */
export function LiveBars({ level, active = true }: { level: number; active?: boolean }) {
    return (
        <div className="flex h-20 items-end gap-[3px]" aria-hidden>
            {FACTORS.map((factor, i) => (
                <span
                    key={i}
                    className="w-full rounded-full bg-white/85 transition-[height] duration-100"
                    style={{ height: `${active ? Math.max(8, Math.min(100, level * 1.6 * factor)) : 8}%` }}
                />
            ))}
        </div>
    );
}

export function StaticBars() {
    return (
        <div className="flex h-14 items-end gap-[3px]" aria-hidden>
            {FACTORS.map((factor, i) => (
                <span key={i} className="w-full rounded-full bg-white/70" style={{ height: `${25 + factor * 75}%` }} />
            ))}
        </div>
    );
}