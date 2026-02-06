/* Shape Safari (learning basic shapes) */

const $ = (sel) => document.querySelector(sel);

const SHAPES = [
  {
    key: 'circle',
    name: 'Circle',
    svg: (color) => `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="34" fill="${color}" opacity="0.92" /><circle cx="50" cy="50" r="34" fill="none" stroke="#0f172a" stroke-width="6" opacity="0.12" /></svg>`
  },
  {
    key: 'square',
    name: 'Square',
    svg: (color) => `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="20" y="20" width="60" height="60" rx="10" fill="${color}" opacity="0.92" /><rect x="20" y="20" width="60" height="60" rx="10" fill="none" stroke="#0f172a" stroke-width="6" opacity="0.12" /></svg>`
  },
  {
    key: 'triangle',
    name: 'Triangle',
    svg: (color) => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 18 L84 80 H16 Z" fill="${color}" opacity="0.92" /><path d="M50 18 L84 80 H16 Z" fill="none" stroke="#0f172a" stroke-width="6" opacity="0.12" /></svg>`
  },
  {
    key: 'star',
    name: 'Star',
    svg: (color) => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 14 L60 38 L86 38 L65 54 L73 78 L50 63 L27 78 L35 54 L14 38 L40 38 Z" fill="${color}" opacity="0.92" /><path d="M50 14 L60 38 L86 38 L65 54 L73 78 L50 63 L27 78 L35 54 L14 38 L40 38 Z" fill="none" stroke="#0f172a" stroke-width="6" opacity="0.12" /></svg>`
  },
  {
    key: 'heart',
    name: 'Heart',
    svg: (color) => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 82 C18 58 14 42 22 32 C30 22 44 24 50 34 C56 24 70 22 78 32 C86 42 82 58 50 82 Z" fill="${color}" opacity="0.92" /><path d="M50 82 C18 58 14 42 22 32 C30 22 44 24 50 34 C56 24 70 22 78 32 C86 42 82 58 50 82 Z" fill="none" stroke="#0f172a" stroke-width="6" opacity="0.12" /></svg>`
  },
  {
    key: 'diamond',
    name: 'Diamond',
    svg: (color) => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 14 L82 50 L50 86 L18 50 Z" fill="${color}" opacity="0.92" /><path d="M50 14 L82 50 L50 86 L18 50 Z" fill="none" stroke="#0f172a" stroke-width="6" opacity="0.12" /></svg>`
  }
];

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#fb7185', '#a78bfa', '#22d3ee'];

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

  // show 6 tiles, include target plus 5 others
  const others = shuffle(SHAPES.filter((s) => s.key !== state.target.key)).slice(0, 5);
  const tiles = shuffle([state.target, ...others]);

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
  window.setTimeout(() => btn.classList.remove(kind), 260);
}

function handlePick(btn, shape) {
  if (shape.key === state.target.key) {
    state.score += 1;
    $('#score').textContent = String(state.score);
    flash(btn, 'good');
    pickTarget();
    renderGrid();
  } else {
    flash(btn, 'bad');
  }
}

function setupMusic() {
  const audio = $('#bgMusic');
  const toggle = $('#musicToggle');

  const saved = localStorage.getItem('ggh_music') || 'on';
  state.musicEnabled = saved === 'on';

  function render() {
    toggle.textContent = state.musicEnabled ? 'Music: On' : 'Music: Off';
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
