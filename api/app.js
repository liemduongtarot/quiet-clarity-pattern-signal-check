import { gunzipSync } from 'node:zlib';
import pg from 'pg';
import crypto from 'node:crypto';
import { getVercelOidcToken } from '@vercel/oidc';

const BASE='https://raw.githubusercontent.com/liemduongtarot/quiet-clarity-pattern-signal-check/v834-functional-preview/preview/v834';
let bundlePromise;
const handlerCache=new Map();

function octal(b){const s=b.toString('utf8').replace(/\0.*$/,'').trim();return s?parseInt(s,8):0}
async function getBundle(){
  if(bundlePromise)return bundlePromise;
  bundlePromise=(async()=>{
    const parts=await Promise.all(Array.from({length:8},async(_,i)=>{
      const u=`${BASE}/part${String(i).padStart(2,'0')}.txt`;
      const r=await fetch(u,{cache:'no-store'});
      if(!r.ok)throw new Error(`bundle_part_${i}_${r.status}`);
      return (await r.text()).trim();
    }));
    const gz=Buffer.from(parts.join(''),'base64');
    const tar=gunzipSync(gz),m=new Map();
    let o=0;
    while(o+512<=tar.length){
      const h=tar.subarray(o,o+512); if(h.every(x=>x===0))break;
      const n=h.subarray(0,100).toString('utf8').replace(/\0.*$/,'');
      const p=h.subarray(345,500).toString('utf8').replace(/\0.*$/,'');
      const name=(p?`${p}/${n}`:n).replace(/^\.\//,'').replace(/^\//,'');
      const size=octal(h.subarray(124,136)),type=String.fromCharCode(h[156]||48);
      o+=512;
      if((type==='0'||type==='\0')&&name)m.set(name,Buffer.from(tar.subarray(o,o+size)));
      o+=Math.ceil(size/512)*512;
    }
    return m;
  })();
  return bundlePromise;
}
function ctype(p){
  if(p.endsWith('.html'))return'text/html; charset=utf-8';
  if(p.endsWith('.css'))return'text/css; charset=utf-8';
  if(p.endsWith('.js'))return'application/javascript; charset=utf-8';
  return'application/octet-stream';
}
async function getHandler(op){
  if(handlerCache.has(op))return handlerCache.get(op);
  const allowed=new Set(['analyse','save','resume','delete','handoff','health','selftest']);
  if(!allowed.has(op))return null;
  let src=(await getBundle()).get(`api/${op}.js`)?.toString('utf8');
  if(!src)return null;
  src=src.replace(/^import\s+[^;]+;\s*$/gm,'').replace(/export\s+default\s+(async\s+)?function\s+handler/,(_,a)=>`${a||''}function handler`);
  const factory=new Function('__deps',`const pg=__deps.pg;const crypto=__deps.crypto;const getVercelOidcToken=__deps.getVercelOidcToken;${src}\nreturn handler;`);
  const h=factory({pg,crypto,getVercelOidcToken}); handlerCache.set(op,h); return h;
}
function patchedRenderer(buf){
  let s=buf.toString('utf8');
  s=s.replace("fetch('/api/analyse'","fetch('/?op=analyse'")
     .replace("fetch('/api/save'","fetch('/?op=save'")
     .replace("function messengerUrl(message){return '/api/handoff';}","function messengerUrl(message){return '/?op=handoff';}");
  return Buffer.from(s);
}
export default async function handler(req,res){
  try{
    const op=String(req.query?.op||'');
    if(op){
      const h=await getHandler(op);
      if(!h)return res.status(404).json({error:'not_found'});
      res.setHeader('x-qc-preview-route','root-op');
      return await h(req,res);
    }
    if(req.method!=='GET'&&req.method!=='HEAD')return res.status(405).end();
    let p=String(req.query?.path||'index.html');
    try{p=decodeURIComponent(p)}catch{}
    p=p.replace(/^\/+/, '').replace(/\.\.(?:\/|\\)/g,''); if(!p)p='index.html';
    let b=(await getBundle()).get(p); if(!b)return res.status(404).send('not_found');
    if(p==='app-render.js')b=patchedRenderer(b);
    res.setHeader('content-type',ctype(p));
    res.setHeader('x-qc-version','v8.3.5-preview-auth-route');
    res.setHeader('cache-control',p.endsWith('.html')||p.endsWith('.js')?'no-store':'public, max-age=300');
    if(req.method==='HEAD')return res.status(200).end();
    return res.status(200).send(b);
  }catch(e){console.error('v835_app_error',e?.stack||e);return res.status(500).send('preview_unavailable')}
}
