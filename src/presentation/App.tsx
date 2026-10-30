import { useCallback, useMemo, useState } from 'react';
import { container } from '@/composition/container';
import type { SessionReport } from '@/domain/SessionReport';
import { createSessionConfig, type SessionConfig } from '@/domain/session/SessionConfig';
import type { SessionResult } from '@/domain/session/SessionResult';
import type { Topic } from '@/domain/topic/Topic';
import { AnalyzingScreen } from './screens/AnalyzingScreen';
import { ReportScreen } from './screens/ReportScreen';
import { SessionScreen } from './screens/SessionScreen';
import { TopicSelectScreen } from './screens/TopicSelectScreen';
import {AppShell} from "@/presentation/components/AppShell";

type Phase =
    | { name: 'select' }
    | { name: 'session' }
    | { name: 'analyzing' }
    | { name: 'report'; report: SessionReport };

interface ActiveSession {
  topic: Topic;
  config: SessionConfig;
}

export default function App() {
  const [phase, setPhase] = useState<Phase>({ name: 'select' });
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  const createRunner = useMemo(
      () => (session ? () => container.createRunner(session.config) : null),
      [session],
  );

  const handleStart = useCallback((topic: Topic, durationSec: number) => {
    container.sound.prime();
    setSession({ topic, config: createSessionConfig(durationSec) });
    setPhase({ name: 'session' });
  }, []);

  const handleFinished = useCallback(
      (result: SessionResult) => {
        if (!session) return;
        setPhase({ name: 'analyzing' });
        container.analyzeSession
            .execute(session.topic, result)
            .then((report) => setPhase({ name: 'report', report }))
            .catch(() => setPhase({ name: 'select' }));
      },
      [session],
  );

  const toggleSound = (): void => {
    const next = !soundOn;
    container.sound.setEnabled(next);
    setSoundOn(next);
  };

  return (
      <AppShell
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onHome={() => setPhase({ name: 'select' })}
          inSession={phase.name === 'session'}
      >
        {phase.name === 'select' && (
            <TopicSelectScreen
                topics={container.topics}
                pickTopic={(excludeId) => container.pickTopic.execute(excludeId)}
                recognizerSupported={container.recognizerSupported}
                onStart={handleStart}
            />
        )}
        {phase.name === 'session' && session && createRunner && (
            <SessionScreen topic={session.topic} create={createRunner} onFinished={handleFinished} />
        )}
        {phase.name === 'analyzing' && <AnalyzingScreen />}
        {phase.name === 'report' && <ReportScreen report={phase.report} onReplay={() => setPhase({ name: 'select' })} />}
      </AppShell>
  );
}