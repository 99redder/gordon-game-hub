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
    "Let's go on an adventure!",
    "Can you roar like a lion? Roooar!",
    "Can you stretch as tall as a giraffe?",
    "What color will you paint today?",
    "Let’s wiggle our fingers! Wiggle, wiggle, wiggle!",
    "Knock knock! Who’s there? A very silly penguin!",
    "Can you find something blue?",
    "Sending you a great big hug!"
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
    const music = $('#bgMusic');
    if (music) music.volume = 0.06;
    const restore = () => { if (music) music.volume = 0.16; };
    u.onend = restore;
    u.onerror = restore;
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

}

function setupMusic() {
  const audio = $('#bgMusic');
  const toggle = $('#musicToggle');

  const saved = localStorage.getItem('ggh_music') || 'on';
  state.musicEnabled = saved === 'on';
  renderMusicButton();

  // Pause music when the page becomes hidden (app backgrounded or closed)
  const handleVisibilityChange = () => {
    if (document.hidden && state.musicEnabled) {
      audio.pause();
    } else if (!document.hidden && state.musicEnabled) {
      // Resume if coming back and music was enabled
      audio.play().catch(() => {});
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

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
      audio.volume = 0.16;
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

    }
  }

  function stop() {
    audio.pause();
    audio.currentTime = 0;
    state.musicEnabled = false;
    localStorage.setItem('ggh_music', 'off');
    renderMusicButton();
  }

  // Pause music when page is about to unload (app closed or tab closed)
  window.addEventListener('beforeunload', () => {
    if (state.musicEnabled) {
      audio.pause();
    }
  });

  function icon(on) {
    // speaker icon (simple + kid-friendly)
    if (on) {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M3 10v4c0 .55.45 1 1 1h3l5 4V5L7 9H4c-.55 0-1 .45-1 1z" fill="currentColor" opacity="0.95"/>
          <path d="M16.5 8.5a1 1 0 0 1 1.4 0 6 6 0 0 1 0 7 1 1 0 1 1-1.4-1.4 4 4 0 0 0 0-4.2 1 1 0 0 1 0-1.4z" fill="currentColor" opacity="0.9"/>
          <path d="M18.9 6.1a1 1 0 0 1 1.4 0 9.5 9.5 0 0 1 0 11.8 1 1 0 1 1-1.4-1.4 7.5 7.5 0 0 0 0-9 1 1 0 0 1 0-1.4z" fill="currentColor" opacity="0.75"/>
        </svg>`;
    }
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3 10v4c0 .55.45 1 1 1h3l5 4V5L7 9H4c-.55 0-1 .45-1 1z" fill="currentColor" opacity="0.95"/>
        <path d="M16 9l5 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M21 9l-5 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
      </svg>`;
  }

  function renderMusicButton() {
    toggle.innerHTML = icon(state.musicEnabled);
    toggle.setAttribute('aria-label', state.musicEnabled ? 'Music on' : 'Music off');
    toggle.setAttribute('title', state.musicEnabled ? 'Music on' : 'Music off');
  }

  toggle.addEventListener('click', () => {
    if (state.musicEnabled) stop();
    else start();
  });
}

function setupGameTransitions() {
  // Native navigation is immediate and works with browser back / restored pages.
  document.querySelectorAll('.gameLink').forEach((link) => {
    link.addEventListener('click', () => {
      $('#bgMusic').pause();
      window.speechSynthesis?.cancel();
    });
  });
}

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').then(reg => {
    reg.update().catch(() => {});
  }).catch(() => {});
  // Updates wait until open app windows close; never reload a child's game.
}

async function loadFamilyMessages() {
  const load = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  try {
    await load('./js/firebase-config.local.js');
    if (!window.GORDON_FIREBASE_CONFIG) return;
    await load('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
    await Promise.all([
      load('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check-compat.js'),
      load('https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js'),
    ]);
    await load('./js/firebase-config.js');
    await load('./js/app-check.js');
    setupFirebaseMessages();
  } catch {
    // Family messages are optional; all play stays available offline.
  }
}

/* ---- Firebase message cycling display ---- */

const messageState = {
  messages: [],
  currentIndex: 0,
  cycleTimer: null,
  DISPLAY_TIME: 5000,
  isAnimating: false,
};

function setupFirebaseMessages() {
  if (typeof db === 'undefined') return;
  const ref = db.ref('messages').orderByChild('ts').limitToLast(50);

  ref.on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      messageState.messages = [];
    } else {
      messageState.messages = Object.values(data).sort((a, b) => a.ts - b.ts);
    }
    messageState.currentIndex = Math.max(0, messageState.messages.length - 1);
    showCurrentMessage();
    restartCycleTimer();
  });
}

function showCurrentMessage() {
  const card = $('#messageCard');
  const textEl = $('#messageText');
  const fromEl = $('#messageFrom');
  if (!card || !textEl || !fromEl) return;

  card.classList.remove('msg-enter', 'msg-exit', 'msg-empty');

  if (messageState.messages.length === 0) {
    $('#messageDisplay').hidden = true;
    textEl.textContent = '';
    fromEl.textContent = 'Send one from the Messages app';
    card.classList.add('msg-empty');
    return;
  }

  $('#messageDisplay').hidden = false;
  const msg = messageState.messages[messageState.currentIndex];
  textEl.textContent = msg.text || '';
  fromEl.textContent = msg.from ? `-- ${msg.from}` : '';

  void card.offsetWidth;
  card.classList.add('msg-enter');
  messageState.isAnimating = false;
}

function cycleToNextMessage() {
  if (document.hidden || messageState.messages.length <= 1) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    messageState.currentIndex = (messageState.currentIndex + 1) % messageState.messages.length;
    showCurrentMessage();
    return;
  }
  if (messageState.isAnimating) return;

  messageState.isAnimating = true;
  const card = $('#messageCard');
  if (!card) return;

  card.classList.remove('msg-enter');
  void card.offsetWidth;
  card.classList.add('msg-exit');

  card.addEventListener('animationend', function onExitDone() {
    card.removeEventListener('animationend', onExitDone);
    card.classList.remove('msg-exit');

    messageState.currentIndex =
      (messageState.currentIndex + 1) % messageState.messages.length;

    showCurrentMessage();
  }, { once: true });
}

function restartCycleTimer() {
  if (messageState.cycleTimer) {
    clearInterval(messageState.cycleTimer);
  }
  if (messageState.messages.length > 1) {
    messageState.cycleTimer = setInterval(cycleToNextMessage, messageState.DISPLAY_TIME);
  }
}

function init() {
  setupGordon();
  setupMusic();
  setupGameTransitions();
  $('#messageDisplay').hidden = true;
  registerSW();
  setTimeout(loadFamilyMessages, 1500);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.speechSynthesis?.cancel();
  });
}

init();
