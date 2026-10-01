const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function coloring() {
  const storage = new Map(), elements = new Map();
  const ctx = new Proxy({}, { get: (obj, key) => obj[key] || (() => {}) });
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      disabled:false, textContent:'', clientWidth:800, clientHeight:600,
      width:1000, height:750, getContext:() => ctx,
      getBoundingClientRect() {return {left:0,top:0,width:this.clientWidth,height:this.clientHeight};},
    });
    return elements.get(id);
  };
  const sandbox = vm.createContext({
    document:{querySelector:element,querySelectorAll:() => []}, window:{devicePixelRatio:2},
    localStorage:{getItem:key => storage.get(key),setItem:(key,value) => storage.set(key,value)},
  });
  vm.runInContext(fs.readFileSync(path.join(root,'games/coloring/coloring.js'),'utf8').replace(/init\(\);\s*$/, ''),sandbox);
  return {run:code => vm.runInContext(code,sandbox),element,storage};
}
test('history restores cleared work; pictures and reload saves stay independent', () => {
  const {run,storage} = coloring();
  run(`remember(); sheet().strokes.push({tool:'brush',color:'#ef4444',size:.03,points:[[.5,.5]]}); saveDrawings();`);
  assert.equal(run('sheet().strokes.length'),1);
  run('undo()'); assert.equal(run('sheet().strokes.length'),0);
  run('redo()'); assert.equal(run('sheet().strokes.length'),1);
  run('remember(); sheet().strokes=[]; undo()'); assert.equal(run('sheet().strokes.length'),1);
  run('selectTemplate(3)'); assert.equal(run('sheet().strokes.length'),0);
  run('selectTemplate(2)'); assert.equal(run('sheet().strokes.length'),1);
  const next = coloring();next.storage.set('ggh_coloring_v2',storage.get('ggh_coloring_v2'));
  next.run('restoreDrawings()');assert.equal(next.run('state.currentTemplate'),2);
  assert.equal(next.run('sheet().strokes[0].points[0][0]'),.5);
});
test('rotation preserves paper coordinates and corrupt saved strokes are ignored', () => {
  const {run,element,storage} = coloring();
  assert.equal(run('JSON.stringify(getPoint({clientX:400,clientY:300}))'),'[0.5,0.5]');
  element('#c').clientWidth=600;element('#c').clientHeight=800;
  assert.equal(run('JSON.stringify(getPoint({clientX:300,clientY:400}))'),'[0.5,0.5]');
  assert.equal(run('JSON.stringify(canvasSize())'),'{"w":1000,"h":750}');
  storage.set('ggh_coloring_v2',JSON.stringify({pictures:{sunny:[{tool:'brush',points:'broken'}]}}));
  run('restoreDrawings()');assert.equal(run('sheet().strokes.length'),0);
});
test('storage failure reports unsaved work without breaking drawing history', () => {
  const {run,element}=coloring();
  run(`localStorage.setItem=()=>{throw new Error('quota')};saveDrawings();`);
  assert.match(element('#saveStatus').textContent,/full or unavailable/);
  assert.doesNotThrow(()=>run('remember();undo();redo()'));
});
function worker(overrides={}) {
  const listeners={},deleted=[];
  const sandbox=vm.createContext({URL,Response,
    self:{location:{origin:'https://example.test'},clients:{claim:async()=>{}},addEventListener:(name,fn)=>{listeners[name]=fn;}},
    caches:{keys:async()=>['gordon-game-hub-v22','gordon-game-hub-v25','another-app'],delete:async key=>deleted.push(key)},...overrides});
  vm.runInContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),sandbox);
  return {listeners,deleted};
}
test('worker activation preserves unrelated app caches',async()=>{
  const {listeners,deleted}=worker();let done;
  listeners.activate({waitUntil:promise=>done=promise});await done;
  assert.deepEqual(deleted,['gordon-game-hub-v22']);
});
test('offline PWA launch ignores the source query when matching cached HTML',async()=>{
  let options;const response=new Response('offline playroom');
  const {listeners}=worker({caches:{open:async()=>({match:async(req,opts)=>{options=opts;return response;}})}});
  let result;listeners.fetch({request:{method:'GET',url:'https://example.test/?source=pwa',mode:'navigate'},respondWith:promise=>result=promise});
  assert.equal(await(await result).text(),'offline playroom');assert.equal(options.ignoreSearch,true);
});
test('worker ignores external messaging and does not cache failed responses',async()=>{
  let puts=0;
  const {listeners}=worker({caches:{open:async()=>({match:async()=>null,put:async()=>puts++})},fetch:async()=>new Response('missing',{status:404})});
  listeners.fetch({request:{method:'GET',url:'https://www.gstatic.com/library.js'},respondWith:()=>assert.fail('external intercepted')});
  let result;listeners.fetch({request:{method:'GET',url:'https://example.test/missing',mode:'cors'},respondWith:promise=>result=promise});
  assert.equal((await result).status,404);assert.equal(puts,0);
});
