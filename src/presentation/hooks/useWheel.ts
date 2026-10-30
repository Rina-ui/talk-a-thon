import { useCallback, useEffect, useRef, useState } from 'react';
import type { Topic } from '@/domain/topic/Topic';

export const SPIN_MS = 4000;

export function useWheel(topics: readonly Topic[], pick: (excludeId?: string) => Topic, initial: Topic) {
  const [topic, setTopic] = useState<Topic>(initial);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const spin = useCallback(() => {
    if (spinning) return;
    const next = pick(topic.id);
    const index = topics.findIndex((t) => t.id === next.id);
    const slice = 360 / topics.length;
    const extraTurns = (5 + Math.floor(Math.random() * 4)) * 360;

    // Slice i is centered at (i + 0.5) * slice clockwise from the top pointer.
    setRotation((prev) => prev - (prev % 360) + extraTurns + (360 - (index + 0.5) * slice));
    setSpinning(true);
    timer.current = window.setTimeout(() => {
      setTopic(next);
      setSpinning(false);
    }, SPIN_MS);
  }, [pick, spinning, topic.id, topics]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { topic, rotation, spinning, spin };
}
