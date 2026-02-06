const $ = (sel) => document.querySelector(sel);

function loadMessages() {
  try {
    const raw = localStorage.getItem('ggh_messages');
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveMessages(arr) {
  localStorage.setItem('ggh_messages', JSON.stringify(arr));
}

function setStatus(text) {
  const el = $('#status');
  if (el) el.textContent = text;
}

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

function init() {
  registerSW();

  const msg = $('#msg');
  const saveBtn = $('#saveBtn');
  const clearBtn = $('#clearBtn');

  saveBtn.addEventListener('click', () => {
    const text = (msg.value || '').trim();
    if (!text) {
      setStatus('Type a message first.');
      return;
    }

    const messages = loadMessages();
    messages.push({ text, ts: Date.now() });

    // Keep last 50
    const trimmed = messages.slice(-50);
    saveMessages(trimmed);

    msg.value = '';
    setStatus('Saved!');

    // Let it show on the main page if open in another tab
    window.setTimeout(() => setStatus(''), 1500);
  });

  clearBtn.addEventListener('click', () => {
    if (!confirm('Clear all messages for Gordon?')) return;
    saveMessages([]);
    setStatus('Cleared.');
    window.setTimeout(() => setStatus(''), 1500);
  });
}

init();
