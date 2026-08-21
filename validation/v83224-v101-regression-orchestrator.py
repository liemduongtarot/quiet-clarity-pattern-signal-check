from pathlib import Path
import subprocess,json,zipfile,ast
# 1) Historical immutable regression under exact V101 chain.
src=Path('validation/v83217-v97-regression-orchestrator.py').read_text()
old="'qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js']"
new="'qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js','qc-evidence-extractor-v5y-v220-bounded-recall.js','psc-v83220-v219-v98-bounded-recall.js','qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js']"
assert old in src
src=src.replace(old,new,1).replace('QCSemanticCoreV97','QCSemanticCoreV101').replace('V8.3.217 V97 immutable regression','V8.3.224 V101 immutable regression').replace('V8_3_217_V97_REGRESSION_RESULTS','V8_3_224_V101_BASE_REGRESSION_RESULTS').replace("'candidate':'V8.3.217'","'candidate':'V8.3.224'").replace("'phase':'v97-regression-v1'","'phase':'v101-regression-base'").replace('V8_3_217_V97_REGRESSION_V1_RECEIPT','V8_3_224_V101_BASE_REGRESSION_RECEIPT')
exec(compile(src,'v83224-v101-base-regression-adapted.py','exec'))
base_receipt=json.loads(Path('validation/V8_3_224_V101_BASE_REGRESSION_RECEIPT.json').read_text());assert base_receipt['immutable_regression_total']==1470 and base_receipt['immutable_regression_passed']==1470 and base_receipt['v216_frozen_a_regression_total']==30 and base_receipt['v216_frozen_a_regression_passed']==30
# 2) Freeze exact prior sealed first-run evidence as DEVELOPMENT carriers.
def fetch_result(v):
 br=f'v83{v}-v1-sealed-validation';path=f'validation/v83{v}-v1-sealed/V8_3_{v}_BATCH_A_RESULT_V1.json'
 subprocess.run(['git','fetch','--depth=1','origin',f'refs/heads/{br}:refs/remotes/origin/{br}'],check=True,stdout=subprocess.DEVNULL)
 return json.loads(subprocess.check_output(['git','show',f'origin/{br}:{path}'],text=True))
expected_first={219:(15,15),221:(18,12),222:(11,19),223:(11,19)}
for v,(p,f) in expected_first.items():
 a=fetch_result(v);assert a['total']==30 and a['passed']==p and a['failed']==f
 carrier={'authority':f'V8.3.224 immutable carrier from frozen V8.3.{v} A','source_run_id':a['run_id'],'cases':[{'case_id':r['case_id'],'surface':r['surface'],'domain':r['domain'],'category':r['category'],'language':r['language'],'expected':r['expected'],'source_first_run_pass':r['pass']} for r in a['results']]}
 Path(f'validation/V8_3_224_V{v}_A_FROZEN_CARRIER.json').write_text(json.dumps(carrier,ensure_ascii=False,indent=2)+'\n')
# 3) Materialize exact runtime chain through V101 and test every frozen carrier.
archive=Path('PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip');assert archive.exists()
with zipfile.ZipFile(archive) as z:z.extractall('.')
base=Path('validation/run-v83196-full-regression-sweep-v2.cjs').read_text();needle="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];";assert needle in base
tree=ast.parse(Path('validation/v83220-v98-regression-orchestrator.py').read_text());ext=None
for node in ast.walk(tree):
 if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='ext' for t in node.targets):ext=ast.literal_eval(node.value);break
assert ext and ext[-2:]==['qc-evidence-extractor-v5y-v220-bounded-recall.js','psc-v83220-v219-v98-bounded-recall.js']
ext += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js']
base=base.replace(needle,"'psc-v83196-v195-v1-hypothetical-preservation-repair.js',"+','.join(repr(x) for x in ext)+'];',1);marker="const files=fs.readdirSync('validation')";prefix=base.split(marker)[0]
runner=Path('validation/run-v83224-frozen-a-regressions.cjs');tail=r'''
if(!s.QCEvidenceExtractorV5AB)throw Error('V5AB missing');if(!s.QCSemanticCoreV101)throw Error('V101 missing');
function run(v){const path=`validation/V8_3_224_V${v}_A_FROZEN_CARRIER.json`;const C=JSON.parse(fs.readFileSync(path)).cases;let passed=0;const results=[];for(const c of C){const r=s.QCSemanticCoreV101.analyze(c.surface,c.domain);const a={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};const e={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence};const ok=JSON.stringify(a)===JSON.stringify(e);if(ok)passed++;results.push({case_id:c.case_id,category:c.category,language:c.language,pass:ok,expected:e,actual:a,source_first_run_pass:c.source_first_run_pass});}const out={authority:`V8.3.224 V101 regression of frozen V8.3.${v} A`,total:30,passed,failed:30-passed,results};fs.writeFileSync(`V8_3_224_V${v}_A_REGRESSION_RESULTS.json`,JSON.stringify(out,null,2));console.log(`V${v} A`,passed+'/30');if(passed!==30)process.exitCode=1;return out;}
for(const v of [219,221,222,223])run(v);if(process.exitCode)process.exit(1);
''';runner.write_text(prefix+tail);cp=subprocess.run(['node',str(runner)],text=True);assert cp.returncode==0
for v in [219,221,222,223]:
 r=json.loads(Path(f'V8_3_224_V{v}_A_REGRESSION_RESULTS.json').read_text());assert r['passed']==30 and r['failed']==0
receipt={'candidate':'V8.3.224','phase':'v101-bounded-regression','semantic_authority':'QCEvidenceExtractorV5AB -> QCSemanticCoreV101','immutable_regression_total':1470,'immutable_regression_passed':1470,'v216_frozen_a_total':30,'v216_frozen_a_passed':30,'v219_frozen_a_total':30,'v219_frozen_a_passed':30,'v221_frozen_a_total':30,'v221_frozen_a_passed':30,'v222_frozen_a_total':30,'v222_frozen_a_passed':30,'v223_frozen_a_total':30,'v223_frozen_a_passed':30,'v223_previous_failures_repaired':19,'v223_previous_passes_preserved':11,'v223_sealed_rerun':False,'v222_sealed_rerun':False,'v221_sealed_rerun':False,'v220_sealed_rerun':False,'v219_sealed_rerun':False,'expected_gold_changed':False,'sealed_validation_executed':False,'step_111_authorized':False,'production_authorized':False,'conclusion':'success'}
Path('validation/V8_3_224_V101_REGRESSION_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
