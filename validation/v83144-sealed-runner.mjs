import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const batchName=(process.argv[2]||'').toUpperCase();
if(!['A','B'].includes(batchName)) throw new Error('Usage: node v83144-sealed-runner.mjs A|B');
const root=process.cwd();
const goldDoc=JSON.parse(fs.readFileSync(path.join(root,'validation','V8_3_144_SEALED_POOL_GOLD.json'),'utf8'));
const batchDoc=JSON.parse(fs.readFileSync(path.join(root,'validation',`V8_3_144_SEALED_BATCH_${batchName}_30.json`),'utf8'));
if(goldDoc.classification!=='IMMUTABLE_GOLD_LOCKED_BEFORE_EXECUTION') throw new Error('Gold classification mismatch');
if(batchDoc.classification!=='SEALED_FIRST_RUN_MEMBERSHIP') throw new Error('Batch classification mismatch');
if(batchDoc.execution_count!==0) throw new Error('Batch execution_count is not zero in sealed input');
if(batchDoc.cases.length!==30) throw new Error(`Batch ${batchName} must contain 30 cases`);

const gold=new Map(goldDoc.cases.map(c=>[c.case_id,c]));
const sandbox={console}; vm.createContext(sandbox);
const files=[
'psc-v3.js','psc-v4.js','psc-v83121-r1-reconstructed.js','psc-v83122-operator-aware.js','psc-v83123-family-preservation.js','psc-v83124-operator-context.js','psc-v83125-semantic-routing.js','psc-v83126-public-route-canonicalization.js','psc-v83127-review-intent-authority.js','psc-v83129-canonical-shadow.js','psc-v83130-representation-coverage.js','psc-v83131-proposition-consolidation.js','psc-v83132-relation-graph.js','psc-v83133-canonical-role-binding.js','psc-v83135-scoped-operator.js','psc-v83138-semantic-convergence.js','psc-v83139-semantic-convergence.js','psc-v83142-sealed-failure-convergence.js','psc-v83143-semantic-convergence.js','psc-v83144-sealed-failure-convergence.js'
];
for(const f of files){
  const p=path.join(root,'PSC_V8_3_138_DEV','public',f);
  if(!fs.existsSync(p)) throw new Error(`Missing authority file ${p}`);
  vm.runInContext(fs.readFileSync(p,'utf8'),sandbox,{filename:f});
}
if(!sandbox.QCSemanticCoreV13) throw new Error('QCSemanticCoreV13 unavailable');
if(sandbox.QCSemanticCoreV13.version!=='V8.3.144-SEALED-A-FAILURE-CONVERGENCE') throw new Error(`Unexpected authority ${sandbox.QCSemanticCoreV13.version}`);

const results=[];
for(const c of batchDoc.cases){
  const g=gold.get(c.case_id); if(!g) throw new Error(`Missing gold for ${c.case_id}`);
  if(g.raw_input!==c.raw_input) throw new Error(`Raw input drift ${c.case_id}`);
  const r=sandbox.QCSemanticCoreV13.analyze(c.raw_input);
  const actual={route:r.input_route?.id||null,families:Array.from(r.families||[]).sort(),sequence:!!r.sequence,authority:r.version};
  const expected={route:g.expected_route,families:Array.from(g.expected_families||[]).sort(),sequence:!!g.expected_sequence};
  const routePass=actual.route===expected.route;
  const familyPass=JSON.stringify(actual.families)===JSON.stringify(expected.families);
  const sequencePass=actual.sequence===expected.sequence;
  results.push({case_id:c.case_id,raw_input:c.raw_input,expected,actual,routePass,familyPass,sequencePass,pass:routePass&&familyPass&&sequencePass});
}
const failed=results.filter(r=>!r.pass);
const summary={candidate:'V8.3.144',batch:batchName,run:'first-run',execution_count:1,total:results.length,passed:results.length-failed.length,failed:failed.length,status:failed.length?'FAIL':'PASS',batch_b_authorized:batchName==='A'&&failed.length===0,step_111_executed:false};
fs.writeFileSync(path.join(root,`V8_3_144_BATCH_${batchName}_FIRST_RUN_CASE_LEVEL.json`),JSON.stringify({summary,results},null,2));
fs.writeFileSync(path.join(root,`V8_3_144_BATCH_${batchName}_FIRST_RUN_SUMMARY.json`),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary));
if(failed.length){
  console.error(`V8.3.144 Batch ${batchName} first-run FAILED`, failed.map(x=>x.case_id));
  process.exit(1);
}
console.log(`V8.3.144 Batch ${batchName} first-run PASS ${results.length}/${results.length}`);
