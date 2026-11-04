import type { ReactNode } from 'react';
import { Flame, LogOut, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { CircleButton } from './ui';

interface Props {
    soundOn: boolean;
    onToggleSound: () => void;
    onHome: () => void;
    inSession: boolean;
    children: ReactNode;
}

export function AppShell({ soundOn, onToggleSound, onHome, inSession, children }: Props) {
    return (
        <div className="min-h-dvh bg-paper p-2 sm:p-5">
            <div className="shell mx-auto flex w-full max-w-310 flex-col gap-4 p-3 sm:p-4 md:flex-row">
                <aside className="neo flex shrink-0 items-center justify-between gap-3 rounded-[28px] sm:rounded-[36px] p-3 md:w-24 md:flex-col md:py-5">
                    <div className="flex flex-col items-center gap-1">
                        <div className="grid h-14 w-14 place-items-center rounded-full bg-ink text-white" aria-hidden>
                            <Flame className="h-6 w-6" />
                        </div>
                        <span className="hidden text-[10px] font-extrabold tracking-widest md:block">TALK</span>
                    </div>

                    <nav className="flex gap-3 md:flex-col" aria-label="Controls">
                        <CircleButton label={soundOn ? 'Mute sound effects' : 'Unmute sound effects'} aria-pressed={soundOn} onClick={onToggleSound}>
                            {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-ink/50" />}
                        </CircleButton>
                        <CircleButton label="New round" onClick={onHome}>
                            <RotateCcw className="h-5 w-5" />
                        </CircleButton>
                    </nav>

                    <div className="flex w-14 flex-col items-center gap-1">
                        {inSession && (
                            <>
                                <span className="hidden text-[10px] font-bold text-ink/60 md:block">End</span>
                                <CircleButton label="Quit this round" tone="dark" onClick={onHome}>
                                    <LogOut className="h-5 w-5" />
                                </CircleButton>
                            </>
                        )}
                    </div>
                </aside>

                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </div>
    );
}