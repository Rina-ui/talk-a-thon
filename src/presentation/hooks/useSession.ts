import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { SessionRunner, SessionState } from '@/application/services/SessionRunner';
import type { SessionResult } from '@/domain/session/SessionResult';

const noopSubscribe = (): (() => void) => () => {};
const nullSnapshot = (): null => null;

/**
 * React adapter for SessionRunner. The runner is created inside the effect so
 * that StrictMode's mount/unmount/mount cycle gets a fresh, working session.
 */
export function useSession(create: () => SessionRunner) {
  const [runner, setRunner] = useState<SessionRunner | null>(null);

  useEffect(() => {
    const r = create();
    setRunner(r);
    void r.start();
    return () => r.dispose();
  }, [create]);

  const state = useSyncExternalStore<SessionState | null>(
    runner ? runner.subscribe : noopSubscribe,
    runner ? runner.getState : nullSnapshot,
  );

  const finish = useCallback(() => runner?.finish(), [runner]);
  const getResult = useCallback((): SessionResult | null => runner?.getResult() ?? null, [runner]);

  return { state, finish, getResult };
}
