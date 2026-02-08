const $ = (s) => document.querySelector(s);
const LETTERS = ['A','B','C','D'];
const state = { idx: 0, stickers: 0, round: 1, musicOn: true };

function chime(freq=700, len=0.16){
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = freq; g.gain.value = 0.0001;
    o.connect(g); g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + len);
    o.start(now); o.stop(now + len + 0.02);
    setTimeout(() => ctx.close?.().catch(()=>{}), 280);
  } catch {}
}

function celebrate(){
  const c = $('#cele');
  c.classList.remove('show'); void c.offsetWidth; c.classList.add('show');
  chime(760,0.2); setTimeout(()=>chime(940,0.26),120);
}

function render(){
  const letter = LETTERS[state.idx % LETTERS.length];
  $('#target').textContent = letter;
  $('#stickers').textContent = String(state.stickers);
  $('#round').textContent = String(state.round);

  const board = $('#board');
  board.innerHTML = '';
  const total = 12;
  for(let i=0;i<total;i++){
    const b = document.createElement('button');
    b.type='button'; b.className='dot'; b.textContent = i < 4 ? letter : '•';
    b.addEventListener('click', ()=>{
      if (b.classList.contains('done')) return;
      b.classList.add('done'); chime(620 + (i*14), 0.09);
      const done = board.querySelectorAll('.dot.done').length;
      if(done === total){
        state.stickers += 1;
        state.round += 1;
        state.idx = (state.idx + 1) % LETTERS.length;
        celebrate();
        setTimeout(render, 360);
      }
    });
    board.appendChild(b);
  }
}

function setupMusic(){
  const audio = $('#bgMusic'); const toggle = $('#musicToggle');
  state.musicOn = (localStorage.getItem('ggh_music') || 'on') === 'on';
  const icon = (on) => on ? '🔊' : '🔇';
  function draw(){ toggle.textContent = icon(state.musicOn); }
  async function start(){ try { audio.volume=.16; audio.loop=true; await audio.play(); state.musicOn=true; localStorage.setItem('ggh_music','on'); draw(); } catch {} }
  function stop(){ audio.pause(); audio.currentTime=0; state.musicOn=false; localStorage.setItem('ggh_music','off'); draw(); }
  window.addEventListener('pointerdown', ()=>{ if(state.musicOn) start(); }, {once:true});
  toggle.addEventListener('click', ()=> state.musicOn ? stop() : start());
  draw();
}

setupMusic();
render();