/* Letter Pop (learning letters) */

const $ = (sel) => document.querySelector(sel);

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const state = {
  target: 'A',
  score: 0,
  streak: 0,
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
  // 12 tiles: 1 is target, rest are random distinct letters (avoid duplicates where possible)
  const set = new Set([state.target]);
  while (set.size < 12) {
    set.add(LETTERS[randInt(LETTERS.length)]);
  }
  const arr = Array.from(set);
  // shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

function updateHUD() {
  $('#score').textContent = String(state.score);
  $('#streak').textContent = String(state.streak);
}

function flash(btn, kind) {
  btn.classList.remove('good', 'bad');
  void btn.offsetWidth;
  btn.classList.add(kind);
  window.setTimeout(() => btn.classList.remove(kind), 260);
}

function handleGuess(btn, guess) {
  if (guess === state.target) {
    state.score += 1;
    state.streak += 1;
    flash(btn, 'good');
    pickTarget();
    renderTiles();
  } else {
    state.streak = 0;
    flash(btn, 'bad');
  }
  updateHUD();
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

  // Autostart after first gesture if enabled
  const tryAutostart = () => {
    if (!state.musicEnabled) return;
    start();
  };
  window.addEventListener('pointerdown', tryAutostart, { once: true });

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

  window.addEventListener('keydown', (e) => {
    const key = (e.key || '').toUpperCase();
    if (!LETTERS.includes(key)) return;

    const btn = Array.from(document.querySelectorAll('.tile'))
      .find((b) => b.textContent === key);
    if (btn) handleGuess(btn, key);
  });
}

init();
