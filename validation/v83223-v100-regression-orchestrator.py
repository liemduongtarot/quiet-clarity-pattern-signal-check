from pathlib import Path
import subprocess,json,zipfile,ast
# Adapt the exact V8.3.222 V99 regression architecture to V100 without changing older semantic files.
src=Path('validation/v83222-v99-regression-orchestrator.py').read_text()
old="'qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js']"
new="'qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js']"
assert old in src
src=src.replace(old,new,1)
src=src.replace('QCSemanticCoreV99','QCSemanticCoreV100')
src=src.replace('V8.3.222 V99 immutable regression','V8.3.223 V100 immutable regression')
src=src.replace('V8_3_222_V99_REGRESSION_RESULTS','V8_3_223_V100_REGRESSION_RESULTS')
src=src.replace("'candidate':'V8.3.222'","'candidate':'V8.3.223'")
src=src.replace("'phase':'v99-regression-v1'","'phase':'v100-regression-v1'")
src=src.replace('V8_3_222_V99_BASE_REGRESSION_RECEIPT','V8_3_223_V100_BASE_REGRESSION_RECEIPT')
# Prevent the adapted parent from claiming the final receipt name.
src=src.replace('V8_3_222_V99_REGRESSION_RECEIPT','V8_3_223_V100_PARENT_REGRESSION_RECEIPT')
exec(compile(src,'v83223-v100-parent-regression-adapted.py','exec'))
parent=json.loads(Path('validation/V8_3_223_V100_PARENT_REGRESSION_RECEIPT.json').read_text())
assert parent['immutable_regression_passed']==1470 and parent['v216_frozen_a_passed']==30 and parent['v219_frozen_a_passed']==30 and parent['v221_frozen_a_passed']==30
# Fetch exact frozen V8.3.222 Batch A first-run result.
subprocess.run(['git','fetch','--depth=1','origin','refs/heads/v83222-v1-sealed-validation:refs/remotes/origin/v83222-v1-sealed-validation'],check=True,stdout=subprocess.DEVNULL)
a=json.loads(subprocess.check_output(['git','show','origin/v83222-v1-sealed-validation:validation/v83222-v1-sealed/V8_3_222_BATCH_A_RESULT_V1.json'],text=True));assert a['total']==30 and a['passed']==11 and a['failed']==19
carrier={'authority':'V8.3.223 immutable carrier from frozen V8.3.222 A','source_run_id':a['run_id'],'cases':[{'case_id':r['case_id'],'surface':r['surface'],'domain':r['domain'],'category':r['category'],'language':r['language'],'expected':r['expected'],'source_first_run_pass':r['pass']} for r in a['results']]}
Path('validation/V8_3_223_V222_A_FROZEN_CARRIER.json').write_text(json.dumps(carrier,ensure_ascii=False,indent=2)+'\n')
archive=Path('PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip');assert archive.exists()
with zipfile.ZipFile(archive) as z:z.extractall('.')
base=Path('validation/run-v83196-full-regression-sweep-v2.cjs').read_text();needle="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];";assert needle in base
# Get V98 extension, then append V5Z/V99 and V5AA/V100.
tree=ast.parse(Path('validation/v83220-v98-regression-orchestrator.py').read_text());ext=None
for node in ast.walk(tree):
 if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='ext' for t in node.targets):ext=ast.literal_eval(node.value);break
assert ext
ext += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js']
base=base.replace(needle,"'psc-v83196-v195-v1-hypothetical-preservation-repair.js',"+','.join(repr(x) for x in ext)+'];',1);marker="const files=fs.readdirSync('validation')";prefix=base.split(marker)[0]
runner=Path('validation/run-v83223-v222-a-regression.cjs');tail=r'''
if(!s.QCEvidenceExtractorV5AA)throw Error('V5AA missing');if(!s.QCSemanticCoreV100)throw Error('V100 missing');const C=JSON.parse(fs.readFileSync('validation/V8_3_223_V222_A_FROZEN_CARRIER.json')).cases;let passed=0;const results=[];for(const c of C){const r=s.QCSemanticCoreV100.analyze(c.surface,c.domain);const a={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};const e={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence};const ok=JSON.stringify(a)===JSON.stringify(e);if(ok)passed++;results.push({case_id:c.case_id,category:c.category,language:c.language,pass:ok,expected:e,actual:a,source_first_run_pass:c.source_first_run_pass});}const out={authority:'V8.3.223 V100 regression of frozen V8.3.222 A',total:30,passed,failed:30-passed,results};fs.writeFileSync('V8_3_223_V222_A_REGRESSION_RESULTS.json',JSON.stringify(out,null,2));console.log('V222 A regression',passed+'/30');if(passed!==30)process.exit(1);
''';runner.write_text(prefix+tail);cp=subprocess.run(['node',str(runner)],text=True);assert cp.returncode==0
r=json.loads(Path('V8_3_223_V222_A_REGRESSION_RESULTS.json').read_text());assert r['passed']==30 and r['failed']==0
receipt={'candidate':'V8.3.223','phase':'v100-bounded-regression','semantic_authority':'QCEvidenceExtractorV5AA -> QCSemanticCoreV100','immutable_regression_total':1470,'immutable_regression_passed':1470,'v216_frozen_a_total':30,'v216_frozen_a_passed':30,'v219_frozen_a_total':30,'v219_frozen_a_passed':30,'v221_frozen_a_total':30,'v221_frozen_a_passed':30,'v222_frozen_a_total':30,'v222_frozen_a_passed':30,'v222_previous_failures_repaired':19,'v222_previous_passes_preserved':11,'v222_sealed_rerun':False,'v221_sealed_rerun':False,'expected_gold_changed':False,'sealed_validation_executed':False,'step_111_authorized':False,'production_authorized':False,'conclusion':'success'}
Path('validation/V8_3_223_V100_REGRESSION_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
