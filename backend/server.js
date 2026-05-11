import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from '@groq/sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 8787;
const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'UD Singularity EVE Architect Bridge', model });
});

app.post('/api/architect', async (req, res) => {
  try {
    if (!groq) {
      return res.status(500).json({
        error: 'GROQ_API_KEY is missing. Add it to your private .env file, not GitHub.',
      });
    }

    const { html = '', css = '', js = '', question = '' } = req.body || {};

    const system = `You are EVE Architect for Universal Dragon by Aslam.
You review HTML, CSS, and JavaScript as a project architect.
Give short, practical, safe advice.
Focus on expandable modules, future EVE/NOVA hooks, rollback, safety, and clean structure.
Never ask for secrets. Never expose private keys. Never suggest unsafe public terminal access.`;

    const user = `Question: ${question || 'Review this project and suggest the next improvement.'}

HTML:
${html.slice(0, 8000)}

CSS:
${css.slice(0, 8000)}

JS:
${js.slice(0, 8000)}`;

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
      max_tokens: 900,
    });

    res.json({ reply: completion.choices?.[0]?.message?.content || 'No reply.' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'EVE Architect bridge failed.' });
  }
});

app.listen(port, () => {
  console.log(`UD Singularity EVE Architect Bridge running on http://localhost:${port}`);
});
