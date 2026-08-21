from pathlib import Path
import subprocess,json,zipfile,ast
# V8.3.225 DEVELOPMENT regression: preserve proven V224 architecture, append V5AC/V102 only.
src=Path('validation/v83224-v101-regression-orchestrator.py').read_text()
old="'qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js']"
new="'qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js','qc-evidence-extractor-v5ac-v225-residual-composition.js','psc-v83225-v224-v102-residual-composition.js']"
assert old in src
src=src.replace(old,new,1)
src=src.replace('QCSemanticCoreV101','QCSemanticCoreV102')
src=src.replace('QCEvidenceExtractorV5AB','QCEvidenceExtractorV5AC')
src=src.replace('V8.3.224 V101 immutable regression','V8.3.225 V102 immutable regression')
src=src.replace('V8_3_224_V101_BASE_REGRESSION_RESULTS','V8_3_225_V102_BASE_REGRESSION_RESULTS')
src=src.replace("'candidate':'V8.3.224'","'candidate':'V8.3.225'")
src=src.replace("'phase':'v101-regression-base'","'phase':'v102-regression-base'")
src=src.replace('V8_3_224_V101_BASE_REGRESSION_RECEIPT','V8_3_225_V102_BASE_REGRESSION_RECEIPT')
# Keep historical prior-carrier filenames and labels distinct from the final V225 receipt.
src=src.replace("carrier={'authority':f'V8.3.224 immutable carrier from frozen V8.3.{v} A'","carrier={'authority':f'V8.3.225 immutable carrier from frozen V8.3.{v} A'")
src=src.replace("Path(f'validation/V8_3_224_V{v}_A_FROZEN_CARRIER.json')","Path(f'validation/V8_3_225_V{v}_A_FROZEN_CARRIER.json')")
src=src.replace("const path=`validation/V8_3_224_V${v}_A_FROZEN_CARRIER.json`","const path=`validation/V8_3_225_V${v}_A_FROZEN_CARRIER.json`")
src=src.replace("V8.3.224 V101 regression of frozen V8.3.${v} A","V8.3.225 V102 regression of frozen V8.3.${v} A")
src=src.replace("V8_3_224_V${v}_A_REGRESSION_RESULTS.json","V8_3_225_V${v}_A_REGRESSION_RESULTS.json")
src=src.replace("Path(f'V8_3_224_V{v}_A_REGRESSION_RESULTS.json')","Path(f'V8_3_225_V{v}_A_REGRESSION_RESULTS.json')")
src=src.replace("'candidate':'V8.3.224','phase':'v101-bounded-regression','semantic_authority':'QCEvidenceExtractorV5AC -> QCSemanticCoreV102'","'candidate':'V8.3.225','phase':'v102-parent-preservation','semantic_authority':'QCEvidenceExtractorV5AC -> QCSemanticCoreV102'")
src=src.replace("Path('validation/V8_3_224_V101_REGRESSION_RECEIPT.json')","Path('validation/V8_3_225_V102_PARENT_PRESERVATION_RECEIPT.json')")
# The proven V224 architecture must actually append V5AC/V102 in its runtime extension list too.
needle="ext += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js']"
replacement="ext += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js','qc-evidence-extractor-v5ac-v225-residual-composition.js','psc-v83225-v224-v102-residual-composition.js']"
assert needle in src
src=src.replace(needle,replacement,1)
exec(compile(src,'v83225-v102-parent-preservation-adapted.py','exec'))
parent=json.loads(Path('validation/V8_3_225_V102_PARENT_PRESERVATION_RECEIPT.json').read_text())
assert parent['immutable_regression_passed']==1470
assert parent['v216_frozen_a_passed']==30
for k in ['v219_frozen_a_passed','v221_frozen_a_passed','v222_frozen_a_passed','v223_frozen_a_passed']: assert parent[k]==30,k
# Freeze exact V8.3.224 sealed Batch A first-run evidence as DEVELOPMENT carrier.
subprocess.run(['git','fetch','--depth=1','origin','refs/heads/v83224-v1-sealed-validation:refs/remotes/origin/v83224-v1-sealed-validation'],check=True,stdout=subprocess.DEVNULL)
a=json.loads(subprocess.check_output(['git','show','origin/v83224-v1-sealed-validation:validation/v83224-v1-sealed/V8_3_224_BATCH_A_RESULT_V1.json'],text=True))
assert a['total']==30 and a['passed']==15 and a['failed']==15
carrier={'authority':'V8.3.225 immutable carrier from frozen V8.3.224 A','source_run_id':a['run_id'],'cases':[{'case_id':r['case_id'],'surface':r['surface'],'domain':r['domain'],'category':r['category'],'language':r['language'],'expected':r['expected'],'source_first_run_pass':r['pass']} for r in a['results']]}
Path('validation/V8_3_225_V224_A_FROZEN_CARRIER.json').write_text(json.dumps(carrier,ensure_ascii=False,indent=2)+'\n')
# Materialize exact runtime chain through V102 and test frozen V224 A.
archive=Path('PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip');assert archive.exists()
with zipfile.ZipFile(archive) as z:z.extractall('.')
base=Path('validation/run-v83196-full-regression-sweep-v2.cjs').read_text();needle2="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];";assert needle2 in base
tree=ast.parse(Path('validation/v83220-v98-regression-orchestrator.py').read_text());ext=None
for node in ast.walk(tree):
 if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='ext' for t in node.targets):ext=ast.literal_eval(node.value);break
assert ext and ext[-2:]==['qc-evidence-extractor-v5y-v220-bounded-recall.js','psc-v83220-v219-v98-bounded-recall.js']
ext += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js','qc-evidence-extractor-v5ac-v225-residual-composition.js','psc-v83225-v224-v102-residual-composition.js']
base=base.replace(needle2,"'psc-v83196-v195-v1-hypothetical-preservation-repair.js',"+','.join(repr(x) for x in ext)+'];',1);marker="const files=fs.readdirSync('validation')";prefix=base.split(marker)[0]
runner=Path('validation/run-v83225-v224-a-regression.cjs');tail=r'''
if(!s.QCEvidenceExtractorV5AC)throw Error('V5AC missing');if(!s.QCSemanticCoreV102)throw Error('V102 missing');const C=JSON.parse(fs.readFileSync('validation/V8_3_225_V224_A_FROZEN_CARRIER.json')).cases;let passed=0;const results=[];for(const c of C){const r=s.QCSemanticCoreV102.analyze(c.surface,c.domain);const actual={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};const expected={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence};const ok=JSON.stringify(actual)===JSON.stringify(expected);if(ok)passed++;results.push({case_id:c.case_id,category:c.category,language:c.language,pass:ok,expected,actual,source_first_run_pass:c.source_first_run_pass});}const out={authority:'V8.3.225 V102 regression of frozen V8.3.224 A',total:30,passed,failed:30-passed,results};fs.writeFileSync('V8_3_225_V224_A_REGRESSION_RESULTS.json',JSON.stringify(out,null,2));console.log('V224 A regression',passed+'/30');if(passed!==30)process.exit(1);
''';runner.write_text(prefix+tail);cp=subprocess.run(['node',str(runner)],text=True);assert cp.returncode==0
r=json.loads(Path('V8_3_225_V224_A_REGRESSION_RESULTS.json').read_text());assert r['passed']==30 and r['failed']==0
# Preserve exact first-run pass/fail split while requiring full V102 repair.
repaired=sum(1 for x in r['results'] if (not x['source_first_run_pass']) and x['pass'])
preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass'])
pred=[x for x in r['results'] if x['category']=='prediction'];ign=[x for x in r['results'] if x['category']=='ignore']
assert repaired==15 and preserved==15 and len(pred)==3 and all(x['pass'] for x in pred) and len(ign)==3 and all(x['pass'] for x in ign)
receipt={'candidate':'V8.3.225','phase':'v102-bounded-regression','semantic_authority':'QCEvidenceExtractorV5AC -> QCSemanticCoreV102','immutable_regression_total':1470,'immutable_regression_passed':1470,'v216_frozen_a_total':30,'v216_frozen_a_passed':30,'v219_frozen_a_total':30,'v219_frozen_a_passed':30,'v221_frozen_a_total':30,'v221_frozen_a_passed':30,'v222_frozen_a_total':30,'v222_frozen_a_passed':30,'v223_frozen_a_total':30,'v223_frozen_a_passed':30,'v224_frozen_a_total':30,'v224_frozen_a_passed':30,'v224_previous_failures_repaired':15,'v224_previous_passes_preserved':15,'prediction_preserved':3,'ignore_preserved':3,'v224_sealed_rerun':False,'v223_sealed_rerun':False,'v222_sealed_rerun':False,'v221_sealed_rerun':False,'v220_sealed_rerun':False,'v219_sealed_rerun':False,'expected_gold_changed':False,'sealed_validation_executed':False,'step_111_authorized':False,'production_authorized':False,'conclusion':'success'}
Path('validation/V8_3_225_V102_REGRESSION_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
