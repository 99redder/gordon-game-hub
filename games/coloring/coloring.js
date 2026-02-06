/* Coloring Time — simple toddler-friendly drawing canvas
   - Color palette
   - Pen vs Brush
   - Eraser
   - Clear
   - Music toggle icon (matches other pages)
*/

const $ = (sel) => document.querySelector(sel);

const state = {
  color: '#ef4444',
  tool: 'brush', // 'pen' | 'brush' | 'eraser'
  size: 22,
  drawing: false,
  last: null,
  musicEnabled: true,
};

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

function setupPalette() {
  const btns = Array.from(document.querySelectorAll('.colorBtn'));

  function select(btn) {
    btns.forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.color = btn.getAttribute('data-color') || '#ef4444';
    if (state.tool !== 'eraser') {
      // keep selected color
    }
  }

  btns.forEach((btn) => btn.addEventListener('click', () => {
    state.tool = state.tool === 'eraser' ? 'brush' : state.tool;
    syncToolButtons();
    select(btn);
  }));

  // default select first
  if (btns[0]) select(btns[0]);
}

function syncToolButtons() {
  const pen = $('#penBtn');
  const brush = $('#brushBtn');
  const eraser = $('#eraserBtn');

  const activeStyle = 'outline: 6px solid rgba(14,165,233,0.35);';
  pen.style = '';
  brush.style = '';
  eraser.style = '';

  if (state.tool === 'pen') pen.style = activeStyle;
  if (state.tool === 'brush') brush.style = activeStyle;
  if (state.tool === 'eraser') eraser.style = activeStyle;
}

function setupTools() {
  $('#penBtn').addEventListener('click', () => {
    state.tool = 'pen';
    syncToolButtons();
  });
  $('#brushBtn').addEventListener('click', () => {
    state.tool = 'brush';
    syncToolButtons();
  });
  $('#eraserBtn').addEventListener('click', () => {
    state.tool = 'eraser';
    syncToolButtons();
  });

  const size = $('#size');
  size.addEventListener('input', () => {
    state.size = Number(size.value) || 22;
  });

  $('#clearBtn').addEventListener('click', () => {
    clearCanvas();
  });

  syncToolButtons();
}

function resizeCanvas() {
  const canvas = $('#c');
  const wrap = canvas.parentElement;
  const rect = wrap.getBoundingClientRect();

  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  const w = Math.max(320, Math.floor(rect.width));
  const h = Math.max(320, Math.floor(rect.height));

  // Keep current drawing by copying pixels
  const old = document.createElement('canvas');
  old.width = canvas.width;
  old.height = canvas.height;
  old.getContext('2d').drawImage(canvas, 0, 0);

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // restore old image scaled
  if (old.width && old.height) {
    ctx.drawImage(old, 0, 0, old.width / dpr, old.height / dpr, 0, 0, w, h);
  }

  drawTemplate();
}

function clearCanvas() {
  const canvas = $('#c');
  const ctx = canvas.getContext('2d');
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  drawTemplate();
}

function drawTemplate() {
  // Simple thick-outline picture to color: big smiley + sun + 3 clouds.
  const canvas = $('#c');
  const ctx = canvas.getContext('2d');
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.save();
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(15,23,42,0.55)';

  // Sun
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.22, Math.min(w,h) * 0.09, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const r1 = Math.min(w,h) * 0.12;
    const r2 = Math.min(w,h) * 0.15;
    const cx = w * 0.82;
    const cy = h * 0.22;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }

  // Clouds
  function cloud(x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, 26*s, 0, Math.PI*2);
    ctx.arc(x+28*s, y-12*s, 32*s, 0, Math.PI*2);
    ctx.arc(x+62*s, y, 26*s, 0, Math.PI*2);
    ctx.arc(x+36*s, y+14*s, 30*s, 0, Math.PI*2);
    ctx.closePath();
    ctx.stroke();
  }
  cloud(w*0.10, h*0.18, 1.0);
  cloud(w*0.18, h*0.38, 1.15);
  cloud(w*0.08, h*0.62, 1.25);

  // Smiley face
  const r = Math.min(w,h) * 0.22;
  const cx = w*0.52;
  const cy = h*0.60;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.stroke();

  // Eyes
  ctx.beginPath();
  ctx.arc(cx - r*0.35, cy - r*0.2, r*0.08, 0, Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + r*0.35, cy - r*0.2, r*0.08, 0, Math.PI*2);
  ctx.stroke();

  // Smile
  ctx.beginPath();
  ctx.arc(cx, cy + r*0.05, r*0.55, 0, Math.PI);
  ctx.stroke();

  ctx.restore();
}

function getPoint(e) {
  const canvas = $('#c');
  const rect = canvas.getBoundingClientRect();

  const pt = (e.touches && e.touches[0]) ? e.touches[0] : e;
  return {
    x: pt.clientX - rect.left,
    y: pt.clientY - rect.top,
  };
}

function drawLine(from, to) {
  const canvas = $('#c');
  const ctx = canvas.getContext('2d');

  const size = state.size;

  if (state.tool === 'eraser') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = size * 1.1;
  } else if (state.tool === 'pen') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = state.color;
    ctx.lineWidth = size * 0.75;
  } else {
    // brush
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = state.color;
    ctx.lineWidth = size;
  }

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  // brush "dab" for softer look
  if (state.tool === 'brush') {
    ctx.fillStyle = state.color;
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(to.x, to.y, size * 0.55, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function setupCanvas() {
  const canvas = $('#c');

  function down(e) {
    e.preventDefault();
    state.drawing = true;
    state.last = getPoint(e);
  }

  function move(e) {
    if (!state.drawing) return;
    e.preventDefault();
    const pt = getPoint(e);
    if (state.last) drawLine(state.last, pt);
    state.last = pt;
  }

  function up(e) {
    if (!state.drawing) return;
    e.preventDefault();
    state.drawing = false;
    state.last = null;
  }

  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('pointerleave', up);

  window.addEventListener('resize', () => resizeCanvas());
  window.addEventListener('orientationchange', () => resizeCanvas());

  resizeCanvas();
}

function init() {
  setupMusic();
  setupPalette();
  setupTools();
  setupCanvas();
}

init();
