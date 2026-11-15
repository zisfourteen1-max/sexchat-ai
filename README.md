# sexchat-ai 🔞

Aplikasi chat AI companion untuk dewasa (18+) dengan karakter yang bisa dikustomisasi.
Backend Node.js + Express, frontend web responsif (nyaman dibuka dari HP),
dan model LLM apa pun yang kompatibel dengan API OpenAI.

> **18+ only.** Aplikasi ini berisi percakapan dewasa. Jangan dipakai oleh anak di bawah umur.

## Fitur

- 💬 Chat dengan karakter AI yang berbeda-beda (pilih di bar atas)
- 🎭 Karakter dari file JSON di `characters/` — gampang tambah karakter baru
- 🧠 Riwayat chat per karakter, tersimpan di perangkat (localStorage)
- 🔑 API key aman di server (`.env`), tidak pernah bocor ke browser
- 🔌 Provider LLM bebas: OpenAI, Groq, OpenRouter, Together, Ollama lokal
- 📱 UI mobile-friendly

## Cara jalanin

```bash
# 1. Install dependency
npm install

# 2. Isi API key lo
cp .env.example .env
# edit .env: OPENAI_API_KEY, OPENAI_BASE_URL, MODEL

# 3. Jalanin
npm start
# buka http://localhost:3000
```

Mode dev (auto-restart tiap ada perubahan file):

```bash
npm run dev
```

## Deploy (biar bisa dibuka dari HP)

Paling gampang: **Render** (free tier, nggak perlu kartu kredit).

1. Push repo ini ke GitHub (lihat "Push ke GitHub" di bawah).
2. Buka [dashboard.render.com](https://dashboard.render.com), daftar/login (bisa pake akun GitHub).
3. **New + → Blueprint** → pilih repo `sexchat-ai` → Render akan baca `render.yaml` otomatis.
4. Di dashboard Render, isi environment variable `OPENAI_API_KEY` dengan key Groq lo (diawali `gsk_`).
5. Tunggu deploy selesai, buka URL yang dikasih Render (misal `https://sexchat-ai.onrender.com`).

Catatan free tier Render: server tidur setelah ~15 menit tidak dipakai,
jadi request pertama setelah tidur butuh ~30-60 detik buat bangun. Itu normal.

Alternatif: jalankan sebagai container Docker (lihat `Dockerfile`):

```bash
docker build -t sexchat-ai .
docker run -p 3000:3000 --env-file .env sexchat-ai
```

## Konfigurasi (`.env`)

| Variabel | Contoh | Keterangan |
|---|---|---|
| `OPENAI_API_KEY` | `sk-...` | API key provider LLM lo |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Ganti sesuai provider |
| `MODEL` | `gpt-4o-mini` | Nama model di provider lo |
| `PORT` | `3000` | Port server |

Provider lain:

- Groq: `https://api.groq.com/openai/v1` + model `qwen/qwen3.8-27b` (gratis, tanpa kartu kredit, paling bebas buat roleplay dewasa — model gpt-oss malah nolak konten eksplisit)
- OpenRouter: `https://openrouter.ai/api/v1` + model `mistralai/mistral-7b-instruct`
- Ollama lokal: `http://localhost:11434/v1` + model lokal lo (API key boleh isi apa saja)

## Tambah karakter baru

Bikin file JSON baru di `characters/`, contoh `characters/rina.json`:

```json
{
  "id": "rina",
  "name": "Rina",
  "avatar": "🌸",
  "tagline": "Deskripsi singkat karakter",
  "greeting": "Hai~ Gue Rina.",
  "temperature": 0.9,
  "systemPrompt": "You are Rina, ..."
}
```

Restart server, karakter langsung muncul di bar atas. `systemPrompt` adalah
instruksi kepribadian karakter — di situlah lo atur gaya ngomong, batasan,
dan peran karakter.

## Struktur repo

```
sexchat-ai/
├── server/server.js     # backend: serve UI + proxy ke LLM
├── public/              # frontend: index.html, style.css, app.js
├── characters/          # kartu karakter (JSON)
├── .env.example         # contoh konfigurasi
└── package.json
```

## Push ke GitHub

```bash
# di GitHub (web/HP): bikin repo baru, misal "sexchat-ai", JANGAN centang README
git init
git add .
git commit -m "Initial commit: AI companion chat app (18+)"
git branch -M main
git remote add origin https://github.com/USERNAME-KAMU/sexchat-ai.git
git push -u origin main
```

**Jangan pernah commit file `.env`** — isinya API key lo. File itu sudah ada di `.gitignore`.

## Lisensi

MIT — lihat `LICENSE`.
