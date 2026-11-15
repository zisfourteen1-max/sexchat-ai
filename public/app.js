// sexchat-ai — frontend (adults 18+ only)
// Chat UI: picks a character, keeps history per character in localStorage,
// and talks to the backend at /api/chat. The API key never touches the browser.
const $ = (sel) => document.querySelector(sel);

const ageGate = $('#age-gate');
const app = $('#app');
const charList = $('#characters');
const messagesEl = $('#messages');
const form = $('#composer');
const input = $('#input');

let characters = [];
let currentId = null;

function storeKey(id) { return `sexchat-ai:history:${id}`; }

function loadHistory(id) {
  try { return JSON.parse(localStorage.getItem(storeKey(id))) || []; } catch { return []; }
}
function saveHistory(id, history) {
  try { localStorage.setItem(storeKey(id), JSON.stringify(history)); } catch {}
}

function bubble(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function photoBubble(src) {
  const div = document.createElement('div');
  div.className = 'msg assistant photo';
  const img = document.createElement('img');
  img.src = src;
  img.alt = 'Foto';
  img.loading = 'lazy';
  div.appendChild(img);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function renderHistory() {
  messagesEl.innerHTML = '';
  const history = loadHistory(currentId);
  if (history.length === 0) {
    const c = characters.find((x) => x.id === currentId);
    if (c && c.greeting) bubble('assistant', c.greeting);
    return;
  }
  history.forEach((m) => {
    if (m.photo) photoBubble(m.photo);
    bubble(m.role, m.content);
  });
}

function renderCharacters() {
  charList.innerHTML = '';
  characters.forEach((c) => {
    const b = document.createElement('button');
    b.className = 'char-card' + (c.id === currentId ? ' active' : '');
    b.innerHTML = `<span class="avatar">${c.avatar || '💬'}</span><span>${c.name}</span>`;
    b.title = c.tagline || '';
    b.onclick = () => { currentId = c.id; renderCharacters(); renderHistory(); };
    charList.appendChild(b);
  });
}

async function sendMessage(text) {
  const history = loadHistory(currentId);
  history.push({ role: 'user', content: text });
  saveHistory(currentId, history);
  bubble('user', text);
  input.value = '';

  const typing = bubble('assistant', 'mengetik...');
  typing.classList.add('typing');

  try {
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId: currentId, messages: history }),
    });
    const data = await r.json();
    typing.remove();
    if (!r.ok) throw new Error(data.error || `Server error ${r.status}`);
    const reply = data.reply;
    const updated = loadHistory(currentId);
    const entry = { role: 'assistant', content: reply };
    if (data.photo) entry.photo = data.photo;
    updated.push(entry);
    saveHistory(currentId, updated);
    if (data.photo) photoBubble(data.photo);
    bubble('assistant', reply);
  } catch (e) {
    typing.remove();
    bubble('error', `Gagal: ${e.message}`);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || !currentId) return;
  sendMessage(text);
});

$('#new-chat').addEventListener('click', () => {
  if (!currentId) return;
  if (!confirm('Hapus riwayat chat dengan karakter ini?')) return;
  localStorage.removeItem(storeKey(currentId));
  renderHistory();
});

$('#age-yes').addEventListener('click', async () => {
  try { localStorage.setItem('sexchat-ai:age-ok', '1'); } catch {}
  ageGate.classList.add('hidden');
  app.classList.remove('hidden');
  await init();
});

$('#age-no').addEventListener('click', () => {
  document.body.innerHTML = '<p style="padding:40px;text-align:center">Maaf, aplikasi ini hanya untuk 18 tahun ke atas.</p>';
});

async function init() {
  const r = await fetch('/api/characters');
  characters = await r.json();
  if (!characters.length) {
    bubble('error', 'Tidak ada karakter. Cek folder ./characters.');
    return;
  }
  currentId = characters[0].id;
  renderCharacters();
  renderHistory();
}

// Skip the age gate if the user already confirmed in this browser.
try {
  if (localStorage.getItem('sexchat-ai:age-ok') === '1') {
    ageGate.classList.add('hidden');
    app.classList.remove('hidden');
    init();
  }
} catch {}
