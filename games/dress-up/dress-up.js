/* Dress Up — toddler-friendly
   - Pick item (hat/shirt/pants/glasses/bow)
   - Pick color to apply
   - Toggle accessories on/off
   - Surprise button
*/

const $ = (sel) => document.querySelector(sel);

const state = {
  item: 'hat',
  color: '#ef4444',
  musicEnabled: true,
};

const ITEMS = ['hat','shirt','pants','glasses','bow'];
const COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7','#0f172a','#ffffff'];

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

function setupMusic() {
  const audio = $('#bgMusic');
  const toggle = $('#musicToggle');

  const saved = localStorage.getItem('ggh_music') || 'on';
  state.musicEnabled = saved === 'on';

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

function setSelectedItem(item) {
  state.item = item;
  document.querySelectorAll('.itemBtn').forEach((b) => {
    b.classList.toggle('selected', b.getAttribute('data-item') === item);
  });
}

function setSelectedColor(color) {
  state.color = color;
  document.querySelectorAll('.colorBtn').forEach((b) => {
    b.classList.toggle('selected', b.getAttribute('data-color') === color);
  });
}

function getLayer(item) {
  return document.getElementById(item);
}

function applyColorToItem(item, color) {
  const layer = getLayer(item);
  if (!layer) return;

  // Toggle accessories on if needed
  if (item === 'hat' || item === 'glasses' || item === 'bow') {
    // If hidden, show it
    layer.style.opacity = '1';
  }

  if (item === 'shirt' || item === 'pants') {
    layer.setAttribute('fill', color);
  } else if (item === 'hat' || item === 'bow') {
    // color the first path(s) by setting fill on children
    layer.querySelectorAll('[fill]').forEach((el) => el.setAttribute('fill', color));
  } else if (item === 'glasses') {
    // glasses are strokes
    layer.querySelectorAll('[stroke]').forEach((el) => el.setAttribute('stroke', color));
  }

  celebrate();
}

function toggleItem(item) {
  const layer = getLayer(item);
  if (!layer) return;
  const cur = Number(layer.style.opacity || getComputedStyle(layer).opacity || 1);
  const next = cur > 0 ? 0 : 1;
  layer.style.opacity = String(next);
  celebrate();
}

function setupItemButtons() {
  document.querySelectorAll('.itemBtn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.getAttribute('data-item');
      if (!item) return;

      // Double-tap-ish behavior: if they tap the already-selected accessory, toggle it.
      if (state.item === item && (item === 'hat' || item === 'glasses' || item === 'bow')) {
        toggleItem(item);
        return;
      }

      setSelectedItem(item);
    });
  });

  setSelectedItem(state.item);
}

function setupColors() {
  document.querySelectorAll('.colorBtn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color');
      if (!color) return;
      setSelectedColor(color);
      applyColorToItem(state.item, color);
    });
  });

  setSelectedColor(state.color);
}

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function setupRandom() {
  $('#randomBtn').addEventListener('click', () => {
    // randomize clothing colors
    applyColorToItem('shirt', randPick(COLORS));
    applyColorToItem('pants', randPick(COLORS));

    // accessories: show/hide and color
    const showHat = Math.random() < 0.8;
    const showGlasses = Math.random() < 0.6;
    const showBow = Math.random() < 0.6;

    getLayer('hat').style.opacity = showHat ? '1' : '0';
    getLayer('glasses').style.opacity = showGlasses ? '1' : '0';
    getLayer('bow').style.opacity = showBow ? '1' : '0';

    applyColorToItem('hat', randPick(COLORS));
    applyColorToItem('glasses', randPick(COLORS));
    applyColorToItem('bow', randPick(COLORS));
  });
}

function init() {
  setupMusic();
  setupItemButtons();
  setupColors();
  setupRandom();
}

init();
