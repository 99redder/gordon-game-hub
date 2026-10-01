import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { fileURLToPath } from 'node:url';
const mf = new Miniflare(convertV4MiniflareOptions({ modules:true, scriptPath:fileURLToPath(new URL('../worker.js',import.meta.url)), compatibilityDate:'2026-09-30', r2Buckets:['PICTURES'], bindings:{FAMILY_KEY:'local-test-family-key',LIBRARY_ID:'test-gallery',ALLOWED_ORIGINS:'http://127.0.0.1:8765'} }));
after(()=>mf.dispose());
const id='8000000000000-11111111-1111-4111-8111-111111111111';
function call(path,options={}) {return mf.dispatchFetch('https://gallery.test'+path,{...options,headers:{Authorization:'Bearer local-test-family-key',...options.headers}});}
const image=new Uint8Array(33);image.set([137,80,78,71,13,10,26,10]);const view=new DataView(image.buffer);view.setUint32(8,13);view.setUint32(12,0x49484452);view.setUint32(16,1000);view.setUint32(20,750);
const upload={method:'PUT',headers:{'Content-Type':'image/png','X-Picture-Title':'My%20cat','X-Picture-Date':'2026-09-30T12:00:00.000Z'},body:image};
test('private gallery rejects missing or wrong credentials',async()=>{
 assert.equal((await mf.dispatchFetch('https://gallery.test/snapshots')).status,401);
 assert.equal((await call('/snapshots',{headers:{Authorization:'Bearer wrong'}})).status,401);
 assert.equal((await call('/library')).status,200);
});
test('CORS allows the playroom only; preflight carries upload headers',async()=>{
 assert.equal((await call('/snapshots',{headers:{Origin:'https://unrelated.example'}})).status,403);
 const preflight=await call('/snapshots/'+id,{method:'OPTIONS',headers:{Origin:'http://127.0.0.1:8765'}});
 assert.equal(preflight.status,204);assert.match(preflight.headers.get('Access-Control-Allow-Headers'),/Authorization/);
});
test('uploads persist metadata and image, and retries cannot overwrite a snapshot',async()=>{
 assert.equal((await call('/snapshots/'+id,upload)).status,201);
 assert.equal((await call('/snapshots/'+id,{...upload,headers:{...upload.headers,'X-Picture-Title':'Changed'}})).status,200);
 const list=await(await call('/snapshots')).json();assert.equal(list.pictures[0].title,'My cat');
 const response=await call('/snapshots/'+id);assert.equal(response.status,200);assert.equal(response.headers.get('Content-Type'),'image/png');
 assert.deepEqual(new Uint8Array(await response.arrayBuffer()),image);
 assert.equal(response.headers.get('Cache-Control'),'private, no-store');
});
test('invalid paths, file types, dimensions, size and missing objects are rejected',async()=>{
 assert.equal((await call('/snapshots/invalid',upload)).status,404);
 assert.equal((await call('/snapshots/'+id,{...upload,headers:{'Content-Type':'text/html'}})).status,415);
 assert.equal((await call('/snapshots/'+id,{...upload,body:new Uint8Array(20)})).status,400);
 assert.equal((await call('/snapshots/'+id,{...upload,body:new Uint8Array(2*1024*1024+1)})).status,413);
 assert.equal((await call('/snapshots/8000000000000-22222222-2222-4222-8222-222222222222')).status,404);
});
