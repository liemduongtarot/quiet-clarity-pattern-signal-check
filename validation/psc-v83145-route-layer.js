(function(global){
'use strict';
const parent=global.QCSemanticCoreV13;if(!parent)throw new Error('V8.3.145 route layer requires V8.3.144');
const VERSION='V8.3.145-ROUTE-LAYER';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘]/g,"'").toLowerCase().replace(/\s+/g,' ').trim();
const uniq=a=>[...new Set(a||[])]; const has=(r,s)=>r.test(s);
function classifyRoute(doc,base){
 const bid=base.input_route?.id||'input:clarification-required';
 if(bid==='input:safety')return bid;
 const selfReality=has(/(?:in my real case|my real action|my actual|my own application|my own form|i actually|i started and finished|toi da|thuc te toi|con toi).{0,150}(?:normally|normal|on time|on schedule|timely|by the deadline|dung thoi gian|dung han|dung luc|completed|submitted|handled|compared|reviewed once|xu ly|nop)/,doc);
 const directPrediction=has(/^(?:when will|what date will|will .{0,80}(?:next week|tomorrow|later|contact|reply|approve|send)|how soon will|what time will|khi nao|bao gio|may gio|ngay nao)/,doc);
 const directDecision=has(/^(?:should i|would it be better for me to|which option should i choose|nen (?:toi|minh)|toi co nen|minh co nen)/,doc);
 if(directPrediction&&!selfReality)return'input:prediction';
 if(directDecision)return'input:decision-request';
 if(selfReality)return'input:self-lived';
 const hypotheticalOnly=has(/(?:^|\b)(?:for example|suppose|imagine|for illustration|as a hypothetical|hypothetical|conditional|if a person|if someone|if an applicant|if a user|gia su|vi du|neu mot nguoi).{0,220}(?:example|illustrat|scenario|hypothetical|would be|could|might|not a real case|no real person|only an example|chi la vi du|gia dinh)/,doc)
   || has(/(?:training material|worksheet|document|quoted example).{0,140}(?:suppose|imagine|hypothetical|example|describes someone).{0,170}(?:no real person|not a real case|only an example|hypothetical content|no actual behaviour|it is not a real case)/,doc);
 if(hypotheticalOnly)return'input:hypothetical-or-example';
 const thirdPartyActor=has(/(?:my friend|a friend|my colleague|a colleague|my sister|my brother|my neighbour|neighbor|ban toi|dong nghiep|chi toi|anh toi|em toi).{0,140}(?:her own|his own|their own|she |he |co ay|anh ay|own |keeps? |repeatedly |said |wrote |told me)/,doc);
 const thirdPartyDisavow=has(/(?:not me|not mine|not my behavio(?:u)?r|not asking about any behavio(?:u)?r of mine|not asking about any action of mine|not describing myself|not describing my behavio(?:u)?r|not describing an action of mine|this question is about him, not me|none of this is about an action of mine|i am not the actor|i am only reporting|i am reporting his account|only reporting|only repeating|quoting her|quoted behaviour is his|belongs to (?:her|him|my colleague|my sister)|none of that is my behaviour|this is his behaviour|this is her statement|khong phai toi|toi chi lap lai|toi chi ke lai)/,doc);
 if(thirdPartyActor&&thirdPartyDisavow)return'input:third-party-only';
 const ownershipAmbiguous=has(/(?:both me and|me and another person|me and someone else|name me and another person|contradictory ownership|ownership (?:remains|is) unresolved|actor is unclear|source of the behaviour.{0,50}(?:no resolution|unresolved)|alternates between me and another person)/,doc)
   || has(/(?:someone|somebody|a person|unnamed person|the applicant).{0,120}(?:actor is not named|never identifies who|without naming|does not identify|not identified|unspecified|ownership is unresolved|without establishing whether that means me)/,doc)
   || has(/(?:does not say who|does not say whether .{0,80}(?:i|me|toi).{0,30}(?:or|hay)|does not clarify who actually did it|unclear who|does not identify the checker|person who .{0,35} is unspecified|leaves the person responsible unclear|ownership of the behaviour is unresolved)/,doc)
   || has(/(?:problem|stressful|trouble|issue repeats|affected by the situation).{0,140}(?:have not said what i actually do|no specific response|action i take is not specified|does not say how i respond|behavio(?:u)?ral response remains unclear)/,doc);
 if(ownershipAmbiguous)return'input:clarification-required';
 const historicalResolvedRoute=has(/(?:belonged to the past|old issue|previously|used to|months ago|last year|thuoc ve giai doan truoc|giai doan truoc|truoc day|truoc do).{0,150}(?:stopped|ended|ceased|no longer|not happening now|da dung|khong con|dung hoan toan)/,doc);
 const selfNoActionRoute=has(/(?:only an emotional reaction|no behavioural response|no action pattern|no action is being described|khong co hanh dong|khong co phan ung)/,doc);
 if(historicalResolvedRoute||selfNoActionRoute)return'input:self-lived';
 if(has(/^(?:the|my) .{0,50}(?:was delayed|was changed|was reopened|was checked repeatedly|was rushed).{0,100}(?:does not say who|actor responsible|unclear who|does not identify|unspecified)/,doc))return'input:clarification-required';
 const implicitSequenceSelf=has(/(?:the sequence was clear|the sequence moved from|chuoi phan ung la).{0,180}(?:freeze|stuck|repeated review|overcheck|avoidance|rush|standing|kiem tra|voi|ne|tri hoan)/,doc);
 if(implicitSequenceSelf)return'input:self-lived';
 const self=has(/\b(?:i|me|my|mine|myself|toi|minh|cua toi)\b/,doc);
 if(self)return'input:self-lived';
 if(thirdPartyActor)return'input:third-party-only';
 return bid;
}
function routeFrame(id,prev){const redirect=['input:safety','input:prediction','input:decision-request','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:safety','input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),doc=fold(raw),routeId=classifyRoute(doc,base),input_route=routeFrame(routeId,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route};global.QCSemanticCoreV14R=core;global.PSC_V83145_ROUTE=core;
})(typeof globalThis!=='undefined'?globalThis:this);
