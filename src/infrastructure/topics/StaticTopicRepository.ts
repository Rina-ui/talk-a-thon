import type { TopicRepositoryPort } from '@/application/ports/TopicRepositoryPort';
import type { Topic } from '@/domain/topic/Topic';

const TOPICS: readonly Topic[] = [
  { id: 'travel', name: 'Travel Stories', description: "Describe your favorite vacation or a dream destination you'd love to visit." },
  { id: 'tech', name: 'Tech & AI', description: 'How is technology changing our daily lives, and which AI tool do you use most?' },
  { id: 'food', name: 'Food & Cooking', description: 'Talk about your favorite dish, how to cook it, or a strange food you tried.' },
  { id: 'powers', name: 'Superpowers', description: 'If you could have one superpower for a day, what would it be and why?' },
  { id: 'hobbies', name: 'Hobbies & Culture', description: 'Explain a hobby you love or a cultural festival from your country.' },
  { id: 'stories', name: 'Movies & Books', description: 'Summarize the plot of the last movie or book that truly blew your mind.' },
  { id: 'future', name: 'Future Goals', description: 'Where do you see yourself in 5 years? What skills do you want to master?' },
  { id: 'nature', name: 'Animals & Nature', description: 'Discuss your favorite animal or an impactful experience in nature.' },
  { id: 'work', name: 'Work & Dreams', description: 'Describe your dream job, or what makes a workplace great.' },
  { id: 'memory', name: 'Childhood Memories', description: 'Tell a story from your childhood that still makes you smile.' },
];

export class StaticTopicRepository implements TopicRepositoryPort {
  getAll(): readonly Topic[] {
    return TOPICS;
  }
}