/* Shape Words - shape-to-word matching for preschoolers.
   Short rounds, three choices, spoken prompts, and immediate feedback. */

const $ = (sel) => document.querySelector(sel);

const SHAPES = [
  {
    key: 'pentagon',
    name: 'Pentagon',
    hint: 'A pentagon has 5 sides.',
    color: '#60a5fa',
    points: '100,20 176,75 147,164 53,164 24,75'
  },
  {
    key: 'hexagon',
    name: 'Hexagon',
    hint: 'A hexagon has 6 sides.',
    color: '#34d399',
    points: '100,18 171,59 171,141 100,182 29,141 29,59'
  },
  {
    key: 'octagon',
    name: 'Octagon',
    hint: 'An octagon has 8 sides.',
    color: '#fb7185',
    points: '72,20 128,20 180,72 180,128 128,180 72,180 20,128 20,72'
  },
  {
    key: 'diamond',
    name: 'Diamond',
    hint: 'A diamond looks like a tipped square.',
    color: '#fbbf24',
    points: '100,18 182,100 100,182 18,100'
  },
  {
    key: 'rectangle',
    name: 'Rectangle',
    hint: 'A rectangle has 4 sides.',
    color: '#a78bfa',
    rect: true
  },
  {
    key: 'oval',
    name: 'Oval',
    hint: 'An oval is like a stretched circle.',
    color: '#22d3ee',
    oval: true
  }
];

const state = {
  target: SHAPES[0],
  score: 0,
  musicEnabled: true,
  lastKey: null
};

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(items) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shapeSvg(shape) {
  if (shape.rect) {
    return `
      <svg viewBox="0 0 200 200" role="img" aria-label="${shape.name}">
        <rect x="26" y="58" width="148" height="84" rx="14" fill="${shape.color}" opacity="0.94" />
        <rect x="26" y="58" width="148" height="84" rx="14" fill="none" stroke="#0f172a" stroke-width="7" opacity="0.12" />
      </svg>`;
  }

  if (shape.oval) {
    return `
      <svg viewBox="0 0 200 200" role="img" aria-label="${shape.name}">
        <ellipse cx="100" cy="100" rx="76" ry="48" fill="${shape.color}" opacity="0.94" />
        <ellipse cx="100" cy="100" rx="76" ry="48" fill="none" stroke="#0f172a" stroke-width="7" opacity="0.12" />
      </svg>`;
  }

  return `
    <svg viewBox="0 0 200 200" role="img" aria-label="${shape.name}">
      <polygon points="${shape.points}" fill="${shape.color}" opacity="0.94" />
      <polygon points="${shape.points}" fill="none" stroke="#0f172a" stroke-width="7" opacity="0.12" />
    </svg>`;
}

function pickTarget() {
  const choices = SHAPES.filter((shape) => shape.key !== state.lastKey);
  state.target = choices[randInt(choices.length)];
  state.lastKey = state.target.key;
}

function pickWords() {
  const choices = new Set([state.target]);
  while (choices.size < 3) {
    choices.add(SHAPES[randInt(SHAPES.length)]);
  }
  return shuffle(Array.from(choices));
}

function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.12;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  } catch {}
}

function renderRound() {
  $('#shapeArt').innerHTML = shapeSvg(state.target);
  $('#prompt').textContent = 'Pick the word for this shape';
  $('#feedback').textContent = '';

  const wordGrid = $('#wordGrid');
  wordGrid.innerHTML = '';

  for (const shape of pickWords()) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wordBtn';
    btn.textContent = shape.name;
    btn.setAttribute('aria-label', shape.name);
    btn.addEventListener('click', () => handlePick(btn, shape));
    wordGrid.appendChild(btn);
  }
}

function flash(btn, kind) {
  btn.classList.remove('good', 'bad');
  void btn.offsetWidth;
  btn.classList.add(kind);
  window.setTimeout(() => btn.classList.remove(kind), 260);
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
    void confetti.offsetWidth;
    confetti.classList.add('show');
  }
  playGoodJobSound();
}

function nextRound() {
  window.setTimeout(() => {
    pickTarget();
    renderRound();
    speak(`Which word says ${state.target.name}?`);
  }, 600);
}

function handlePick(btn, shape) {
  speak(shape.name);

  if (shape.key === state.target.key) {
    state.score += 1;
    $('#score').textContent = String(state.score);
    $('#feedback').textContent = state.target.hint;
    flash(btn, 'good');
    celebrate();
    nextRound();
    return;
  }

  $('#feedback').textContent = `Try again. This shape is ${state.target.name}.`;
  flash(btn, 'bad');
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
  renderRound();
  $('#score').textContent = String(state.score);

  window.setTimeout(() => {
    speak(`Which word says ${state.target.name}?`);
  }, 500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
