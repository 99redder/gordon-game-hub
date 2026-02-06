/* Gordon Game Hub (iPad-first PWA) */

const $ = (sel) => document.querySelector(sel);

const state = {
  phrases: [
    "Howdy! Ready to play?",
    "Pick a game and have fun!",
    "You're doing great!",
    "Let's try a new one!",
    "High five!",
    "Remember: be kind.",
    "Take a deep breath—then play!",
    "Gordon says: you got this!",
    "Want to hear a song?",
    "Let's go on an adventure!"
  ],
  lastPhrase: null,
  musicEnabled: false,
};

function choosePhrase() {
  // ensure different each time when possible
  const options = state.phrases.filter(p => p !== state.lastPhrase);
  const pickFrom = options.length ? options : state.phrases;
  const next = pickFrom[Math.floor(Math.random() * pickFrom.length)];
  state.lastPhrase = next;
  return next;
}

function speak(text) {
  // iPad Safari supports speechSynthesis, but it may require user gesture.
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.15;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  } catch {}
}

function waveAndTalk() {
  const gordon = $('#gordon');
  const bubble = $('#bubble');

  const phrase = choosePhrase();
  bubble.textContent = phrase;

  gordon.classList.remove('wave');
  // force reflow so animation re-triggers
  void gordon.offsetWidth;
  gordon.classList.add('wave');

  // say it out loud
  speak(phrase);
}

function setupGordon() {
  const btn = $('#gordonBtn');
  // iPad doesn't have hover; use tap/click.
  btn.addEventListener('click', waveAndTalk);
  // desktop hover support
  btn.addEventListener('mouseenter', () => {
    // small debounce to avoid spam
    if (window.matchMedia('(hover: hover)').matches) waveAndTalk();
  });
}

function setupMusic() {
  const audio = $('#bgMusic');
  const toggle = $('#musicToggle');

  const saved = localStorage.getItem('ggh_music') || 'on';
  state.musicEnabled = saved === 'on';
  renderMusicButton();

  // iPad/iOS blocks autoplay until a user gesture.
  // We'll attempt to start as soon as the user taps anywhere if music is enabled.
  const tryAutostart = () => {
    if (!state.musicEnabled) return;
    start();
    window.removeEventListener('pointerdown', tryAutostart, { capture: true });
  };
  window.addEventListener('pointerdown', tryAutostart, { capture: true, once: true });

  async function start() {
    try {
      audio.volume = 0.18;
      audio.loop = true;
      await audio.play();
      state.musicEnabled = true;
      localStorage.setItem('ggh_music', 'on');
      renderMusicButton();
    } catch (e) {
      // autoplay blocked until user gesture
      state.musicEnabled = false;
      localStorage.setItem('ggh_music', 'off');
      renderMusicButton();
      alert('Tap the Music button again to start (iPad autoplay rules).');
    }
  }

  function stop() {
    audio.pause();
    audio.currentTime = 0;
    state.musicEnabled = false;
    localStorage.setItem('ggh_music', 'off');
    renderMusicButton();
  }

  function renderMusicButton() {
    toggle.textContent = state.musicEnabled ? 'Music: On' : 'Music: Off';
  }

  toggle.addEventListener('click', () => {
    if (state.musicEnabled) stop();
    else start();
  });
}

function setupGameTransitions() {
  const overlay = $('#transitionOverlay');
  const text = $('#transitionText');

  document.querySelectorAll('.gameLink').forEach((a) => {
    a.addEventListener('click', (e) => {
      // allow normal browser "open in new tab" behaviors
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const url = a.getAttribute('data-url') || a.getAttribute('href');
      if (!url || url === '#') {
        e.preventDefault();
        return;
      }

      e.preventDefault();

      // Show app-like transition
      const label = a.getAttribute('data-label') || a.getAttribute('aria-label') || 'Game';
      text.textContent = `Loading ${label}…`;
      overlay.classList.add('show');

      // small delay so it feels like an in-app navigation
      window.setTimeout(() => {
        window.location.href = url;
      }, 320);
    });
  });
}

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

function loadMessages() {
  try {
    const raw = localStorage.getItem('ggh_messages');
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

function renderMessages() {
  const list = $('#messageList');
  if (!list) return;

  const msgs = loadMessages().slice(-8).reverse();
  if (msgs.length === 0) {
    list.innerHTML = '<div class="messageItem"><div class="messageText">No messages yet.</div><div class="messageMeta">Add one at /messages.html</div></div>';
    return;
  }

  list.innerHTML = msgs.map((m) => {
    const text = (m?.text || '').toString().slice(0, 200);
    const meta = m?.ts ? formatTime(m.ts) : '';
    return `
      <div class="messageItem" role="listitem">
        <div class="messageText">${escapeHtml(text)}</div>
        <div class="messageMeta">${escapeHtml(meta)}</div>
      </div>
    `;
  }).join('');
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function init() {
  setupGordon();
  setupMusic();
  setupGameTransitions();
  renderMessages();
  // refresh messages if another tab updates them
  window.addEventListener('storage', (e) => {
    if (e.key === 'ggh_messages') renderMessages();
  });
  registerSW();
}

init();
