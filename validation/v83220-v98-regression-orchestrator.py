from pathlib import Path
import subprocess,json,zipfile,shutil,os
# First preserve the exact proven V97 regression architecture and append V5Y/V98.
src=Path('validation/v83217-v97-regression-orchestrator.py').read_text()
old="'qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js']"
new="'qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js','qc-evidence-extractor-v5y-v220-bounded-recall.js','psc-v83220-v219-v98-bounded-recall.js']"
assert old in src
src=src.replace(old,new,1)
src=src.replace('QCSemanticCoreV97','QCSemanticCoreV98')
src=src.replace('V8.3.217 V97 immutable regression','V8.3.220 V98 immutable regression')
src=src.replace('V8_3_217_V97_REGRESSION_RESULTS','V8_3_220_V98_REGRESSION_RESULTS')
src=src.replace("'candidate':'V8.3.217'","'candidate':'V8.3.220'")
src=src.replace("'phase':'v97-regression-v1'","'phase':'v98-regression-v1'")
src=src.replace("'semantic_authority':'QCSemanticCoreV98'","'semantic_authority':'QCSemanticCoreV98'")
src=src.replace('V8_3_217_V97_REGRESSION_V1_RECEIPT','V8_3_220_V98_BASE_REGRESSION_RECEIPT')
exec(compile(src,'v83220-v98-base-regression-adapted.py','exec'))

# Verify adapted historical regression evidence.
base_receipt=json.loads(Path('validation/V8_3_220_V98_BASE_REGRESSION_RECEIPT.json').read_text())
assert base_receipt['immutable_regression_total']==1470 and base_receipt['immutable_regression_passed']==1470
assert base_receipt['v216_frozen_a_regression_total']==30 and base_receipt['v216_frozen_a_regression_passed']==30

# Materialize exact frozen V8.3.219 A first-run evidence as immutable DEVELOPMENT regression carrier.
subprocess.run(['git','fetch','--depth=1','origin','refs/heads/v83219-v1-sealed-validation:refs/remotes/origin/v83219-v1-sealed-validation'],check=True,stdout=subprocess.DEVNULL)
raw=subprocess.check_output(['git','show','origin/v83219-v1-sealed-validation:validation/v83219-v1-sealed/V8_3_219_BATCH_A_RESULT_V1.json'],text=True)
a=json.loads(raw);assert a['total']==30 and a['passed']==15 and a['failed']==15
cases=[]
for r in a['results']:
 cases.append({'case_id':r['case_id'],'surface':r['surface'],'domain':r['domain'],'category':r['category'],'language':r['language'],'expected':r['expected'],'v219_first_run_pass':r['pass']})
carrier={'authority':'V8.3.220 immutable regression carrier from frozen V8.3.219 A first run','source_run_id':a['run_id'],'cases':cases}
Path('validation/V8_3_220_V219_A_IMMUTABLE_REGRESSION.json').write_text(json.dumps(carrier,ensure_ascii=False,indent=2)+'\n')

# Run those 30 through exact V98 chain; no sealed V220 data is used.
archive=Path('PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip')
assert archive.exists()
with zipfile.ZipFile(archive) as z:z.extractall('.')
base=Path('validation/run-v83196-full-regression-sweep-v2.cjs').read_text();needle="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];";assert needle in base
ext=['psc-v83197-v196-sealed-a-bounded-repair.js','psc-v83198-v197-sealed-a-bounded-repair.js','psc-v83199-v198-sealed-a-bounded-repair.js','psc-v83200-v199-sealed-a-bounded-repair.js','psc-v83201-v200-sealed-a-bounded-repair.js','psc-v83201-v200-v1-preservation-precedence-repair.js','psc-v83202-v201-sealed-a-bounded-repair.js','psc-v83203-v202-sealed-a-bounded-repair.js','psc-v83204-v203-sealed-a-bounded-repair.js','psc-v83205-v204-sealed-a-bounded-repair.js','psc-v83206-v205-compositional-generalization.js','psc-v83206-v205-v1-preservation-repair.js','psc-v83207-v206-mechanism-cue-repair.js','psc-v83207-v206-v1-preservation-repair.js','psc-v83208-v207-mechanism-cue-repair.js','psc-v83208-v207-v1-preservation-repair.js','psc-v83209-v208-evidence-slot-composition.js','psc-v83209-v208-v1-preservation-repair.js','qc-evidence-extractor-v1-review-candidate.js','qc-evidence-extractor-v1r-review-candidate.js','qc-evidence-extractor-v1r2-review-candidate.js','psc-v83209-semantic-rule-table-v3-review-candidate.js','psc-v83209-v208-semantic-rule-table-promotion.js','qc-evidence-extractor-v1r3-v210-concept-coverage.js','psc-v83210-v209-semantic-rule-table-v4.js','qc-evidence-extractor-v1r4-v210-relational-preservation.js','psc-v83210-v209-v1-relational-preservation.js','qc-evidence-extractor-v2-v210-relational-semantics.js','psc-v83210-v210-semantic-rule-table-v5.js','qc-evidence-extractor-v2r-v210-multilingual-aliases.js','psc-v83210-v210-semantic-rule-table-v6.js','qc-evidence-extractor-v2s-v210-context-sanitizer.js','psc-v83210-v210-semantic-rule-table-v7.js','qc-evidence-extractor-v2t-v210-contextual-recall.js','psc-v83210-v210-semantic-rule-table-v8-parent-containment.js','qc-evidence-extractor-v3-v211-context-scoped.js','psc-v83211-v210-context-scoped-rule-table.js','qc-evidence-extractor-v3r-v211-preservation.js','psc-v83211-v210-preservation-containment.js','qc-evidence-extractor-v4-v211-relational-recall.js','psc-v83211-v210-v89-relational-recall.js','qc-evidence-extractor-v5-v212-scope-propagation.js','psc-v83212-v211-v90-scope-propagation.js','qc-evidence-extractor-v5r-v212-delegated-decision-preservation.js','psc-v83212-v211-v91-delegated-decision-preservation.js','qc-evidence-extractor-v5s-v212-relational-recall.js','psc-v83212-v211-v92-relational-recall.js','qc-evidence-extractor-v5t-v213-relational-paraphrase-recall.js','psc-v83213-v212-v93-relational-paraphrase-recall.js','qc-evidence-extractor-v5u-v214-sealed-recall.js','psc-v83214-v213-v94-sealed-recall.js','qc-evidence-extractor-v5u2-v214-clarification-containment.js','psc-v83214-v213-v94r-clarification-containment.js','qc-evidence-extractor-v5v-v215-compositional-recall.js','psc-v83215-v214-v95-compositional-recall.js','qc-evidence-extractor-v5w-v216-sealed-recall.js','psc-v83216-v215-v96-sealed-recall.js','qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js','qc-evidence-extractor-v5y-v220-bounded-recall.js','psc-v83220-v219-v98-bounded-recall.js']
replacement="'psc-v83196-v195-v1-hypothetical-preservation-repair.js',"+','.join(repr(x) for x in ext)+'];';base=base.replace(needle,replacement,1)
marker="const files=fs.readdirSync('validation')";assert marker in base;prefix=base.split(marker)[0]
tail=r'''
if(!s.QCSemanticCoreV98)throw Error('QCSemanticCoreV98 missing');
const C=JSON.parse(fs.readFileSync('validation/V8_3_220_V219_A_IMMUTABLE_REGRESSION.json','utf8')).cases;
let passed=0;const results=[];for(const c of C){const r=s.QCSemanticCoreV98.analyze(c.surface,c.domain);const a={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};const e={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence};const ok=JSON.stringify(a)===JSON.stringify(e);if(ok)passed++;results.push({case_id:c.case_id,pass:ok,expected:e,actual:a,v219_first_run_pass:c.v219_first_run_pass});}
const out={authority:'V8.3.220 V98 regression of frozen V8.3.219 A',total:C.length,passed,failed:C.length-passed,results};fs.writeFileSync('V8_3_220_V219_A_REGRESSION_RESULTS.json',JSON.stringify(out,null,2));console.log('V219 A regression',passed+'/'+C.length);if(passed!==C.length)process.exit(1);
'''
runner=Path('validation/run-v83220-v219-a-regression.cjs');runner.write_text(prefix+tail)
cp=subprocess.run(['node',str(runner)],text=True);assert cp.returncode==0
vr=json.loads(Path('V8_3_220_V219_A_REGRESSION_RESULTS.json').read_text());assert vr['total']==30 and vr['passed']==30 and vr['failed']==0
receipt={'candidate':'V8.3.220','phase':'v98-bounded-regression','semantic_authority':'QCEvidenceExtractorV5Y -> QCSemanticCoreV98','immutable_regression_total':1470,'immutable_regression_passed':1470,'v216_frozen_a_total':30,'v216_frozen_a_passed':30,'v219_frozen_a_total':30,'v219_frozen_a_passed':30,'v219_previous_failures_repaired':15,'v219_previous_passes_preserved':15,'v219_sealed_rerun':False,'v218_sealed_rerun':False,'v217_sealed_rerun':False,'sealed_validation_executed':False,'step_111_authorized':False,'production_authorized':False,'conclusion':'success'}
Path('validation/V8_3_220_V98_REGRESSION_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
