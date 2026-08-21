import os,json,pathlib,subprocess,hashlib,zipfile,base64,gzip
ROOT=pathlib.Path('.').resolve(); VAL=ROOT/'validation'
RUN_ID=int(os.environ.get('GITHUB_RUN_ID','0')); RUN_ATTEMPT=int(os.environ.get('GITHUB_RUN_ATTEMPT','0')); HEAD=os.environ.get('GITHUB_SHA','UNKNOWN')
V212_SEALED='f03b3f8be1c49320fb2840a644960c17b06f4d3c'
CHAIN=[
'psc-v83196-v195-v1-hypothetical-preservation-repair.js','psc-v83197-v196-sealed-a-bounded-repair.js','psc-v83198-v197-sealed-a-bounded-repair.js','psc-v83199-v198-sealed-a-bounded-repair.js','psc-v83200-v199-sealed-a-bounded-repair.js','psc-v83201-v200-sealed-a-bounded-repair.js','psc-v83201-v200-v1-preservation-precedence-repair.js','psc-v83202-v201-sealed-a-bounded-repair.js','psc-v83203-v202-sealed-a-bounded-repair.js','psc-v83204-v203-sealed-a-bounded-repair.js','psc-v83205-v204-sealed-a-bounded-repair.js','psc-v83206-v205-compositional-generalization.js','psc-v83206-v205-v1-preservation-repair.js','psc-v83207-v206-mechanism-cue-repair.js','psc-v83207-v206-v1-preservation-repair.js','psc-v83208-v207-mechanism-cue-repair.js','psc-v83208-v207-v1-preservation-repair.js','psc-v83209-v208-evidence-slot-composition.js','psc-v83209-v208-v1-preservation-repair.js','qc-evidence-extractor-v1-review-candidate.js','qc-evidence-extractor-v1r-review-candidate.js','qc-evidence-extractor-v1r2-review-candidate.js','psc-v83209-semantic-rule-table-v3-review-candidate.js','psc-v83209-v208-semantic-rule-table-promotion.js','qc-evidence-extractor-v1r3-v210-concept-coverage.js','psc-v83210-v209-semantic-rule-table-v4.js','qc-evidence-extractor-v1r4-v210-relational-preservation.js','psc-v83210-v209-v1-relational-preservation.js','qc-evidence-extractor-v2-v210-relational-semantics.js','psc-v83210-v210-semantic-rule-table-v5.js','qc-evidence-extractor-v2r-v210-multilingual-aliases.js','psc-v83210-v210-semantic-rule-table-v6.js','qc-evidence-extractor-v2s-v210-context-sanitizer.js','psc-v83210-v210-semantic-rule-table-v7.js','qc-evidence-extractor-v2t-v210-contextual-recall.js','psc-v83210-v210-semantic-rule-table-v8-parent-containment.js','qc-evidence-extractor-v3-v211-context-scoped.js','psc-v83211-v210-context-scoped-rule-table.js','qc-evidence-extractor-v3r-v211-preservation.js','psc-v83211-v210-preservation-containment.js','qc-evidence-extractor-v4-v211-relational-recall.js','psc-v83211-v210-v89-relational-recall.js','qc-evidence-extractor-v5-v212-scope-propagation.js','psc-v83212-v211-v90-scope-propagation.js','qc-evidence-extractor-v5r-v212-delegated-decision-preservation.js','psc-v83212-v211-v91-delegated-decision-preservation.js','qc-evidence-extractor-v5s-v212-relational-recall.js','psc-v83212-v211-v92-relational-recall.js','qc-evidence-extractor-v5t-v213-relational-paraphrase-recall.js','psc-v83213-v212-v93-relational-paraphrase-recall.js']
def run(cmd): print('+',cmd,flush=True); subprocess.run(cmd,shell=True,check=True)
# Materialize immutable historical carriers used by the proven regression bootstrap.
for n in ['V8_3_172_V171_V1_FAILURE_REGRESSION','V8_3_172_V171_V1_PREVIOUS_PASS_REGRESSION','V8_3_171_V170_V1_FAILURE_REGRESSION','V8_3_171_V170_V1_PREVIOUS_PASS_REGRESSION','V8_3_169_V168_V1_FAILURE_REGRESSION','V8_3_169_V168_V1_PREVIOUS_PASS_REGRESSION','V8_3_168_V167_V1_FAILURE_REGRESSION','V8_3_168_V167_V1_PREVIOUS_PASS_REGRESSION']:
 p=VAL/(n+'.json.gz.b64')
 if p.exists(): (VAL/(n+'.json')).write_bytes(gzip.decompress(base64.b64decode(p.read_text().strip())))
with zipfile.ZipFile(ROOT/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip') as z:z.extractall(ROOT)
# Build V93 full immutable regression runner from proven lineage.
base=(VAL/'run-v83196-full-regression-sweep-v2.cjs').read_text(); needle="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];"; assert needle in base
chain=','.join(repr(x) for x in CHAIN)
reg=base.replace(needle,chain+"];",1).replace('QCSemanticCoreV65R','QCSemanticCoreV93').replace('V8.3.196 V65R full immutable regression sweep V2','V8.3.213 V93 immutable regression').replace('V8_3_196_V2_FULL_REGRESSION_SWEEP_RESULTS.json','V8_3_213_V93_REGRESSION_RESULTS.json')
(VAL/'run-v83213-v93-regression.cjs').write_text(reg); run('node validation/run-v83213-v93-regression.cjs')
rr=json.loads((ROOT/'V8_3_213_V93_REGRESSION_RESULTS.json').read_text()); assert rr['total']==1470 and rr['failed']==0
# Materialize V8.3.212 immutable sealed-A first-run carrier from frozen evidence commit; never rerun V212 semantics.
run(f'git fetch --depth=1 origin {V212_SEALED}')
carrier=VAL/'V8_3_213_V212_V1_BATCH_A_REGRESSION.json'
run(f'git show {V212_SEALED}:validation/v83212-v1-sealed/V8_3_212_V1_BATCH_A_FIRST_RUN_RESULTS.json > {carrier}')
c=json.loads(carrier.read_text()); assert c['total']==30 and c['passed']==21 and c['failed']==9
# Re-evaluate the frozen 30 surfaces through V93 as DEVELOPMENT regression only.
marker="const files=fs.readdirSync('validation')"; prefix=reg.split(marker,1)[0]; runner=VAL/'run-v83213-v212-a-regression.cjs'
tail=r'''
if(!s.QCSemanticCoreV93)throw Error('QCSemanticCoreV93 missing');
const C=JSON.parse(fs.readFileSync('validation/V8_3_213_V212_V1_BATCH_A_REGRESSION.json','utf8'));
let passed=0;const results=[];
for(const c of C.results){const r=s.QCSemanticCoreV93.analyze(c.surface,c.domain);const a={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};const e={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence};const ok=JSON.stringify(a)===JSON.stringify(e);if(ok)passed++;results.push({case_id:c.case_id,pass:ok,expected:e,actual:a,surface:c.surface});}
const out={authority:'V8.3.213 development regression of frozen V8.3.212 sealed-A first-run carrier',total:C.results.length,passed,failed:C.results.length-passed,results};fs.writeFileSync('V8_3_213_V212_A_REGRESSION_RESULTS.json',JSON.stringify(out,null,2));console.log(passed+'/'+C.results.length);if(passed!==C.results.length)process.exit(1);
'''
runner.write_text(prefix+tail); run('node validation/run-v83213-v212-a-regression.cjs')
ar=json.loads((ROOT/'V8_3_213_V212_A_REGRESSION_RESULTS.json').read_text()); assert ar['total']==30 and ar['failed']==0
receipt={'candidate':'V8.3.213','phase':'v93-regression-v1','run_id':RUN_ID,'run_attempt':RUN_ATTEMPT,'head_sha':HEAD,'semantic_authority':'QCSemanticCoreV93','immutable_regression_total':rr['total'],'immutable_regression_passed':rr['passed'],'v212_frozen_a_regression_total':ar['total'],'v212_frozen_a_regression_passed':ar['passed'],'v212_sealed_rerun':False,'sealed_validation_executed':False,'step_111_authorized':False,'production_authorized':False,'status':'completed','conclusion':'success'}
(VAL/'V8_3_213_V93_REGRESSION_V1_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n'); print(json.dumps(receipt,indent=2))
