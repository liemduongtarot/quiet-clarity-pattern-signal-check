import { gunzipSync } from 'node:zlib';
import pg from 'pg';
import crypto from 'node:crypto';
import { getVercelOidcToken } from '@vercel/oidc';

const BASE='https://raw.githubusercontent.com/liemduongtarot/quiet-clarity-pattern-signal-check/v834-functional-preview/preview/v834';
const MESSENGER_URL='https://m.me/quietclarityreadings';
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
  const intakeFn=`function intakePayload(){return {main_area:state.area==='other'?(state.areaOther||'').trim():(state.area||''),current_situation:(state.situation||'').trim(),clarity_need:state.clarity||'',other_clarity_need:state.clarity==='other'?(state.clarityOther||'').trim():''}}\n`;
  const copyFn=`async function copyText(text){try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true}}catch(e){console.warn('clipboard_api_failed',e)}try{const ta=document.createElement('textarea');ta.value=String(text||'');ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.left='-9999px';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);const ok=document.execCommand('copy');ta.remove();return ok}catch(e){console.error('clipboard_fallback_failed',e);return false}}\n`;
  if(!/function\s+intakePayload\s*\(/.test(s))s=s.replace('async function analyse(){',intakeFn+'async function analyse(){');
  if(!/async function\s+copyText\s*\(/.test(s))s=s.replace('function messengerUrl(message)',copyFn+'function messengerUrl(message)');
  s=s.replace("fetch('/api/analyse'","fetch('/?op=analyse'")
     .replace("fetch('/api/save'","fetch('/?op=save'")
     .replace("function messengerUrl(message){return '/api/handoff';}","function messengerUrl(message){return '/?op=handoff';}")
     .replace("document.getElementById('copy').onclick=()=>navigator.clipboard?.writeText(state.reference);","document.getElementById('copy').onclick=()=>copyText(state.reference);")
     .replace("document.getElementById('messenger').onclick=async()=>{try{await navigator.clipboard?.writeText(msg)}catch{}window.open(messengerUrl(msg),'_blank','noopener')}","document.getElementById('messenger').onclick=async()=>{await copyText(msg);window.open(messengerUrl(msg),'_blank','noopener')}")
     .replace("}catch(e){state.result={error:true};nav('result')}}","}catch(e){console.error('qc_analysis_client_error',e);state.result={error:true};nav('result')}}");
  return Buffer.from(s);
}
export default async function handler(req,res){
  try{
    const op=String(req.query?.op||'');
    if(op){
      if(op==='handoff')return res.redirect(302,MESSENGER_URL);
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
    res.setHeader('x-qc-version','v8.3.6-permanent-fix');
    res.setHeader('cache-control',p.endsWith('.html')||p.endsWith('.js')?'no-store':'public, max-age=300');
    if(req.method==='HEAD')return res.status(200).end();
    return res.status(200).send(b);
  }catch(e){console.error('v836_app_error',e?.stack||e);return res.status(500).send('preview_unavailable')}
}
