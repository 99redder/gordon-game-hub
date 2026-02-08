const $ = (s)=>document.querySelector(s);
const PETS = [{e:'🐻',n:'Bear'},{e:'🐰',n:'Bunny'},{e:'🐼',n:'Panda'},{e:'🦊',n:'Fox'}];
const ACCESSORIES = ['🎩','🕶️','🎀','👑','🧢','🌟','🦋','🍭'];
const state = { petIdx:0, hearts:0, accessory:'', musicOn:true };

function chime(freq=760,len=.15){
  try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C();const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=freq;g.gain.value=.0001;o.connect(g);g.connect(c.destination);const t=c.currentTime;g.gain.exponentialRampToValueAtTime(.13,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+len);o.start(t);o.stop(t+len+.02);setTimeout(()=>c.close?.().catch(()=>{}),260);}catch{}
}

function burst(){ const fx=$('#fx'); fx.classList.remove('show'); void fx.offsetWidth; fx.classList.add('show'); }

function render(){
  const p = PETS[state.petIdx % PETS.length];
  $('#pet').textContent = p.e;
  $('#petName').textContent = p.n;
  $('#hearts').textContent = String(state.hearts);
  $('#accessory').textContent = state.accessory;
}

function buildTools(){
  const box = $('#tools'); box.innerHTML='';
  ACCESSORIES.forEach((a, i)=>{
    const b=document.createElement('button'); b.className='tool'; b.type='button'; b.textContent=a;
    b.addEventListener('click', ()=>{
      state.accessory = a;
      state.hearts += 1;
      chime(650 + i*18, 0.1);
      if(state.hearts % 5 === 0){
        state.petIdx = (state.petIdx + 1) % PETS.length;
        burst(); chime(900,0.18);
      }
      render();
    });
    box.appendChild(b);
  });
}

function setupMusic(){
  const audio=$('#bgMusic'), toggle=$('#musicToggle');
  state.musicOn=(localStorage.getItem('ggh_music')||'on')==='on';
  const draw=()=>toggle.textContent=state.musicOn?'🔊':'🔇';
  async function start(){try{audio.volume=.16;audio.loop=true;await audio.play();state.musicOn=true;localStorage.setItem('ggh_music','on');draw();}catch{}}
  function stop(){audio.pause();audio.currentTime=0;state.musicOn=false;localStorage.setItem('ggh_music','off');draw();}
  window.addEventListener('pointerdown',()=>{if(state.musicOn)start();},{once:true});
  toggle.addEventListener('click',()=>state.musicOn?stop():start());
  draw();
}

setupMusic();
buildTools();
render();