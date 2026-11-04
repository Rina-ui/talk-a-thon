
import {analyzeTranscript, getLlmConfig, parseAnalyzeBody} from "../server/Llm";

interface VercelRequest {
    method?: string;
    body?: unknown;
}
interface VercelResponse {
    status(code: number): VercelResponse;
    json(body: unknown): void;
    setHeader(name: string, value: string): void;
}

export const config = { maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const cfg = getLlmConfig();
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
        res.status(200).json(await analyzeTranscript(input, cfg, cfg.apiKey));
    } catch (error) {
        console.error(error);
        res.status(502).json({ error: 'Analysis failed' });
    }
}