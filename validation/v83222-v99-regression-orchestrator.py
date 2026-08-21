from pathlib import Path
import subprocess,json,zipfile,ast
# 1) Preserve the exact proven historical regression architecture while appending V5Y/V98 and V5Z/V99.
src=Path('validation/v83217-v97-regression-orchestrator.py').read_text()
old="'qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js']"
new="'qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js','qc-evidence-extractor-v5y-v220-bounded-recall.js','psc-v83220-v219-v98-bounded-recall.js','qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js']"
assert old in src
src=src.replace(old,new,1)
src=src.replace('QCSemanticCoreV97','QCSemanticCoreV99')
src=src.replace('V8.3.217 V97 immutable regression','V8.3.222 V99 immutable regression')
src=src.replace('V8_3_217_V97_REGRESSION_RESULTS','V8_3_222_V99_REGRESSION_RESULTS')
src=src.replace("'candidate':'V8.3.217'","'candidate':'V8.3.222'")
src=src.replace("'phase':'v97-regression-v1'","'phase':'v99-regression-v1'")
src=src.replace('V8_3_217_V97_REGRESSION_V1_RECEIPT','V8_3_222_V99_BASE_REGRESSION_RECEIPT')
exec(compile(src,'v83222-v99-base-regression-adapted.py','exec'))
base_receipt=json.loads(Path('validation/V8_3_222_V99_BASE_REGRESSION_RECEIPT.json').read_text())
assert base_receipt['immutable_regression_total']==1470 and base_receipt['immutable_regression_passed']==1470
assert base_receipt['v216_frozen_a_regression_total']==30 and base_receipt['v216_frozen_a_regression_passed']==30
# 2) Freeze V219 and V221 sealed first-run evidence as DEVELOPMENT-only regression carriers.
def fetch_result(branch,path):
 subprocess.run(['git','fetch','--depth=1','origin',f'refs/heads/{branch}:refs/remotes/origin/{branch}'],check=True,stdout=subprocess.DEVNULL)
 return json.loads(subprocess.check_output(['git','show',f'origin/{branch}:{path}'],text=True))
a219=fetch_result('v83219-v1-sealed-validation','validation/v83219-v1-sealed/V8_3_219_BATCH_A_RESULT_V1.json');assert a219['total']==30 and a219['passed']==15 and a219['failed']==15
a221=fetch_result('v83221-v1-sealed-validation','validation/v83221-v1-sealed/V8_3_221_BATCH_A_RESULT_V1.json');assert a221['total']==30 and a221['passed']==18 and a221['failed']==12
def carrier(a,label):
 return {'authority':label,'source_run_id':a['run_id'],'cases':[{'case_id':r['case_id'],'surface':r['surface'],'domain':r['domain'],'category':r['category'],'language':r['language'],'expected':r['expected'],'source_first_run_pass':r['pass']} for r in a['results']]}
Path('validation/V8_3_222_V219_A_FROZEN_CARRIER.json').write_text(json.dumps(carrier(a219,'V8.3.222 carrier from frozen V8.3.219 A'),ensure_ascii=False,indent=2)+'\n')
Path('validation/V8_3_222_V221_A_FROZEN_CARRIER.json').write_text(json.dumps(carrier(a221,'V8.3.222 carrier from frozen V8.3.221 A'),ensure_ascii=False,indent=2)+'\n')
# 3) Materialize exact public runtime and exact loader chain through V99.
archive=Path('PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip');assert archive.exists()
with zipfile.ZipFile(archive) as z:z.extractall('.')
base=Path('validation/run-v83196-full-regression-sweep-v2.cjs').read_text();needle="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];";assert needle in base
# Reuse the exact V98 extension list and append V5Z/V99 only.
tree=ast.parse(Path('validation/v83220-v98-regression-orchestrator.py').read_text());ext=None
for node in ast.walk(tree):
 if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='ext' for t in node.targets):
  ext=ast.literal_eval(node.value);break
assert ext and ext[-2:]==['qc-evidence-extractor-v5y-v220-bounded-recall.js','psc-v83220-v219-v98-bounded-recall.js']
ext=ext+['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js']
replacement="'psc-v83196-v195-v1-hypothetical-preservation-repair.js',"+','.join(repr(x) for x in ext)+'];';base=base.replace(needle,replacement,1)
marker="const files=fs.readdirSync('validation')";assert marker in base;prefix=base.split(marker)[0]
runner=Path('validation/run-v83222-v99-frozen-a-regressions.cjs')
tail=r'''
if(!s.QCEvidenceExtractorV5Z)throw Error('QCEvidenceExtractorV5Z missing');
if(!s.QCSemanticCoreV99)throw Error('QCSemanticCoreV99 missing');
function run(path,outName,label){const C=JSON.parse(fs.readFileSync(path,'utf8')).cases;let passed=0;const results=[];for(const c of C){const r=s.QCSemanticCoreV99.analyze(c.surface,c.domain);const a={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};const e={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence};const ok=JSON.stringify(a)===JSON.stringify(e);if(ok)passed++;results.push({case_id:c.case_id,pass:ok,expected:e,actual:a,source_first_run_pass:c.source_first_run_pass,category:c.category,language:c.language});}const out={authority:label,total:C.length,passed,failed:C.length-passed,results};fs.writeFileSync(outName,JSON.stringify(out,null,2));console.log(label,passed+'/'+C.length);return out;}
const a=run('validation/V8_3_222_V219_A_FROZEN_CARRIER.json','V8_3_222_V219_A_REGRESSION_RESULTS.json','V8.3.222 V99 regression of frozen V8.3.219 A');
const b=run('validation/V8_3_222_V221_A_FROZEN_CARRIER.json','V8_3_222_V221_A_REGRESSION_RESULTS.json','V8.3.222 V99 regression of frozen V8.3.221 A');
if(a.passed!==30||b.passed!==30)process.exit(1);
'''
runner.write_text(prefix+tail);cp=subprocess.run(['node',str(runner)],text=True);assert cp.returncode==0
r219=json.loads(Path('V8_3_222_V219_A_REGRESSION_RESULTS.json').read_text());r221=json.loads(Path('V8_3_222_V221_A_REGRESSION_RESULTS.json').read_text())
assert r219['passed']==30 and r219['failed']==0 and r221['passed']==30 and r221['failed']==0
receipt={'candidate':'V8.3.222','phase':'v99-bounded-regression','semantic_authority':'QCEvidenceExtractorV5Z -> QCSemanticCoreV99','immutable_regression_total':1470,'immutable_regression_passed':1470,'v216_frozen_a_total':30,'v216_frozen_a_passed':30,'v219_frozen_a_total':30,'v219_frozen_a_passed':30,'v221_frozen_a_total':30,'v221_frozen_a_passed':30,'v221_previous_failures_repaired':12,'v221_previous_passes_preserved':18,'v221_sealed_rerun':False,'v220_sealed_rerun':False,'v219_sealed_rerun':False,'expected_gold_changed':False,'sealed_validation_executed':False,'step_111_authorized':False,'production_authorized':False,'conclusion':'success'}
Path('validation/V8_3_222_V99_REGRESSION_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
