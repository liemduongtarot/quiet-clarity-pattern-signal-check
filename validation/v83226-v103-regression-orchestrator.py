from pathlib import Path
import subprocess,json,zipfile,ast
# Preserve the proven V225 regression architecture, append V5AD/V103 only.
src=Path('validation/v83225-v102-regression-orchestrator.py').read_text()
old="'qc-evidence-extractor-v5ac-v225-residual-composition.js','psc-v83225-v224-v102-residual-composition.js']"
new="'qc-evidence-extractor-v5ac-v225-residual-composition.js','psc-v83225-v224-v102-residual-composition.js','qc-evidence-extractor-v5ad-v226-full-input-witness.js','psc-v83226-v225-v103-full-input-witness.js']"
assert old in src
src=src.replace(old,new,1)
needle="ext += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js','qc-evidence-extractor-v5ac-v225-residual-composition.js','psc-v83225-v224-v102-residual-composition.js']"
replacement="ext += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js','qc-evidence-extractor-v5ac-v225-residual-composition.js','psc-v83225-v224-v102-residual-composition.js','qc-evidence-extractor-v5ad-v226-full-input-witness.js','psc-v83226-v225-v103-full-input-witness.js']"
assert needle in src
src=src.replace(needle,replacement,1)
src=src.replace('QCSemanticCoreV102','QCSemanticCoreV103').replace('QCEvidenceExtractorV5AC','QCEvidenceExtractorV5AD')
src=src.replace("Path('validation/V8_3_225_V102_REGRESSION_RECEIPT.json')","Path('validation/V8_3_226_V103_PARENT_PRESERVATION_RECEIPT.json')")
exec(compile(src,'v83226-v103-parent-preservation-adapted.py','exec'))
parent=json.loads(Path('validation/V8_3_226_V103_PARENT_PRESERVATION_RECEIPT.json').read_text())
assert parent['immutable_regression_passed']==1470 and parent['v216_frozen_a_passed']==30
for k in ['v219_frozen_a_passed','v221_frozen_a_passed','v222_frozen_a_passed','v223_frozen_a_passed','v224_frozen_a_passed']:assert parent[k]==30,k
# Freeze exact V8.3.225 Batch A first-run evidence as DEVELOPMENT regression carrier.
subprocess.run(['git','fetch','--depth=1','origin','refs/heads/v83225-v1-sealed-validation:refs/remotes/origin/v83225-v1-sealed-validation'],check=True,stdout=subprocess.DEVNULL)
a=json.loads(subprocess.check_output(['git','show','origin/v83225-v1-sealed-validation:validation/v83225-v1-sealed/V8_3_225_BATCH_A_RESULT_V1.json'],text=True));assert a['total']==30 and a['passed']==19 and a['failed']==11
carrier={'authority':'V8.3.226 immutable carrier from frozen V8.3.225 A','source_run_id':a['run_id'],'cases':[{'case_id':r['case_id'],'surface':r['surface'],'domain':r['domain'],'category':r['category'],'language':r['language'],'expected':r['expected'],'source_first_run_pass':r['pass']} for r in a['results']]}
Path('validation/V8_3_226_V225_A_FROZEN_CARRIER.json').write_text(json.dumps(carrier,ensure_ascii=False,indent=2)+'\n')
# Materialize exact runtime chain through V103 and test frozen V225 A.
archive=Path('PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip');assert archive.exists()
with zipfile.ZipFile(archive) as z:z.extractall('.')
base=Path('validation/run-v83196-full-regression-sweep-v2.cjs').read_text();needle2="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];";assert needle2 in base
tree=ast.parse(Path('validation/v83220-v98-regression-orchestrator.py').read_text());ext=None
for node in ast.walk(tree):
 if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='ext' for t in node.targets):ext=ast.literal_eval(node.value);break
assert ext
ext += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js','qc-evidence-extractor-v5ac-v225-residual-composition.js','psc-v83225-v224-v102-residual-composition.js','qc-evidence-extractor-v5ad-v226-full-input-witness.js','psc-v83226-v225-v103-full-input-witness.js']
base=base.replace(needle2,"'psc-v83196-v195-v1-hypothetical-preservation-repair.js',"+','.join(repr(x) for x in ext)+'];',1);marker="const files=fs.readdirSync('validation')";prefix=base.split(marker)[0]
runner=Path('validation/run-v83226-v225-a-regression.cjs');tail=r'''
if(!s.QCEvidenceExtractorV5AD)throw Error('V5AD missing');if(!s.QCSemanticCoreV103)throw Error('V103 missing');const C=JSON.parse(fs.readFileSync('validation/V8_3_226_V225_A_FROZEN_CARRIER.json')).cases;let passed=0;const results=[];for(const c of C){const r=s.QCSemanticCoreV103.analyze(c.surface,c.domain);const actual={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};const expected={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence};const ok=JSON.stringify(actual)===JSON.stringify(expected);if(ok)passed++;results.push({case_id:c.case_id,category:c.category,language:c.language,pass:ok,expected,actual,source_first_run_pass:c.source_first_run_pass});}const out={authority:'V8.3.226 V103 regression of frozen V8.3.225 A',total:30,passed,failed:30-passed,results};fs.writeFileSync('V8_3_226_V225_A_REGRESSION_RESULTS.json',JSON.stringify(out,null,2));console.log('V225 A regression',passed+'/30');if(passed!==30)process.exit(1);
''';runner.write_text(prefix+tail);cp=subprocess.run(['node',str(runner)],text=True);assert cp.returncode==0
r=json.loads(Path('V8_3_226_V225_A_REGRESSION_RESULTS.json').read_text());assert r['passed']==30 and r['failed']==0
repaired=sum(1 for x in r['results'] if (not x['source_first_run_pass']) and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass'])
assert repaired==11 and preserved==19
for cat in ['hypothetical','prediction','neutral']:
 xs=[x for x in r['results'] if x['category']==cat];assert len(xs)==3 and all(x['pass'] for x in xs),cat
receipt={'candidate':'V8.3.226','phase':'v103-bounded-regression','semantic_authority':'QCEvidenceExtractorV5AD -> QCSemanticCoreV103','immutable_regression_total':1470,'immutable_regression_passed':1470,'v216_frozen_a_total':30,'v216_frozen_a_passed':30,'v219_frozen_a_total':30,'v219_frozen_a_passed':30,'v221_frozen_a_total':30,'v221_frozen_a_passed':30,'v222_frozen_a_total':30,'v222_frozen_a_passed':30,'v223_frozen_a_total':30,'v223_frozen_a_passed':30,'v224_frozen_a_total':30,'v224_frozen_a_passed':30,'v225_frozen_a_total':30,'v225_frozen_a_passed':30,'v225_previous_failures_repaired':11,'v225_previous_passes_preserved':19,'hypothetical_preserved':3,'prediction_preserved':3,'neutral_preserved':3,'v225_sealed_rerun':False,'v224_sealed_rerun':False,'v223_sealed_rerun':False,'v222_sealed_rerun':False,'v221_sealed_rerun':False,'v220_sealed_rerun':False,'v219_sealed_rerun':False,'expected_gold_changed':False,'sealed_validation_executed':False,'step_111_authorized':False,'production_authorized':False,'conclusion':'success'}
Path('validation/V8_3_226_V103_REGRESSION_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
