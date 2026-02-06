/* Shape Safari (learning basic shapes) — toddler mode (2–3)
   - Only 3 shapes (circle/square/triangle)
   - 3 giant buttons
*/

const $ = (sel) => document.querySelector(sel);

const SHAPES = [
  {
    key: 'circle',
    name: 'Circle',
    svg: (color) => `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="34" fill="${color}" opacity="0.92" /><circle cx="50" cy="50" r="34" fill="none" stroke="#0f172a" stroke-width="6" opacity="0.10" /></svg>`
  },
  {
    key: 'square',
    name: 'Square',
    svg: (color) => `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="20" y="20" width="60" height="60" rx="10" fill="${color}" opacity="0.92" /><rect x="20" y="20" width="60" height="60" rx="10" fill="none" stroke="#0f172a" stroke-width="6" opacity="0.10" /></svg>`
  },
  {
    key: 'triangle',
    name: 'Triangle',
    svg: (color) => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 18 L84 80 H16 Z" fill="${color}" opacity="0.92" /><path d="M50 18 L84 80 H16 Z" fill="none" stroke="#0f172a" stroke-width="6" opacity="0.10" /></svg>`
  }
];

const COLORS = ['#60a5fa', '#34d399', '#fbbf24'];

const state = {
  target: SHAPES[0],
  score: 0,
  musicEnabled: true,
};

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function pickTarget() {
  state.target = SHAPES[randInt(SHAPES.length)];
  $('#targetName').textContent = state.target.name;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderGrid() {
  const grid = $('#grid');
  grid.innerHTML = '';

  const tiles = shuffle(SHAPES);

  tiles.forEach((shape, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tile';
    const color = COLORS[idx % COLORS.length];
    btn.innerHTML = shape.svg(color);
    btn.setAttribute('aria-label', shape.name);
    btn.addEventListener('click', () => handlePick(btn, shape));
    grid.appendChild(btn);
  });
}

function flash(btn, kind) {
  btn.classList.remove('good', 'bad');
  void btn.offsetWidth;
  btn.classList.add(kind);
  window.setTimeout(() => btn.classList.remove(kind), 240);
}

function playGoodJobSound() {
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
    o1.frequency.setValueAtTime(659.25, now);
    o1.connect(gain);

    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(783.99, now + 0.12);
    o2.connect(gain);

    o1.start(now);
    o1.stop(now + 0.22);
    o2.start(now + 0.12);
    o2.stop(now + 0.55);

    window.setTimeout(() => ctx.close?.().catch(() => {}), 700);
  } catch {}
}

function celebrate() {
  const confetti = $('#confetti');
  if (confetti) {
    confetti.classList.remove('show');
    // retrigger
    void confetti.offsetWidth;
    confetti.classList.add('show');
  }
  playGoodJobSound();
}

function sayShape(name) {
  // Speak the shape name (works on iPad after a user gesture)
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(name);
    u.rate = 0.9;
    u.pitch = 1.15;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  } catch {}
}

function handlePick(btn, shape) {
  // Always say the shape they tapped
  sayShape(shape.name);

  if (shape.key === state.target.key) {
    state.score += 1;
    $('#score').textContent = String(state.score);
    flash(btn, 'good');
    celebrate();
    window.setTimeout(() => {
      pickTarget();
      renderGrid();
    }, 260);
  } else {
    flash(btn, 'bad');
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
  renderGrid();
  $('#score').textContent = String(state.score);
}

init();
