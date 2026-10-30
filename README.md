# Talk-a-Thon

Jeu d'entraînement à l'oral en anglais : une roue tire un thème, tu parles (1, 3 ou 5 minutes de parole *active*),
le chrono **gèle** quand tu te tais, puis tu reçois une correction détaillée.

## Lancer

```bash
npm install
cp .env.example .env       

npm run dev:server          # terminal 1 : proxy d'analyse (port 8787)
npm run dev                 # terminal 2 : app (http://localhost:5173)

npm test                    # tests unitaires
npm run build               # typecheck + build de production
```

Sans clé API (ou si le serveur est éteint), l'app bascule automatiquement sur l'analyse hors ligne
(`RuleBasedAnalyzer`, erreurs fréquentes seulement).
La reconnaissance vocale demande Chrome, Edge ou Safari, et HTTPS ou localhost.

## Architecture (Clean Architecture)

```
src/
├─ domain/            Règles métier pures. Aucune dépendance (ni React, ni navigateur).
│  ├─ session/        SessionEngine (chrono qui gèle), SessionConfig, SessionResult
│  ├─ metrics/        computeSpeechMetrics (mots/min, fillers, ratio de parole)
│  ├─ analysis/       Analysis + parseAnalysis (validation des données non fiables)
│  └─ topic/          Topic
├─ application/       Cas d'usage et orchestration. Dépend du domaine uniquement.
│  ├─ ports/          Interfaces : SpeechRecognizer, AudioLevelMeter, SoundPlayer, Time,
│  │                  SpeechAnalyzer, TopicRepository
│  ├─ use-cases/      PickRandomTopic, AnalyzeSession
│  └─ services/       SessionRunner (relie moteur + micro + sons + horloge, observable)
├─ infrastructure/    Implémentations concrètes des ports (Web Speech, Web Audio, fetch…)
├─ composition/       container.ts : seul endroit où l'on assemble les classes concrètes
└─ presentation/      React : écrans, composants, hooks (adaptateurs fins)
server/               Proxy Express : garde la clé API côté serveur et appelle Claude
```


