(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5U;if(!parent)throw new Error('V5U2 requires V5U');
const VERSION='QCEvidenceExtractorV5U2-V214-CLARIFICATION-CONTAINMENT';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};
 const enClosed=any(d,['before it closed','before the event closed','before it ended']);
 const viClar=any(d,['nuoc di nhin thay duoc cua toi','hanh dong nhin thay duoc cua toi'])&&any(d,['chua duoc xac dinh','van chua duoc xac dinh'])&&any(d,['luc khep lai','tai luc khep lai']);
 if(enClosed)o.endpoint_present=true;
 if(viClar){o.self_owned_action=true;o.action_missing=true;o.endpoint_present=true;}
 const strongClar=!!(o.self_owned_action&&o.action_missing&&o.endpoint_present);
 const explicitConstruct=any(d,['classifier testing','system test','validation input','synthetic','fabricated','invented','made up','fictional case','bịa','bia','hu cau','hư cấu','classifier','system test','validation']);
 // Contain inherited hypothetical false positives only when strong lived clarification evidence exists and no explicit construction/test cue is present.
 if(strongClar&&!explicitConstruct){o.constructed_input=false;o.test_or_practice_context=false;o.non_lived_explicit=false;}
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5U2=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
