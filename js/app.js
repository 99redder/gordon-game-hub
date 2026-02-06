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

/* ---- Firebase message cycling display ---- */

const messageState = {
  messages: [],
  currentIndex: 0,
  cycleTimer: null,
  DISPLAY_TIME: 5000,
  isAnimating: false,
};

function setupFirebaseMessages() {
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
    textEl.textContent = 'No messages yet!';
    fromEl.textContent = 'Send one from the Messages app';
    card.classList.add('msg-empty');
    return;
  }

  const msg = messageState.messages[messageState.currentIndex];
  textEl.textContent = msg.text || '';
  fromEl.textContent = msg.from ? `-- ${msg.from}` : '';

  void card.offsetWidth;
  card.classList.add('msg-enter');
  messageState.isAnimating = false;
}

function cycleToNextMessage() {
  if (messageState.messages.length <= 1) return;
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
  setupFirebaseMessages();
  registerSW();
}

init();
