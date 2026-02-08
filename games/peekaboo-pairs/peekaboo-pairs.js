const $ = (s)=>document.querySelector(s);
const EMOJIS = ['🐶','🐱','🦊'];
const state = { cards: [], open: [], matches: 0, stars: 0, lock: false, musicOn: true };

function chime(freq=740,len=0.12){
  try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C();const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=freq;g.gain.value=.0001;o.connect(g);g.connect(c.destination);const t=c.currentTime;g.gain.exponentialRampToValueAtTime(.12,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+len);o.start(t);o.stop(t+len+.02);setTimeout(()=>c.close?.().catch(()=>{}),260);}catch{}
}

function shuffle(a){const x=a.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}

function render(){
  $('#stars').textContent=state.stars;
  $('#matches').textContent=state.matches;
  const grid=$('#grid'); grid.innerHTML='';
  state.cards.forEach((c,idx)=>{
    const b=document.createElement('button');
    b.className='tile'+((c.open||c.matched)?' open':''); if(c.matched) b.classList.add('matched');
    b.textContent=(c.open||c.matched)?c.e:'❓';
    b.addEventListener('click',()=>tap(idx));
    grid.appendChild(b);
  });
}

function nextRound(){
  state.cards = shuffle([...EMOJIS,...EMOJIS]).map(e=>({e,open:false,matched:false}));
  state.open=[]; state.matches=0; state.lock=false; render();
}

function tap(i){
  if(state.lock) return;
  const c=state.cards[i]; if(c.open||c.matched) return;
  c.open=true; state.open.push(i); chime(620+(i*18),0.08); render();
  if(state.open.length<2) return;
  const [a,b]=state.open; state.lock=true;
  const same=state.cards[a].e===state.cards[b].e;
  setTimeout(()=>{
    if(same){
      state.cards[a].matched=true; state.cards[b].matched=true;
      state.matches+=1; state.stars+=1; chime(860,0.16); setTimeout(()=>chime(980,0.2),100);
      if(state.matches===3){ setTimeout(()=>{state.stars+=2; nextRound();},450); }
    }else{
      state.cards[a].open=false; state.cards[b].open=false; chime(300,0.1);
    }
    state.open=[]; state.lock=false; render();
  }, 420);
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
nextRound();