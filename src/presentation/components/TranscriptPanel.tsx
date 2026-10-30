import { useEffect, useRef } from 'react';

interface Props {
    text: string;
}

/** Live transcript, designed to sit inside a glass panel over a dark hero. */
export function TranscriptPanel({ text }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ref.current?.scrollTo({ top: ref.current.scrollHeight });
    }, [text]);

    return (
        <div aria-live="polite">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60">
                <span className="h-2 w-2 animate-ping rounded-full bg-red-400" />
                Live transcript · EN-US
            </p>
            <div ref={ref} className="max-h-32 overflow-y-auto text-base leading-relaxed text-white">
                {text || <span className="text-white/55">Start speaking in English: your words will appear here.</span>}
            </div>
        </div>
    );
}