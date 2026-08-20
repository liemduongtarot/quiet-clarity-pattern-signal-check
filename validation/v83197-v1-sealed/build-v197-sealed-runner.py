import pathlib
src=pathlib.Path('validation/run-v83196-full-regression-sweep-v2.cjs').read_text()
src=src.replace("'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];","'psc-v83196-v195-v1-hypothetical-preservation-repair.js','psc-v83197-v196-sealed-a-bounded-repair.js'];")
src=src.replace('QCSemanticCoreV65R','QCSemanticCoreV66')
head=src.split('const files=',1)[0]
tail=r'''const batch=process.argv[2];if(!['A','B'].includes(batch))throw Error('batch must be A or B');
const root='validation/v83197-v1-sealed',fixture=JSON.parse(fs.readFileSync(path.join(root,'V8_3_197_SEALED_FIXTURE_V1.json'),'utf8')),sel=JSON.parse(fs.readFileSync(path.join(root,'V8_3_197_SEALED_SELECTION_V1.json'),'utf8'));const ids=new Set(batch==='A'?sel.batch_a:sel.batch_b),rows=[];let passed=0;
for(const c of fixture.cases.filter(x=>ids.has(x.case_id))){const r=s.QCSemanticCoreV66.analyze(c.surface,c.domain),actual={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence},expected={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence},ok=JSON.stringify(actual)===JSON.stringify(expected);if(ok)passed++;rows.push({case_id:c.case_id,surface:c.surface,domain:c.domain,expected,actual,pass:ok});}
const out={candidate:'V8.3.197',batch,first_run_only:true,total:rows.length,passed,failed:rows.length-passed,results:rows};fs.writeFileSync(`V8_3_197_BATCH_${batch}_FIRST_RUN_RESULTS.json`,JSON.stringify(out,null,2));console.log(`Batch ${batch} ${passed}/${rows.length}`);if(passed!==rows.length)process.exit(1);
'''
pathlib.Path('validation/v83197-v1-sealed/run-v197-sealed.cjs').write_text(head+tail)
