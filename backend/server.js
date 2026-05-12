import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

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
    const wantsCode = /create|generate|build|make|update|upgrade|landing|page|portal|code/i.test(question || '');

    const system = `You are EVE Architect for Universal Dragon by Aslam.

STRICT OUTPUT RULES:
When asked to create or update code, output ONLY these three fenced code blocks, in this exact order:
\`\`\`html
BODY CONTENT ONLY. No doctype. No html tag. No head tag. No body tag. No link tag. No script tag.
\`\`\`
\`\`\`css
COMPLETE CSS ONLY.
\`\`\`
\`\`\`js
COMPLETE JAVASCRIPT ONLY. Keep it safe and static-demo friendly.
\`\`\`
Do not add explanations, headings, bullet points, or full HTML documents.
For review-only requests, give short practical advice.
Focus on clean structure, rollback-friendly code, and future EVE/NOVA hooks.`;

    const user = wantsCode
      ? `Create frontend code for this request: ${question}\n\nReturn only html, css, and js fenced blocks. Current context:\n\nHTML:\n${html.slice(0, 4000)}\n\nCSS:\n${css.slice(0, 4000)}\n\nJS:\n${js.slice(0, 4000)}`
      : `Question: ${question || 'Review this project and suggest the next improvement.'}\n\nHTML:\n${html.slice(0, 8000)}\n\nCSS:\n${css.slice(0, 8000)}\n\nJS:\n${js.slice(0, 8000)}`;

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.2,
      max_tokens: 1600,
    });

    res.json({ reply: completion.choices?.[0]?.message?.content || 'No reply.' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'EVE Architect bridge failed.' });
  }
});

app.listen(port, () => {
  console.log(`UD Singularity EVE Architect Bridge running on http://localhost:${port}`);
});
