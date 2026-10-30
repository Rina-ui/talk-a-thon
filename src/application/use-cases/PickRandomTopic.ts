import type { Topic } from '@/domain/topic/Topic';
import type { TopicRepositoryPort } from '../ports/TopicRepositoryPort';

export class PickRandomTopic {
  constructor(
    private readonly topics: TopicRepositoryPort,
    private readonly random: () => number = Math.random,
  ) {}

  /** Picks a topic, avoiding `excludeId` so the wheel never lands twice on the same one. */
  execute(excludeId?: string): Topic {
    const all = this.topics.getAll();
    const pool = all.filter((t) => t.id !== excludeId);
    const source = pool.length > 0 ? pool : all;
    const topic = source[Math.floor(this.random() * source.length)];
    if (!topic) throw new Error('No topics available');
    return topic;
  }
}
