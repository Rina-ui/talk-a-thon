import type { TopicRepositoryPort } from '@/application/ports/TopicRepositoryPort';
import type { Topic } from '@/domain/topic/Topic';

const TOPICS: readonly Topic[] = [
  { id: 'travel', name: 'Travel Stories', color: '#EF4444', description: "Describe your favorite vacation or a dream destination you'd love to visit." },
  { id: 'tech', name: 'Tech & AI', color: '#3B82F6', description: 'How is technology changing our daily lives, and which AI tool do you use most?' },
  { id: 'food', name: 'Food & Cooking', color: '#10B981', description: 'Talk about your favorite dish, how to cook it, or a strange food you tried.' },
  { id: 'powers', name: 'Superpowers', color: '#8B5CF6', description: 'If you could have one superpower for a day, what would it be and why?' },
  { id: 'hobbies', name: 'Hobbies & Culture', color: '#F59E0B', description: 'Explain a hobby you love or a cultural festival from your country.' },
  { id: 'stories', name: 'Movies & Books', color: '#EC4899', description: 'Summarize the plot of the last movie or book that truly blew your mind.' },
  { id: 'future', name: 'Future Goals', color: '#06B6D4', description: 'Where do you see yourself in 5 years? What skills do you want to master?' },
  { id: 'nature', name: 'Animals & Nature', color: '#84CC16', description: 'Discuss your favorite animal or an impactful experience in nature.' },
  { id: 'work', name: 'Work & Dreams', color: '#F97316', description: 'Describe your dream job, or what makes a workplace great.' },
  { id: 'memory', name: 'Childhood Memories', color: '#14B8A6', description: 'Tell a story from your childhood that still makes you smile.' },
];

export class StaticTopicRepository implements TopicRepositoryPort {
  getAll(): readonly Topic[] {
    return TOPICS;
  }
}