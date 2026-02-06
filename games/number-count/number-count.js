/* Count & Tap (learning numbers / counting) */

const $ = (sel) => document.querySelector(sel);

const state = {
  target: 3,
  tapped: new Set(),
  score: 0,
  musicEnabled: true,
};

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function setTarget() {
  state.target = 1 + randInt(10);
  $('#target').textContent = String(state.target);
}

function setStatus(text, good) {
  const el = $('#status');
  el.textContent = text;
  el.style.color = good === true ? '#065f46' : good === false ? '#7f1d1d' : '';
}

function updateCounts() {
  $('#tapped').textContent = String(state.tapped.size);
  $('#score').textContent = String(state.score);
}

function renderDots() {
  const wrap = $('#dots');
  wrap.innerHTML = '';
  state.tapped.clear();
  for (let i = 0; i < 16; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dot';
    btn.textContent = '⭐';
    btn.setAttribute('aria-label', 'Star');

    btn.addEventListener('click', () => {
      if (state.tapped.has(i)) {
        state.tapped.delete(i);
        btn.classList.remove('on');
      } else {
        state.tapped.add(i);
        btn.classList.add('on');
      }
      setStatus('');
      updateCounts();
    });

    wrap.appendChild(btn);
  }
  updateCounts();
}

function flashCard(kind) {
  const card = document.querySelector('.card');
  if (!card) return;
  card.classList.remove('good', 'bad');
  void card.offsetWidth;
  card.classList.add(kind);
  window.setTimeout(() => card.classList.remove(kind), 260);
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
  setTarget();
  renderDots();
  setStatus('');

  $('#checkBtn').addEventListener('click', () => {
    if (state.tapped.size === state.target) {
      state.score += 1;
      setStatus('Nice counting! ✅', true);
      flashCard('good');
      setTarget();
      renderDots();
    } else {
      setStatus(`Try again! (Need ${state.target})`, false);
      flashCard('bad');
    }
    updateCounts();
  });

  $('#resetBtn').addEventListener('click', () => {
    renderDots();
    setStatus('');
  });

  updateCounts();
}

init();
