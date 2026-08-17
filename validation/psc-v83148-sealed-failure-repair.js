(function(global){
'use strict';
const parent=global.QCSemanticCoreV16;if(!parent)throw new Error('V8.3.148 repair requires V8.3.147');
const VERSION='V8.3.148-V147-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s),uniq=a=>[...new Set(a||[])];
function routeFrame(id,prev){const redirect=['input:safety','input:prediction','input:decision-request','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:safety','input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeOverride(d){
 if(has(/^(?:bao lau nua|bao lau|khi nao|bao gio).{0,45}(?:phong kham|toa|co quan|nguoi|visa|toi).{0,90}(?:gui|xep|duyet|nhan|co|moi)/,d)||has(/^(?:when|how soon|how long).{0,100}\?$/,d))return'input:prediction';
 if(has(/^do i .{1,70} or .{1,70}\?$/,d)||has(/^(?:toi|minh) nen .{1,90} hay .{1,90}\?$/,d)||has(/^(?:theo may|theo ban).{0,35}(?:co nen|nen).{0,120}\?$/,d))return'input:decision-request';
 if(has(/^(?:chi de minh hoa|gia su|in a role-play|in role-play|for illustration|for example|suppose|imagine|case study|the manual|the simulation).{0,240}/,d))return'input:hypothetical-or-example';
 if(has(/(?:neither behaviour is mine|neither behavior is mine|khong phai cua toi|khong phai nguoi send|toi chi describe|toi chi dang mo ta|toi khong hoi ve phan ung cua minh|hanh dong nay la cua .* khong phai cua toi)/,d)
   ||has(/^(?:my cousin|my team lead|my partner|my friend|a friend|nguoi yeu toi|cau toi|anh ho toi|chi toi|ban toi).{0,210}(?:his own|her own|cua anh ay|cua co ay|cua cau ay|don hang cua|booking cua)/,d))return'input:third-party-only';
 if(has(/(?:does not resolve the contradiction|without saying whether|without resolving who|khong name the speaker|khong ro .* nguoi sua|chua noi minh da lam gi|chua neu .* hanh vi|chu the chua duoc xac nhan|khong kem tinh huong cu the)/,d)
   ||has(/(?:hypothetical student|fictional renter|my application).{0,100}(?:without saying whether|without clarifying)/,d))return'input:clarification-required';
 return null;
}
function familyRepair(d,base){
 if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
 let f=uniq(base.families||[]),seq=!!base.sequence;
 const ignore=has(/(?:de bo|bo .* sang mot ben|sang mot ben gan mot tuan|sap xep .* linh tinh).{0,130}(?:chua phai|roi|cuoi cung|mo la thu chinh)/,d);
 const slow=has(/(?:doi chieu cung mot|reread the same|xem lai cung mot|cung mot hoa don).{0,130}(?:nhieu buoi|without fresh data|dung kiem tra cu|ban da sua)/,d);
 const adaptive=has(/(?:ban da sua|corrected|revised|update).{0,100}(?:tinh lai|changed my plan|dieu chinh|doi cach)/,d)||has(/(?:dung kiem tra cu).{0,80}(?:ban moi|ban da sua)/,d);
 const fast=has(/(?:qua nhanh|chot con so qua nhanh|gui bang chung qua nhanh).{0,80}(?:truoc gio hen|gan gio|deadline|sat han)?/,d);
 if(ignore&&!f.includes('ignore'))f.push('ignore');
 if(slow&&!f.includes('slow'))f.unshift('slow');
 if(adaptive&&!f.includes('adaptive'))f.push('adaptive');
 if(fast&&!f.includes('fast'))f.push('fast');
 f=uniq(f);
 if(f.length>=2&&has(/(?:roi|den khi|gan gio|cuoi cung|then|later|when)/,d))seq=true;
 if(f.length<2)seq=false;
 return{families:f,sequence:seq};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeOverride(d);
 if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_148_V147_SEALED_A_REPAIR',v148:{route:rid,families:[],sequence:false}}};}
 const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_148_V147_SEALED_A_REPAIR',v148:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v148-v147-sealed-a-repair'})};
global.QCSemanticCoreV17=core;global.PSC_V83148=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.148:v147-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
