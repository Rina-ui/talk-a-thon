import { Loader2 } from 'lucide-react';

export function AnalyzingScreen() {
    return (
        <section
            role="status"
            className="hero flex min-h-140 sm:min-h-165 animate-fade-in flex-col items-center justify-center gap-4 rounded-[28px] sm:rounded-[40px] p-6 text-white"
        >
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="text-xl font-bold">Analyzing your speech…</p>
            <p className="text-sm text-white/60">Checking grammar, vocabulary and fluency.</p>
        </section>
    );
}