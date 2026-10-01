const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ID = /^\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const PNG = [137,80,78,71,13,10,26,10];
async function authorized(request, env) {
  if (!env.FAMILY_KEY) return false;
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
  if (!token || token.length > 256) return false;
  const bytes = new TextEncoder();
  const [a,b] = await Promise.all([crypto.subtle.digest('SHA-256',bytes.encode(token)),crypto.subtle.digest('SHA-256',bytes.encode(env.FAMILY_KEY))]);
  return crypto.subtle.timingSafeEqual(a,b);
}
async function boundedImage(request) {
  if (!request.body) return null;
  const reader=request.body.getReader(), chunks=[];
  let size=0;
  for (;;) {
    const {value,done}=await reader.read();if(done)break;
    size+=value.byteLength;
    if(size>MAX_IMAGE_BYTES){await reader.cancel();return null;}
    chunks.push(value);
  }
  const bytes=new Uint8Array(size);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  if(size<33||!PNG.every((n,i)=>bytes[i]===n))return null;
  const view=new DataView(bytes.buffer);
  if(view.getUint32(8)!==13||view.getUint32(12)!==0x49484452||view.getUint32(16)!==1000||view.getUint32(20)!==750)return null;
  return bytes;
}
export default {
  async fetch(request,env) {
    const url=new URL(request.url), origin=request.headers.get('Origin');
    const allowed=(env.ALLOWED_ORIGINS||'').split(',');
    const headers=new Headers({'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'});
    const json=(body,status=200)=>Response.json(body,{status,headers});
    if(origin&&!allowed.includes(origin))return json({error:'Origin not allowed'},403);
    if(origin)headers.set('Access-Control-Allow-Origin',origin);
    if(request.method==='OPTIONS') {
      headers.set('Access-Control-Allow-Methods','GET, PUT, OPTIONS');
      headers.set('Access-Control-Allow-Headers','Authorization, Content-Type, X-Picture-Title, X-Picture-Date');
      headers.set('Access-Control-Max-Age','86400');
      return new Response(null,{status:204,headers});
    }
    try {
      if(!await authorized(request,env))return json({error:'Family key required'},401);
      if(request.method==='GET'&&url.pathname==='/library')return json({id:env.LIBRARY_ID});
      if(request.method==='GET'&&url.pathname==='/snapshots') {
        const cursor=url.searchParams.get('cursor')||undefined;
        if(cursor?.length>2048)return json({error:'Invalid cursor'},400);
        const result=await env.PICTURES.list({prefix:'snapshots/',limit:100,cursor,include:['customMetadata']});
        return json({pictures:result.objects.map(object=>({id:object.key.slice('snapshots/'.length,-4),title:object.customMetadata?.title||'My picture',createdAt:object.customMetadata?.createdAt||object.uploaded.toISOString()})),cursor:result.truncated?result.cursor:null});
      }
      const id=url.pathname.startsWith('/snapshots/')?url.pathname.slice(11):'';
      if(!ID.test(id))return json({error:'Not found'},404);
      const key=`snapshots/${id}.png`;
      if(request.method==='GET') {
        const object=await env.PICTURES.get(key);
        if(!object)return json({error:'Picture not found'},404);
        headers.set('Content-Type','image/png');headers.set('Content-Disposition',`inline; filename="gordon-${id}.png"`);
        return new Response(object.body,{headers});
      }
      if(request.method==='PUT') {
        if(request.headers.get('Content-Type')!=='image/png')return json({error:'PNG required'},415);
        if(Number(request.headers.get('Content-Length'))>MAX_IMAGE_BYTES)return json({error:'Picture too large'},413);
        let title;
        try{title=decodeURIComponent(request.headers.get('X-Picture-Title')||'My picture');}catch{return json({error:'Invalid title'},400);}
        const createdAt=request.headers.get('X-Picture-Date');
        if(!title.length||title.length>80||!createdAt||!Number.isFinite(Date.parse(createdAt)))return json({error:'Invalid picture details'},400);
        const bytes=await boundedImage(request);if(!bytes)return json({error:'Expected a 1000 by 750 PNG under 2 MB'},400);
        // Conditional create keeps snapshots immutable and makes retries idempotent.
        const result=await env.PICTURES.put(key,bytes,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'image/png'},customMetadata:{title,createdAt:new Date(createdAt).toISOString()}});
        return json({id,saved:true},result?201:200);
      }
      return json({error:'Method not allowed'},405);
    }catch{
      console.error(JSON.stringify({event:'gallery_request_failed',method:request.method}));
      return json({error:'Please try again later'},500);
    }
  },
};
