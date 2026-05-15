import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 8787;
const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const privatePin = process.env.UD_API_PIN || '';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://universedragon14.github.io,http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

app.disable('x-powered-by');
app.use(express.json({ limit: '512kb' }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-UD-PIN'],
}));

const recent = new Map();
function limitRequests(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const current = recent.get(ip) || { count: 0, reset: now + 60000 };
  if (now > current.reset) {
    current.count = 0;
    current.reset = now + 60000;
  }
  current.count += 1;
  recent.set(ip, current);
  if (current.count > Number(process.env.RATE_LIMIT_PER_MINUTE || 20)) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Try again later.' });
  }
  return next();
}

function requirePin(req, res, next) {
  if (!privatePin) {
    return res.status(500).json({ ok: false, error: 'Private backend PIN is not configured.' });
  }
  if (req.get('X-UD-PIN') !== privatePin) {
    return res.status(401).json({ ok: false, error: 'Private PIN required.' });
  }
  return next();
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'UD Singularity Private Backend Bridge',
    model,
    key_loaded: Boolean(groq),
    pin_required: true,
  });
});

app.post('/api/architect', limitRequests, requirePin, async (req, res) => {
  try {
    if (!groq) {
      return res.status(500).json({ ok: false, error: 'AI provider key missing on private server.' });
    }

    const { html = '', css = '', js = '', question = '' } = req.body || {};
    const cleanQuestion = String(question).slice(0, 2500).trim();
    if (!cleanQuestion) return res.status(400).json({ ok: false, error: 'Question is required.' });

    const wantsCode = /create|generate|build|make|update|upgrade|landing|page|portal|code/i.test(cleanQuestion);

    const system = `You are EVE Architect for Universal Dragon by Aslam.
When asked to create or update code, output only three fenced blocks in this order: html, css, js.
HTML must be body content only. CSS must be complete CSS. JS must be complete safe browser JavaScript.
For review-only requests, give short practical advice.
Focus on clean structure, rollback-friendly code, approval before risky actions, and future EVE/NOVA hooks.`;

    const user = wantsCode
      ? `Create frontend code for this request: ${cleanQuestion}\n\nCurrent HTML:\n${String(html).slice(0, 4000)}\n\nCurrent CSS:\n${String(css).slice(0, 4000)}\n\nCurrent JS:\n${String(js).slice(0, 4000)}`
      : `Question: ${cleanQuestion}\n\nHTML:\n${String(html).slice(0, 8000)}\n\nCSS:\n${String(css).slice(0, 8000)}\n\nJS:\n${String(js).slice(0, 8000)}`;

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.2,
      max_tokens: 1600,
    });

    return res.json({ ok: true, reply: completion.choices?.[0]?.message?.content || 'No reply.' });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Backend bridge failed.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`UD Singularity Private Backend Bridge running on http://0.0.0.0:${port}`);
});
