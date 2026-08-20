import pathlib
src=pathlib.Path('validation/run-v83196-full-regression-sweep-v2.cjs').read_text()
src=src.replace("'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];","'psc-v83196-v195-v1-hypothetical-preservation-repair.js','psc-v83197-v196-sealed-a-bounded-repair.js','psc-v83198-v197-sealed-a-bounded-repair.js','psc-v83199-v198-sealed-a-bounded-repair.js','psc-v83200-v199-sealed-a-bounded-repair.js','psc-v83201-v200-sealed-a-bounded-repair.js','psc-v83201-v200-v1-preservation-precedence-repair.js'];")
src=src.replace('QCSemanticCoreV65R','QCSemanticCoreV70R')
head=src.split('const files=',1)[0]
tail=r'''const batch=process.argv[2];if(!['A','B'].includes(batch))throw Error('batch must be A or B');
const root='validation/v83201-v1-sealed',fixture=JSON.parse(fs.readFileSync(path.join(root,'V8_3_201_SEALED_FIXTURE_V1.json'),'utf8')),sel=JSON.parse(fs.readFileSync(path.join(root,'V8_3_201_SEALED_SELECTION_V1.json'),'utf8'));const ids=new Set(batch==='A'?sel.batch_a:sel.batch_b),rows=[];let passed=0;
for(const c of fixture.cases.filter(x=>ids.has(x.case_id))){const r=s.QCSemanticCoreV70R.analyze(c.surface,c.domain),actual={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence},expected={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence},ok=JSON.stringify(actual)===JSON.stringify(expected);if(ok)passed++;rows.push({case_id:c.case_id,surface:c.surface,domain:c.domain,expected,actual,pass:ok});}
const out={candidate:'V8.3.201',batch,first_run_only:true,total:rows.length,passed,failed:rows.length-passed,results:rows};fs.writeFileSync(`V8_3_201_BATCH_${batch}_FIRST_RUN_RESULTS.json`,JSON.stringify(out,null,2));console.log(`Batch ${batch} ${passed}/${rows.length}`);if(passed!==rows.length)process.exit(1);
'''
pathlib.Path('validation/v83201-v1-sealed/run-v201-sealed.cjs').write_text(head+tail)
