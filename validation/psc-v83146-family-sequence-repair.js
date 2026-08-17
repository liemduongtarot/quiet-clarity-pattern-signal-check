(function(global){
'use strict';
const parent=global.QCSemanticCoreV15R;if(!parent)throw new Error('V8.3.146 family repair requires route repair');
const VERSION='V8.3.146-BOUNDED-FAMILY-SEQUENCE-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘]/g,"'").toLowerCase().replace(/\s+/g,' ').trim();
const uniq=a=>[...new Set(a||[])],has=(r,s)=>r.test(s);
function repair(raw,base){
 if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
 const doc=fold(raw);let families=uniq(base.families||[]),sequence=!!base.sequence;
 const comparisonOnly=has(/(?:doi chieu|so sanh|compare|cross-check)/,doc)
   && !has(/(?:new evidence|new information|new data|material update|genuine update|real update|updated facts|revised facts|thong tin moi|du lieu moi|so lieu moi|cap nhat that su|ban sua chinh thuc|quy trinh moi).{0,140}(?:adjust|adapt|changed approach|changed course|dieu chinh|doi cach|thich nghi)/,doc)
   && !has(/(?:adjusted|adapted|changed approach|changed course|dieu chinh|doi cach|thich nghi).{0,140}(?:new|updated|revised|evidence|information|data|facts|thong tin|du lieu|so lieu|cap nhat)/,doc);
 if(comparisonOnly&&families.includes('adaptive'))families=families.filter(x=>x!=='adaptive');
 const busyAvoidance=has(/(?:thay vi|instead of|rather than).{0,150}(?:ban minh|kept myself busy|stayed busy|organising old emails|organizing old emails|old emails|viec phu|unrelated work).{0,150}(?:chua phai|khong phai|avoid|not have to|defer|delay|xu ly viec chinh|deal with the main|touch the main)/,doc)
   || has(/(?:ban minh|kept myself busy|stayed busy).{0,120}(?:organising old emails|organizing old emails|old emails|viec phu|unrelated work).{0,120}(?:de chua phai|so i would not have to|so i didn't have to|avoid).{0,90}(?:xu ly|deal with|touch|start)/,doc)
   || has(/(?:kept putting|putting|put).{0,80}(?:aside|to one side).{0,120}(?:then|later|afterward|after that|eventually|finally)/,doc);
 const intentionalNonEngagement=has(/(?:i|toi|minh).{0,40}(?:leave|left|keep|kept|de|bo).{0,55}(?:message|email|notification|tin nhan|thu).{0,45}(?:unopened|unread|chua mo|khong mo).{0,45}(?:on purpose|deliberately|intentionally|co y)/,doc);
 const prematureDecisionBeforeReview=has(/(?:i|toi|minh).{0,35}(?:choose|chose|select|selected|decide|decided|commit|committed|chon|lua chon|quyet dinh|chot).{0,90}(?:before|truoc khi).{0,90}(?:review|reviewing|check|checking|compare|comparing|xem|kiem tra|doi chieu|so sanh).{0,90}(?:relevant details|details|relevant information|information|facts|thong tin lien quan|thong tin|du kien)/,doc);
 if((busyAvoidance||intentionalNonEngagement)&&!families.includes('ignore'))families.push('ignore');
 if(prematureDecisionBeforeReview&&!families.includes('fast'))families.push('fast');
 families=uniq(families);
 const ordered=has(/(?:then|later|afterward|after that|eventually|finally|roi|sau do|roi sau do|cuoi cung)/,doc);
 if(families.length>=2&&ordered)sequence=true;
 const adaptiveOnlyTransition=families.length===1&&families[0]==='adaptive'&&!!base.sequence;
 if(families.length<2&&!adaptiveOnlyTransition)sequence=false;
 if(adaptiveOnlyTransition)sequence=true;
 return{families,sequence};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),r=repair(raw,base);
 return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_146_BOUNDED_REPAIR',v146:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v146-bounded-repair'})};
global.QCSemanticCoreV15=core;global.PSC_V83146=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.146:bounded-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
