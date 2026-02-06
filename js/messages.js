const $ = (sel) => document.querySelector(sel);

/* ---------- "From" name persistence (localStorage) ---------- */

function getSavedName() {
  return localStorage.getItem('ggh_fromName') || '';
}

function saveName(name) {
  localStorage.setItem('ggh_fromName', name);
}

/* ---------- Firebase operations ---------- */

function pushMessage(text, from) {
  return db.ref('messages').push({
    text: text,
    from: from,
    ts: Date.now()
  });
}

function clearAllMessages() {
  return db.ref('messages').remove();
}

/* ---------- UI ---------- */

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
  const fromInput = $('#fromName');
  const saveBtn = $('#saveBtn');
  const clearBtn = $('#clearBtn');

  // Restore saved name
  fromInput.value = getSavedName();

  saveBtn.addEventListener('click', () => {
    const text = (msg.value || '').trim();
    if (!text) {
      setStatus('Type a message first.');
      return;
    }
    if (text.length > 200) {
      setStatus('Message too long (max 200 characters).');
      return;
    }

    const from = (fromInput.value || '').trim().slice(0, 30);
    saveName(from);

    pushMessage(text, from)
      .then(() => {
        msg.value = '';
        setStatus('Sent!');
        window.setTimeout(() => setStatus(''), 2000);
      })
      .catch((err) => {
        console.error('Firebase push error:', err);
        setStatus('Could not send. Check your connection.');
      });
  });

  clearBtn.addEventListener('click', () => {
    if (!confirm('Clear ALL messages for Gordon?')) return;
    clearAllMessages()
      .then(() => {
        setStatus('All messages cleared.');
        window.setTimeout(() => setStatus(''), 2000);
      })
      .catch((err) => {
        console.error('Firebase clear error:', err);
        setStatus('Could not clear. Check your connection.');
      });
  });
}

init();
