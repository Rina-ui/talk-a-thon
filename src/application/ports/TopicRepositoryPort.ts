import type { Topic } from '@/domain/topic/Topic';

export interface TopicRepositoryPort {
  getAll(): readonly Topic[];
}
