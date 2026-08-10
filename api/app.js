import { gunzipSync } from 'node:zlib';
import pg from 'pg';
import crypto from 'node:crypto';
import { getVercelOidcToken } from '@vercel/oidc';

const BASE='https://raw.githubusercontent.com/liemduongtarot/quiet-clarity-pattern-signal-check/v834-functional-preview/preview/v834';
const MESSENGER_URL='https://m.me/quietclarity.uklondon';
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
  const handoffFns=`async function copyText(text){try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true}}catch(e){console.warn('clipboard_api_failed',e)}try{const ta=document.createElement('textarea');ta.value=String(text||'');ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.left='-9999px';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);const ok=document.execCommand('copy');ta.remove();return ok}catch(e){console.error('clipboard_fallback_failed',e);return false}}\nfunction showCopyFallback(text){document.getElementById('qcCopyFallback')?.remove();const box=document.createElement('div');box.id='qcCopyFallback';box.style.cssText='position:fixed;left:18px;right:18px;bottom:18px;z-index:99999;background:#1a1009;color:#f2e4d2;border:1px solid #8b6639;border-radius:12px;padding:14px;box-shadow:0 10px 40px rgba(0,0,0,.35)';const p=document.createElement('div');p.textContent=state.lang==='vi'?'Trình duyệt chưa tự sao chép được. Text đã được chọn sẵn — nhấn Ctrl+C rồi dán vào Messenger để Quiet Clarity mở lại đúng kết quả bạn vừa lưu.':'Your browser could not copy automatically. The text is selected — press Ctrl+C, then paste it into Messenger so Quiet Clarity can retrieve the result you just saved.';p.style.marginBottom='8px';const ta=document.createElement('textarea');ta.value=String(text||'');ta.readOnly=true;ta.style.cssText='width:100%;min-height:78px;box-sizing:border-box;background:#0f0905;color:#f2e4d2;border:1px solid #6f522e;border-radius:8px;padding:10px';const close=document.createElement('button');close.textContent=state.lang==='vi'?'ĐÓNG':'CLOSE';close.style.cssText='margin-top:8px;padding:8px 12px';close.onclick=()=>box.remove();box.append(p,ta,close);document.body.appendChild(box);ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length)}\nasync function copyTextOrFallback(text){const ok=await copyText(text);if(!ok)showCopyFallback(text);return ok}\nfunction openMessengerWithCopy(text){const popup=window.open('about:blank','_blank');if(popup)popup.opener=null;copyTextOrFallback(text).finally(()=>{if(popup)popup.location=messengerUrl(text);else location.href=messengerUrl(text)})}\n`;
  if(!/function\s+intakePayload\s*\(/.test(s))s=s.replace('async function analyse(){',intakeFn+'async function analyse(){');
  if(!/function\s+openMessengerWithCopy\s*\(/.test(s))s=s.replace('function messengerUrl(message)',handoffFns+'function messengerUrl(message)');
  s=s.replace("fetch('/api/analyse'","fetch('/?op=analyse'")
     .replace("fetch('/api/save'","fetch('/?op=save'")
     .replace("function messengerUrl(message){return '/api/handoff';}","function messengerUrl(message){return '/?op=handoff';}")
     .replace("document.getElementById('copy').onclick=()=>navigator.clipboard?.writeText(state.reference);","document.getElementById('copy').onclick=()=>copyTextOrFallback(state.reference);")
     .replace("document.getElementById('messenger').onclick=async()=>{try{await navigator.clipboard?.writeText(msg)}catch{}window.open(messengerUrl(msg),'_blank','noopener')}","document.getElementById('messenger').onclick=()=>openMessengerWithCopy(msg)")
     .replace("SAO CHÉP MÃ & MỞ MESSENGER","MỞ MESSENGER — MÃ ĐÃ ĐƯỢC SAO CHÉP")
     .replace("COPY CODE & OPEN MESSENGER","OPEN MESSENGER — CODE COPIED")
     .replace("Bạn sẽ không phải nhập lại những thông tin vừa cung cấp. Khi nhắn Quiet Clarity, chỉ cần gửi mã này.","Dán mã này vào ô chat và gửi để Quiet Clarity mở lại đúng kết quả bạn vừa lưu, hiểu rằng bạn muốn tiếp tục từ đây, và không bắt bạn nhập lại những thông tin vừa cung cấp.")
     .replace("You will not need to enter the same information again. When you message Quiet Clarity, simply send this code.","Paste this code into the chat and send it so Quiet Clarity can retrieve the result you just saved, understand that you want to continue from here, and avoid asking you to enter the same information again.")
     .replace("}catch(e){state.result={error:true};nav('result')}}","}catch(e){console.error('qc_analysis_client_error',e);state.result={error:true};nav('result')}}");
  return Buffer.from(s);
}
function patchedQuestions(buf){
  let s=buf.toString('utf8');
  s=s.replace("['business','Business / công việc tự doanh']","['business','Kinh doanh / tự làm chủ']")
     .replace("['relationships','Mối quan hệ'],['home','Nhà ở / gia đình']","['romantic','Tình cảm / hẹn hò'],['family','Gia đình / cha mẹ / con cái'],['friends','Bạn bè / các mối quan hệ khác'],['home','Nhà ở / môi trường sống']")
     .replace("['wellbeing','Sức lực / trạng thái hằng ngày']","['wellbeing','Thể chất / tinh thần']")
     .replace("['relationships','Relationships'],['home','Home / family']","['romantic','Romantic relationships / dating'],['family','Family / parents / children'],['friends','Friends / other relationships'],['home','Home / living situation']");
  return Buffer.from(s);
}
function patchedCore(buf){
  let s=buf.toString('utf8');
  s=s.replace("const DRAFT_KEY='qc_pattern_signal_draft_v12';","const DRAFT_KEY='qc_pattern_signal_draft_v13';")
     .replace("business:'chuyện business này'","business:'chuyện kinh doanh / tự làm chủ này'")
     .replace("relationships:'mối quan hệ này',home:'chuyện nhà ở / gia đình này'","romantic:'chuyện tình cảm này',family:'chuyện gia đình này',friends:'mối quan hệ này',home:'tình hình nhà ở / môi trường sống này'")
     .replace("wellbeing:'trạng thái hằng ngày này'","wellbeing:'trạng thái thể chất / tinh thần này'")
     .replace("relationships:'this relationship situation',home:'this home / family situation'","romantic:'this romantic relationship / dating situation',family:'this family situation',friends:'this friendship / other relationship',home:'this home / living situation'");
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
    if(p==='questions.js')b=patchedQuestions(b);
    if(p==='app-core.js')b=patchedCore(b);
    res.setHeader('content-type',ctype(p));
    res.setHeader('x-qc-version','v8.3.10-area-taxonomy-split');
    res.setHeader('cache-control',p.endsWith('.html')||p.endsWith('.js')?'no-store':'public, max-age=300');
    if(req.method==='HEAD')return res.status(200).end();
    return res.status(200).send(b);
  }catch(e){console.error('v8310_app_error',e?.stack||e);return res.status(500).send('preview_unavailable')}
}
