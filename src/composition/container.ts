import { AnalyzeSession } from '@/application/use-cases/AnalyzeSession';
import { PickRandomTopic } from '@/application/use-cases/PickRandomTopic';
import { SessionRunner } from '@/application/services/SessionRunner';
import type { SessionConfig } from '@/domain/session/SessionConfig';
import { HttpAnalyzer } from '@/infrastructure/analysis/HttpAnalyzer';
import { ResilientAnalyzer } from '@/infrastructure/analysis/ResilientAnalyzer';
import { RuleBasedAnalyzer } from '@/infrastructure/analysis/RuleBasedAnalyzer';
import { WebAudioLevelMeter } from '@/infrastructure/audio/WebAudioLevelMeter';
import { WebAudioSoundPlayer } from '@/infrastructure/audio/WebAudioSoundPlayer';
import { WebSpeechRecognizer } from '@/infrastructure/speech/WebSpeechRecognizer';
import { BrowserTime } from '@/infrastructure/time/BrowserTime';
import { StaticTopicRepository } from '@/infrastructure/topics/StaticTopicRepository';

/**
 * Composition root: the ONLY place where concrete classes are wired to ports.
 * Swap an implementation here and nothing else changes.
 */
export function createContainer() {
  const topicRepository = new StaticTopicRepository();
  const sound = new WebAudioSoundPlayer();
  const time = new BrowserTime();

  const analyzer = new ResilientAnalyzer(
    new HttpAnalyzer(import.meta.env.VITE_ANALYZE_URL ?? '/api/analyze'),
    new RuleBasedAnalyzer(),
  );

  return {
    topics: topicRepository.getAll(),
    sound,
    recognizerSupported: new WebSpeechRecognizer().isSupported,
    pickTopic: new PickRandomTopic(topicRepository),
    analyzeSession: new AnalyzeSession(analyzer, 'fr'),
    createRunner: (config: SessionConfig) =>
      new SessionRunner({
        recognizer: new WebSpeechRecognizer('en-US'),
        levelMeter: new WebAudioLevelMeter(),
        sound,
        time,
        config,
      }),
  };
}

export type Container = ReturnType<typeof createContainer>;
export const container: Container = createContainer();
