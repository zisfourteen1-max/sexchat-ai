# Jalankan sexchat-ai di HP Android (Termux)

Nggak perlu hosting, nggak perlu kartu kredit. Aplikasi jalan di HP lo sendiri.

## 1. Install Termux

- Buka **F-Droid** (f-droid.org) — download dan install Termux dari sana.
- Jangan install dari Play Store (versinya sudah lama dan bermasalah).

## 2. Install Node.js dan Git

Buka Termux, ketik perintah ini satu per satu:

```bash
pkg update && pkg upgrade -y
pkg install -y nodejs git
```

## 3. Download repo

```bash
git clone https://github.com/zisfourteen1-max/sexchat-ai.git
cd sexchat-ai
npm install
```

## 4. Isi API key Groq

Buat file `.env` (ganti `gsk_KEY_LO_DISINI` dengan key Groq lo):

```bash
cat > .env << 'EOF'
OPENAI_API_KEY=gsk_KEY_LO_DISINI
OPENAI_BASE_URL=https://api.groq.com/openai/v1
MODEL=openai/gpt-oss-120b
PORT=3000
EOF
```

Key Groq lo bisa dilihat lagi di [console.groq.com/keys](https://console.groq.com/keys).
Di Termux, tempel teks dengan tap-tahan layar → **Paste**.

## 5. Jalankan

```bash
npm start
```

Kalau muncul `sexchat-ai running at http://localhost:3000`, berarti jalan.

## 6. Buka aplikasinya

Buka browser HP (Chrome), ketik: `http://localhost:3000`

- Lewati age gate 18+, pilih karakter, mulai ngobrol.

## Biar tetap jalan

- Jangan tutup Termux selama aplikasi dipakai. Kalau Termux ke-close, aplikasi mati.
  Tinggal buka Termux lagi dan jalankan `cd sexchat-ai && npm start`.
- Supaya Android tidak mematikan Termux di background, jalankan
  `termux-wake-lock` sekali setelah `npm start` (opsional).

## Update aplikasi

Kalau ada update di repo:

```bash
cd sexchat-ai
git pull
npm install
```
