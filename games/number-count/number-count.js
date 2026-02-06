/* Count & Tap (learning numbers / counting) — toddler mode (2–3)
   - Target 1–5
   - 10 huge stars
   - Auto-check: when tapped count == target, celebrate and advance
*/

const $ = (sel) => document.querySelector(sel);

const state = {
  target: 3,
  tapped: new Set(),
  score: 0,
  musicEnabled: true,
  lock: false,
};

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function setTarget() {
  state.target = 1 + randInt(5);
  $('#target').textContent = String(state.target);
}

function setStatus(text, good) {
  const el = $('#status');
  el.textContent = text || '';
  el.style.color = good === true ? '#065f46' : good === false ? '#7f1d1d' : '';
}

function updateScore() {
  $('#score').textContent = String(state.score);
}

function flashCard(kind) {
  const card = document.querySelector('.card');
  if (!card) return;
  card.classList.remove('good', 'bad');
  void card.offsetWidth;
  card.classList.add(kind);
  window.setTimeout(() => card.classList.remove(kind), 260);
}

function celebrate() {
  const confetti = $('#confetti');
  if (!confetti) return;
  confetti.classList.remove('show');
  void confetti.offsetWidth;
  confetti.classList.add('show');
}

function renderDots() {
  const wrap = $('#dots');
  wrap.innerHTML = '';
  state.tapped.clear();

  // 10 stars is plenty for counting 1–5 and keeps the screen simple.
  for (let i = 0; i < 10; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dot';
    btn.textContent = '⭐';
    btn.setAttribute('aria-label', 'Star');

    btn.addEventListener('click', () => {
      if (state.lock) return;

      if (state.tapped.has(i)) {
        state.tapped.delete(i);
        btn.classList.remove('on');
      } else {
        state.tapped.add(i);
        btn.classList.add('on');
      }

      // Auto-check
      if (state.tapped.size === state.target) {
        state.lock = true;
        state.score += 1;
        updateScore();
        setStatus('Yay! ⭐', true);
        flashCard('good');
        celebrate();

        window.setTimeout(() => {
          state.lock = false;
          setStatus('');
          setTarget();
          renderDots();
        }, 650);
      } else {
        setStatus('');
      }
    });

    wrap.appendChild(btn);
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
  setTarget();
  renderDots();
  setStatus('');
  updateScore();
}

init();
