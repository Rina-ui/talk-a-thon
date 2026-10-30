import type { AnalysisInput, SpeechAnalyzerPort } from '@/application/ports/SpeechAnalyzerPort';
import type { Analysis, FeedbackLanguage, Mistake, VocabTip } from '@/domain/analysis/Analysis';

type Text = Record<FeedbackLanguage, string>;

interface Rule {
  readonly pattern: RegExp; // must have the `g` flag
  readonly fix: (m: RegExpMatchArray) => string;
  readonly explanation: Text;
}

const PARTICIPLE: Record<string, string> = { saw: 'seen', went: 'gone', ate: 'eaten', did: 'done', took: 'taken', wrote: 'written' };
const BASE_FORM: Record<string, string> = { went: 'go', saw: 'see', ate: 'eat', had: 'have', did: 'do', took: 'take' };
const at = (m: RegExpMatchArray, i: number): string => m[i] ?? '';

const RULES: readonly Rule[] = [
  {
    pattern: /\b(he|she|it) don't\b/gi,
    fix: (m) => `${at(m, 1)} doesn't`,
    explanation: { fr: "Sujet à la 3e personne du singulier : on utilise « doesn't ».", en: "Third-person singular subjects take \"doesn't\"." },
  },
  {
    pattern: /\bI am agree\b/gi,
    fix: () => 'I agree',
    explanation: { fr: "« Agree » est déjà un verbe : pas besoin de « am ».", en: '"Agree" is already a verb, no "am" needed.' },
  },
  {
    pattern: /\bmore (better|worse|easier|harder|bigger|smaller|faster)\b/gi,
    fix: (m) => at(m, 1),
    explanation: { fr: 'Le comparatif est déjà formé : pas de « more ».', en: 'The comparative is already formed: no "more".' },
  },
  {
    pattern: /\bpeople is\b/gi,
    fix: () => 'people are',
    explanation: { fr: "« People » est pluriel : on dit « people are ».", en: '"People" is plural: "people are".' },
  },
  {
    pattern: /\beverybody are\b/gi,
    fix: () => 'everybody is',
    explanation: { fr: "« Everybody » est singulier : « everybody is ».", en: '"Everybody" is singular: "everybody is".' },
  },
  {
    pattern: /\bI have (saw|went|ate|did|took|wrote)\b/gi,
    fix: (m) => `I have ${PARTICIPLE[at(m, 1).toLowerCase()] ?? at(m, 1)}`,
    explanation: { fr: 'Le present perfect demande le participe passé.', en: 'The present perfect needs the past participle.' },
  },
  {
    pattern: /\bdidn't (went|saw|ate|had|did|took)\b/gi,
    fix: (m) => `didn't ${BASE_FORM[at(m, 1).toLowerCase()] ?? at(m, 1)}`,
    explanation: { fr: "Après « didn't », le verbe reste à l'infinitif.", en: 'After "didn\'t", use the base form of the verb.' },
  },
  {
    pattern: /\bdepend(s?) of\b/gi,
    fix: (m) => `depend${at(m, 1)} on`,
    explanation: { fr: 'La préposition correcte est « depend on ».', en: 'The correct preposition is "depend on".' },
  },
  {
    pattern: /\bI have (\d+) years?\b/gi,
    fix: (m) => `I am ${at(m, 1)} years old`,
    explanation: { fr: "Faux ami : en anglais l'âge se dit avec « to be ».", en: 'Age uses "to be", not "to have".' },
  },
  {
    pattern: /\bmake (a|some) photos?\b/gi,
    fix: () => 'take a photo',
    explanation: { fr: 'On dit « take a photo » (pas « make »).', en: 'The collocation is "take a photo".' },
  },
  {
    pattern: /\bin the other hand\b/gi,
    fix: () => 'on the other hand',
    explanation: { fr: "L'expression est « on the other hand ».", en: 'The expression is "on the other hand".' },
  },
  {
    pattern: /\bmuch people\b/gi,
    fix: () => 'many people',
    explanation: { fr: '« People » est dénombrable : « many people ».', en: '"People" is countable: "many people".' },
  },
  {
    pattern: /\bI am (here|living|working) since\b/gi,
    fix: (m) => `I have been ${at(m, 1)} since`,
    explanation: { fr: "Avec « since », on utilise le present perfect.", en: 'With "since", use the present perfect.' },
  },
];

const VOCAB: Record<string, readonly string[]> = {
  good: ['great', 'excellent', 'beneficial'],
  bad: ['terrible', 'unfavorable', 'challenging'],
  happy: ['delighted', 'thrilled', 'elated'],
  big: ['huge', 'substantial', 'massive'],
  small: ['tiny', 'compact', 'minimal'],
  think: ['believe', 'reckon', 'figure'],
  important: ['crucial', 'vital', 'essential'],
  very: ['really', 'extremely', 'incredibly'],
};

const COPY: Record<FeedbackLanguage, { summary: (n: number) => string; none: string; tip: string }> = {
  fr: {
    summary: (n) => (n === 0 ? 'Aucune erreur courante détectée par l’analyse hors ligne.' : `${n} erreur(s) courante(s) détectée(s) par l’analyse hors ligne.`),
    none: 'Analyse hors ligne',
    tip: 'Cette analyse locale ne repère que des erreurs fréquentes. Lance le serveur avec une clé API pour une correction complète par IA.',
  },
  en: {
    summary: (n) => (n === 0 ? 'No common mistakes found by the offline check.' : `${n} common mistake(s) found by the offline check.`),
    none: 'Offline analysis',
    tip: 'This local check only catches frequent mistakes. Start the server with an API key for full AI correction.',
  },
};

function applyRule(text: string, rule: Rule, lang: FeedbackLanguage): { text: string; mistakes: Mistake[] } {
  const mistakes: Mistake[] = [];
  let out = '';
  let last = 0;
  for (const m of text.matchAll(rule.pattern)) {
    const index = m.index ?? 0;
    const fix = rule.fix(m);
    out += text.slice(last, index) + fix;
    last = index + m[0].length;
    mistakes.push({ original: m[0], fix, explanation: rule.explanation[lang] });
  }
  return { text: out + text.slice(last), mistakes };
}

/** Offline fallback: cheap rule-based checks, used when the AI service is unavailable. */
export class RuleBasedAnalyzer implements SpeechAnalyzerPort {
  async analyze({ transcript, feedbackLanguage }: AnalysisInput): Promise<Analysis> {
    let corrected = transcript;
    const mistakes: Mistake[] = [];
    for (const rule of RULES) {
      const result = applyRule(corrected, rule, feedbackLanguage);
      corrected = result.text;
      mistakes.push(...result.mistakes);
    }

    const vocabulary: VocabTip[] = Object.entries(VOCAB)
      .filter(([word]) => new RegExp(`\\b${word}\\b`, 'i').test(transcript))
      .slice(0, 5)
      .map(([used, alternatives]) => ({ used, alternatives }));

    const copy = COPY[feedbackLanguage];
    return {
      source: 'local',
      score: Math.max(20, 100 - mistakes.length * 7),
      level: null,
      summary: copy.summary(mistakes.length),
      corrected,
      mistakes,
      vocabulary,
      tips: [copy.tip],
    };
  }
}
