/* Letter Pop (learning letters) — toddler mode (2–3)
   - Fewer letters (A–F)
   - Fewer choices (6 big buttons)
   - Simple score only
*/

const $ = (sel) => document.querySelector(sel);

const LETTERS = ['A','B','C','D','E','F'];

const state = {
  target: 'A',
  score: 0,
  musicEnabled: true,
};

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function pickTarget() {
  state.target = LETTERS[randInt(LETTERS.length)];
  $('#targetLetter').textContent = state.target;
}

function chooseTiles() {
  // 6 tiles total (target + 5 others)
  const set = new Set([state.target]);
  while (set.size < 6) {
    set.add(LETTERS[randInt(LETTERS.length)]);
  }
  const arr = Array.from(set);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function updateHUD() {
  $('#score').textContent = String(state.score);
}

function flash(btn, kind) {
  btn.classList.remove('good', 'bad');
  void btn.offsetWidth;
  btn.classList.add(kind);
  window.setTimeout(() => btn.classList.remove(kind), 240);
}

function celebrateNext() {
  // quick next round, short delay so the child sees the "good" highlight
  window.setTimeout(() => {
    pickTarget();
    renderTiles();
  }, 260);
}

function playGoodJobSound() {
  // No external asset needed: tiny happy chime using WebAudio.
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    gain.connect(ctx.destination);

    const o1 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(659.25, now); // E5
    o1.connect(gain);

    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(783.99, now + 0.12); // G5
    o2.connect(gain);

    o1.start(now);
    o1.stop(now + 0.22);
    o2.start(now + 0.12);
    o2.stop(now + 0.55);

    // close a bit later to free resources
    window.setTimeout(() => ctx.close?.().catch(() => {}), 700);
  } catch {}
}

function celebrate() {
  const confetti = $('#confetti');
  if (confetti) {
    confetti.classList.remove('show');
    void confetti.offsetWidth;
    confetti.classList.add('show');
  }
  playGoodJobSound();
}

function handleGuess(btn, guess) {
  if (guess === state.target) {
    state.score += 1;
    flash(btn, 'good');
    celebrate();
    updateHUD();
    celebrateNext();
  } else {
    flash(btn, 'bad');
  }
}

function renderTiles() {
  const area = $('#playArea');
  area.innerHTML = '';
  const letters = chooseTiles();

  for (const ch of letters) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tile';
    btn.textContent = ch;
    btn.setAttribute('aria-label', `Letter ${ch}`);
    btn.addEventListener('click', () => handleGuess(btn, ch));
    area.appendChild(btn);
  }
}

function setupMusic() {
  const audio = $('#bgMusic');
  const toggle = $('#musicToggle');

  const saved = localStorage.getItem('ggh_music') || 'on';
  state.musicEnabled = saved === 'on';

  function icon(on) {
    if (on) {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M3 10v4c0 .55.45 1 1 1h3l5 4V5L7 9H4c-.55 0-1 .45-1 1z" fill="currentColor" opacity="0.95"/>
          <path d="M16.5 8.5a1 1 0 0 1 1.4 0 6 6 0 0 1 0 7 1 1 0 1 1-1.4-1.4 4 4 0 0 0 0-4.2 1 1 0 0 1 0-1.4z" fill="currentColor" opacity="0.9"/>
        </svg>`;
    }
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3 10v4c0 .55.45 1 1 1h3l5 4V5L7 9H4c-.55 0-1 .45-1 1z" fill="currentColor" opacity="0.95"/>
        <path d="M16 9l5 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M21 9l-5 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
      </svg>`;
  }

  function render() {
    toggle.innerHTML = icon(state.musicEnabled);
    toggle.setAttribute('aria-label', state.musicEnabled ? 'Music on' : 'Music off');
    toggle.setAttribute('title', state.musicEnabled ? 'Music on' : 'Music off');
  }

  async function start() {
    try {
      audio.volume = 0.16;
      audio.loop = true;
      await audio.play();
      state.musicEnabled = true;
      localStorage.setItem('ggh_music', 'on');
      render();
    } catch {
      state.musicEnabled = false;
      localStorage.setItem('ggh_music', 'off');
      render();
      alert('Tap Music to start (iPad autoplay rules).');
    }
  }

  function stop() {
    audio.pause();
    audio.currentTime = 0;
    state.musicEnabled = false;
    localStorage.setItem('ggh_music', 'off');
    render();
  }

  window.addEventListener('pointerdown', () => {
    if (state.musicEnabled) start();
  }, { once: true });

  toggle.addEventListener('click', () => {
    if (state.musicEnabled) stop();
    else start();
  });

  render();
}

function init() {
  setupMusic();
  pickTarget();
  renderTiles();
  updateHUD();
}

init();
