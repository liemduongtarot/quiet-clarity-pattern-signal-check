const fs=require('fs'),path=require('path'),vm=require('vm'),cp=require('child_process');
const root=process.cwd();
function load(p){const code=fs.readFileSync(p,'utf8');vm.runInThisContext(code,{filename:p});}
function normResult(r){return {route:r.input_route&&r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function jaccard(a,b){const A=new Set(String(a).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean)),B=new Set(String(b).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean));if(!A.size&&!B.size)return 1;let i=0;for(const x of A)if(B.has(x))i++;return i/(A.size+B.size-i);}

const chain=[
'psc-v83196-v195-v1-hypothetical-preservation-repair.js','psc-v83197-v196-sealed-a-bounded-repair.js','psc-v83198-v197-sealed-a-bounded-repair.js','psc-v83199-v198-sealed-a-bounded-repair.js','psc-v83200-v199-sealed-a-bounded-repair.js','psc-v83201-v200-sealed-a-bounded-repair.js','psc-v83201-v200-v1-preservation-precedence-repair.js','psc-v83202-v201-sealed-a-bounded-repair.js','psc-v83203-v202-sealed-a-bounded-repair.js','psc-v83204-v203-sealed-a-bounded-repair.js','psc-v83205-v204-sealed-a-bounded-repair.js','psc-v83206-v205-compositional-generalization.js','psc-v83206-v205-v1-preservation-repair.js','psc-v83207-v206-mechanism-cue-repair.js','psc-v83207-v206-v1-preservation-repair.js','psc-v83208-v207-mechanism-cue-repair.js','psc-v83208-v207-v1-preservation-repair.js','psc-v83209-v208-evidence-slot-composition.js','psc-v83209-v208-v1-preservation-repair.js'];
for(const f of chain)load(path.join('validation',f));
load('validation/qc-evidence-extractor-v1-review-candidate.js');
if(!globalThis.QCSemanticCoreV78R)throw new Error('QCSemanticCoreV78R missing');
if(!globalThis.QCEvidenceExtractorV1)throw new Error('QCEvidenceExtractorV1 missing');
const challenge=JSON.parse(fs.readFileSync('validation/V8_3_209_DEVELOPMENT_GENERALIZATION_CHALLENGE_V1.json','utf8'));

let extractionPass=0,classPass=0;const rows=[];const byMech={};const byLang={};const attribution={extraction_failure:0,classification_or_precedence_failure:0,pass:0};
for(const c of challenge.cases){
  const slots=globalThis.QCEvidenceExtractorV1.extract(c.surface);const missing=c.expected_slots.filter(k=>!slots[k]);const eok=missing.length===0;
  const actual=normResult(globalThis.QCSemanticCoreV78R.analyze(c.surface,c.domain));const exp={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence};const cok=same(actual,exp);
  if(eok)extractionPass++;if(cok)classPass++;
  const attr=cok?'pass':(!eok?'extraction_failure':'classification_or_precedence_failure');attribution[attr]++;
  const r={case_id:c.case_id,mechanism:c.mechanism,language:c.language,variant:c.variant,domain:c.domain,extraction_pass:eok,missing_slots:missing,classification_pass:cok,expected:exp,actual,attribution:attr,surface:c.surface};rows.push(r);
  for(const [bucket,key] of [[byMech,c.mechanism],[byLang,c.language]]){bucket[key]=bucket[key]||{total:0,extract_pass:0,class_pass:0};bucket[key].total++;if(eok)bucket[key].extract_pass++;if(cok)bucket[key].class_pass++;}
}
for(const o of [byMech,byLang])for(const k of Object.keys(o)){const v=o[k];v.extraction_rate=v.extract_pass/v.total;v.classification_rate=v.class_pass/v.total;}

// Independence audit against materialized historical regression JSONs plus fetched sealed fixtures copied into validation/generalization_refs.
const refs=[];
function collect(x){if(Array.isArray(x)){for(const v of x)collect(v);return;}if(!x||typeof x!=='object')return;if(typeof x.surface==='string')refs.push(x.surface);for(const v of Object.values(x))if(v&&typeof v==='object')collect(v);}
for(const dir of ['validation','validation/generalization_refs']){
 if(!fs.existsSync(dir))continue;
 for(const f of fs.readdirSync(dir)){
  if(!f.endsWith('.json'))continue;if(f.includes('GENERALIZATION_CHALLENGE'))continue;
  try{collect(JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')))}catch{}
 }
}
let maxSim=0,over75=0,maxPair=null;for(const c of challenge.cases){for(const r of refs){const s=jaccard(c.surface,r);if(s>maxSim){maxSim=s;maxPair={case_id:c.case_id,reference:r,similarity:s};}if(s>=0.75){over75++;break;}}}
const rates=Object.values(byMech).map(v=>v.classification_rate),langRates=Object.values(byLang).map(v=>v.classification_rate);const en=byLang.EN?.classification_rate||0,vi=byLang.VI?.classification_rate||0;
const passCriteria={overall_classification:classPass/challenge.cases.length>=0.95,mechanism_floor:Math.min(...rates)>=0.90,en_vi_gap:Math.abs(en-vi)<=0.05,independence:over75===0};
const pass=Object.values(passCriteria).every(Boolean);
const out={authority:'V8.3.209 DEVELOPMENT-ONLY GENERALIZATION AUDIT V1',semantic_authority:'QCSemanticCoreV78R',extractor:'QCEvidenceExtractorV1-REVIEW-CANDIDATE',sealed_eligible:false,total:challenge.cases.length,extraction_passed:extractionPass,extraction_failed:challenge.cases.length-extractionPass,extraction_rate:extractionPass/challenge.cases.length,classification_passed:classPass,classification_failed:challenge.cases.length-classPass,classification_rate:classPass/challenge.cases.length,by_mechanism:byMech,by_language:byLang,failure_attribution:attribution,independence:{reference_surfaces:refs.length,max_jaccard_similarity:maxSim,cases_at_or_above_0_75:over75,max_pair:maxPair},pass_criteria:passCriteria,pass,results:rows};
fs.writeFileSync('V8_3_209_DEVELOPMENT_GENERALIZATION_RESULTS_V1.json',JSON.stringify(out,null,2));
console.log('GENERALIZATION',classPass+'/'+challenge.cases.length,'EXTRACTION',extractionPass+'/'+challenge.cases.length,'PASS',pass);console.log('ATTRIBUTION',attribution);console.log('INDEPENDENCE max',maxSim,'>=.75 cases',over75,'refs',refs.length);console.log('MECH',JSON.stringify(byMech));console.log('LANG',JSON.stringify(byLang));
if(!pass)process.exit(1);
