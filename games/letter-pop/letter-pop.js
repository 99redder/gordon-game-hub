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

function celebrate() {
  const confetti = $('#confetti');
  if (!confetti) return;
  confetti.classList.remove('show');
  void confetti.offsetWidth;
  confetti.classList.add('show');
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
  renderTiles();
  updateHUD();
}

init();
