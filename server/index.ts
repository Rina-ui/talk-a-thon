import express from 'express';
import {analyzeTranscript, getLlmConfig, parseAnalyzeBody} from "./Llm";

// Local dev server (npm run dev:server). In production on Vercel, api/analyze.ts is used instead.
const PORT = Number(process.env.PORT ?? 8787);
const cfg = getLlmConfig();

const app = express();
app.use(express.json({ limit: '100kb' }));

app.post('/api/analyze', async (req, res) => {
  if (!cfg.apiKey) {
    res.status(503).json({ error: 'LLM_API_KEY is not configured' });
    return;
  }
  const input = parseAnalyzeBody(req.body);
  if (!input) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }
  try {
    res.json(await analyzeTranscript(input, cfg, cfg.apiKey));
  } catch (error) {
    console.error(error);
    res.status(502).json({ error: 'Analysis failed' });
  }
});

app.listen(PORT, () => console.log(`Analysis server on http://localhost:${PORT} (${cfg.baseUrl}, model: ${cfg.model})`));