// sexchat-ai — backend server (adults 18+ only)
// Express server that serves the chat UI and proxies chat requests to any
// OpenAI-compatible LLM API. Your API key stays on the server (in .env),
// never in the browser.
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const API_KEY = process.env.OPENAI_API_KEY || '';
const MODEL = process.env.MODEL || 'gpt-4o-mini';

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---- Characters -----------------------------------------------------------
// Character cards live in ../characters/*.json. Each one has:
//   id, name, tagline, avatar (emoji or image URL), systemPrompt,
//   greeting, temperature
const CHAR_DIR = path.join(__dirname, '..', 'characters');

function loadCharacters() {
  const out = [];
  for (const file of fs.readdirSync(CHAR_DIR)) {
    if (!file.endsWith('.json')) continue;
    try {
      const data = JSON.parse(fs.readFileSync(path.join(CHAR_DIR, file), 'utf8'));
      out.push(data);
    } catch (e) {
      console.error('Failed to load character', file, e.message);
    }
  }
  return out;
}

app.get('/api/characters', (req, res) => {
  const chars = loadCharacters().map(({ systemPrompt, ...rest }) => rest);
  res.json(chars);
});

// ---- Chat -----------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  const { characterId, messages } = req.body || {};

  if (!API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not set on the server. Copy .env.example to .env and fill it in.' });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' });
  }

  const character = loadCharacters().find((c) => c.id === characterId) || loadCharacters()[0];
  if (!character) {
    return res.status(500).json({ error: 'No characters found in ./characters' });
  }

  // ---- Photo requests ("pap") ---------------------------------------------
  // If the user asks for a photo and this character has a photo album,
  // send a photo instead of an LLM reply. No API call is spent.
  const PHOTO_TRIGGERS = /(pap|foto|selfie|selpi|\bpic\b|photo|gambar|wajah)/i;
  const lastUser = [...messages].reverse().find((m) => m && m.role === 'user');
  if (
    lastUser &&
    typeof lastUser.content === 'string' &&
    PHOTO_TRIGGERS.test(lastUser.content) &&
    Array.isArray(character.photos) &&
    character.photos.length > 0
  ) {
    const userTurns = messages.filter((m) => m && m.role === 'user').length;
    const photo = character.photos[userTurns % character.photos.length];
    const captions = Array.isArray(character.photoCaptions) && character.photoCaptions.length > 0
      ? character.photoCaptions
      : ['Nih pap gue 😌'];
    const reply = captions[Math.floor(Math.random() * captions.length)];
    return res.json({ reply, photo });
  }

  // Keep only the last 40 turns so the prompt stays bounded.
  const history = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-40)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  const payload = {
    model: MODEL,
    messages: [{ role: 'system', content: character.systemPrompt }, ...history],
    temperature: typeof character.temperature === 'number' ? character.temperature : 0.9,
  };

  try {
    const r = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: `LLM provider returned ${r.status}: ${text.slice(0, 500)}` });
    }

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string') {
      return res.status(502).json({ error: 'LLM provider returned an unexpected response' });
    }
    res.json({ reply });
  } catch (e) {
    res.status(502).json({ error: `Could not reach the LLM provider: ${e.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`sexchat-ai running at http://localhost:${PORT}`);
  console.log(`Model: ${MODEL} via ${BASE_URL}`);
});
