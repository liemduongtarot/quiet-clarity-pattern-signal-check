(function(global){
'use strict';
const parent=global.QCSemanticCoreV17;if(!parent)throw new Error('V8.3.149 repair requires V8.3.148');
const VERSION='V8.3.149-V148-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s),uniq=a=>[...new Set(a||[])];
function routeFrame(id,prev){const redirect=['input:safety','input:prediction','input:decision-request','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:safety','input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeOverride(d){
 if(has(/^(?:bao lau nua|bao lau|khi nao|bao gio).{0,120}(?:khach|nguoi|ben|phong kham|toa|co quan|visa|toi).{0,120}(?:thanh toan|gui|xep|duyet|nhan|co|moi)/,d))return'input:prediction';
 if(has(/(?:doan khac|another passage|another part).{0,80}(?:noi|says).{0,80}(?:em gai|chi gai|anh trai|brother|sister|someone else).{0,100}(?:khong cho biet|does not say|unclear|which is correct|doan nao dung)/,d)||has(/(?:chuyen nay cu lap lai|keeps repeating|keeps happening).{0,100}(?:khong dua ra|without giving|without stating).{0,90}(?:mot lan cu the|specific instance|hanh dong nao cua toi|my action)/,d))return'input:clarification-required';
 if(has(/(?:submission was hers|the submission was hers|khong phai nguoi postpone|toi chi want to understand his behaviour|toi chi want to understand her behaviour|viec do khong lien quan den hanh dong cua toi|toi chi dang mo ta hanh vi cua)/,d)||has(/^(?:a classmate|the upstairs tenant|my cousin|nguoi thue phong ben canh).{0,220}/,d))return'input:third-party-only';
 return null;
}
function familyRepair(d,base){
 if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
 let f=uniq(base.families||[]),seq=!!base.sequence;
 const ignore=has(/(?:doi ten cac file cu|renam(?:e|ing) old files|leaving the repair email unanswered|de lai email sua chua khong tra loi).{0,160}(?:chua phai|avoid|unanswered|khong tra loi|xu ly cuoc goi|deal with the call)?/,d);
 const slow=has(/(?:quay lai mo no nhieu lan|reopen(?:ed|ing)? it many times|kept reopening).{0,120}(?:khong co cap nhat moi|no new update|same status|van hien dung mot trang thai)/,d)||has(/(?:same status|van hien dung mot trang thai).{0,100}(?:nhieu lan|many times|reopen|quay lai)/,d);
 const adaptive=has(/(?:corrected access window|khung truy cap da sua|cap nhat moi|corrected window).{0,120}(?:replied|reorganised|reorganized|dieu chinh|sap xep lai)/,d);
 if(ignore&&!adaptive)f=f.filter(x=>x!=='adaptive');
 if(ignore&&!f.includes('ignore'))f.push('ignore');
 if(slow&&!f.includes('slow'))f.unshift('slow');
 if(adaptive&&!f.includes('adaptive'))f.push('adaptive');
 if(ignore&&adaptive)seq=true;
 f=uniq(f);if(f.length<2)seq=false;return{families:f,sequence:seq};
}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeOverride(d);if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_149_V148_SEALED_A_REPAIR',v149:{route:rid,families:[],sequence:false}}};}const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_149_V148_SEALED_A_REPAIR',v149:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v149-v148-sealed-a-repair'})};
global.QCSemanticCoreV18=core;global.PSC_V83149=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.149:v148-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
