(function(global){
'use strict';
const parent=global.QCSemanticCoreV15;if(!parent)throw new Error('V8.3.147 repair requires V8.3.146');
const VERSION='V8.3.147-V146-V3-SEALED-FAILURE-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s),uniq=a=>[...new Set(a||[])];
function routeFrame(id,prev){
 const redirect=['input:safety','input:prediction','input:decision-request','input:hypothetical-or-example'].includes(id);
 const clarify=['input:third-party-only','input:clarification-required'].includes(id);
 return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:safety','input:prediction','input:decision-request'].includes(id),must_redirect:redirect};
}
function prediction(doc){
 return has(/^(?:mat bao lau|bao lau|khi nao|bao gio).{0,45}(?:toi|minh).{0,55}(?:moi\s+)?(?:nhan duoc|co duoc|duoc).{0,90}\??$/,doc)
 || has(/^(?:how long|when|how soon).{0,55}(?:will i|do i|until i).{0,90}\??$/,doc);
}
function decision(doc){
 return has(/^(?:toi|minh)\s+nen\s+.{1,100}\s+hay\s+.{1,100}\??$/,doc)
 || has(/^(?:theo may|theo ban|noi thang giup toi|noi thang voi toi).{0,45}(?:toi\s+)?(?:co\s+nen|nen).{1,130}(?:khong|hay).{0,90}\??$/,doc)
 || has(/^(?:should i|tell me straight|which should i choose).{1,150}(?:\bor\b|between).{1,100}\??$/,doc);
}
function hypothetical(doc){
 return has(/^(?:consider an abstract case|consider a hypothetical|for illustration|for example|suppose|imagine).{0,220}/,doc)
 || has(/(?:worksheet|role[- ]?play|training example|vi du|tinh huong gia dinh).{0,55}(?:gia dinh|someone|a person|mot nguoi|nguoi).{0,180}/,doc);
}
function thirdParty(doc){
 return has(/(?:neither action is mine|none of (?:that|it) is my action|this is not my action|i am only describing (?:her|his|their) behaviour|i am only describing (?:her|his|their) behavior)/,doc)
 || has(/(?:day khong phai viec toi lam|day khong phai hanh vi cua toi|toi chi dang mo ta hanh vi cua (?:co ay|anh ay|ho)|nguoi (?:submit|gui|nop) khong phai toi|toi chi hoi ve (?:client|nguoi|co ay|anh ay) do)/,doc)
 || has(/^(?:my sister|my brother|my colleague|a colleague|a teammate|my teammate|a client|my client|dong nghiep cua toi|ban toi|chi toi|anh toi).{0,190}(?:her own|his own|their own|cua co ay|cua anh ay).{0,120}/,doc);
}
function clarification(doc){
 return has(/(?:never says|does not say|doesn't say|unclear).{0,55}(?:whether|if).{0,80}(?:i|me|my).{0,40}(?:or|hay).{0,60}(?:flatmate|colleague|someone else|another person|nguoi khac)/,doc)
 || has(/(?:khong co thong tin|khong ro|chua ro).{0,60}(?:ai dang noi|ai noi|nguoi noi|chu the).{0,80}/,doc)
 || has(/(?:chua neu|khong neu|not stated|unspecified).{0,55}(?:behavioural response|behavioral response|phan ung hanh vi|hanh vi|action).{0,80}(?:cu the|specific|ro rang)?/,doc)
 || has(/(?:feel overwhelmed|cam thay qua tai|cam thay ap luc).{0,80}(?:but|nhung).{0,90}(?:behavioural response|behavioral response|hanh vi|phan ung).{0,50}(?:not stated|unspecified|chua neu|khong neu)/,doc);
}
function routeOverride(doc){
 if(prediction(doc))return'input:prediction';
 if(decision(doc))return'input:decision-request';
 if(hypothetical(doc))return'input:hypothetical-or-example';
 if(thirdParty(doc))return'input:third-party-only';
 if(clarification(doc))return'input:clarification-required';
 return null;
}
function familyRepair(doc,base){
 let families=uniq(base.families||[]),sequence=!!base.sequence;
 if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
 const hoverFreeze=has(/(?:reasonable|hop ly).{0,45}(?:dates|options|choices|lua chon|phuong an).{0,70}(?:available|co san|dang co).{0,80}(?:hovering between|going back and forth|luong lu|qua lai).{0,100}(?:without choosing|without picking|khong chon|chua chon).{0,45}(?:first step|buoc dau|buoc dau tien)/,doc);
 const instantAgree=has(/(?:con|still have|there (?:are|is) still).{0,45}(?:ngay|days?|time).{0,85}(?:doc|read|review|xem).{0,90}(?:bam dong y ngay|dong y ngay|clicked agree immediately|accepted immediately|confirmed immediately).{0,100}(?:xong cho nhanh|get it over with|finish quickly|done quickly)/,doc);
 const loopSlow=has(/(?:loop over|looping over|kept looping over|lap di lap lai|xem di xem lai).{0,90}(?:same|cung|tax figures|figures|numbers|so lieu).{0,70}(?:may ngay|nhieu ngay|for days|several days)/,doc);
 const deadlineFast=has(/(?:sat deadline|near the deadline|right before the deadline|sat han|gan han).{0,70}(?:submit|send|confirm|nop|gui).{0,80}(?:qua voi|too fast|too quickly|voi)/,doc);
 if(hoverFreeze&&!families.includes('freeze'))families.unshift('freeze');
 if(instantAgree&&!families.includes('fast'))families.push('fast');
 if(loopSlow&&!families.includes('slow'))families.unshift('slow');
 if(deadlineFast&&!families.includes('fast'))families.push('fast');
 families=uniq(families);
 if(families.length>=2&&has(/(?:then|later|eventually|roi|sau do|sat deadline|sat han)/,doc))sequence=true;
 if(families.length<2)sequence=false;
 return{families,sequence};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),doc=fold(raw),rid=routeOverride(doc);
 if(rid){
   const input_route=routeFrame(rid,base.input_route);
   return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_147_V146_V3_SEALED_FAILURE_REPAIR',v147:{route:rid,families:[],sequence:false}}};
 }
 const r=familyRepair(doc,base);
 return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_147_V146_V3_SEALED_FAILURE_REPAIR',v147:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v147-v146-v3-sealed-failure-repair'})};
global.QCSemanticCoreV16=core;global.PSC_V83147=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.147:v146-v3-sealed-failure-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
