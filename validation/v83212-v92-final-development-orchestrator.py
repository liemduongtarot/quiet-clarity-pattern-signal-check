import os, json, pathlib, subprocess, hashlib, zipfile, shutil, base64, gzip

ROOT=pathlib.Path('.').resolve()
VAL=ROOT/'validation'
APP=ROOT/'PSC_V8_3_138_DEV'
RUN_ID=int(os.environ.get('GITHUB_RUN_ID','0'))
RUN_ATTEMPT=int(os.environ.get('GITHUB_RUN_ATTEMPT','0'))
HEAD=os.environ.get('GITHUB_SHA','UNKNOWN')

CHAIN=[
'psc-v83196-v195-v1-hypothetical-preservation-repair.js','psc-v83197-v196-sealed-a-bounded-repair.js','psc-v83198-v197-sealed-a-bounded-repair.js','psc-v83199-v198-sealed-a-bounded-repair.js','psc-v83200-v199-sealed-a-bounded-repair.js','psc-v83201-v200-sealed-a-bounded-repair.js','psc-v83201-v200-v1-preservation-precedence-repair.js','psc-v83202-v201-sealed-a-bounded-repair.js','psc-v83203-v202-sealed-a-bounded-repair.js','psc-v83204-v203-sealed-a-bounded-repair.js','psc-v83205-v204-sealed-a-bounded-repair.js','psc-v83206-v205-compositional-generalization.js','psc-v83206-v205-v1-preservation-repair.js','psc-v83207-v206-mechanism-cue-repair.js','psc-v83207-v206-v1-preservation-repair.js','psc-v83208-v207-mechanism-cue-repair.js','psc-v83208-v207-v1-preservation-repair.js','psc-v83209-v208-evidence-slot-composition.js','psc-v83209-v208-v1-preservation-repair.js','qc-evidence-extractor-v1-review-candidate.js','qc-evidence-extractor-v1r-review-candidate.js','qc-evidence-extractor-v1r2-review-candidate.js','psc-v83209-semantic-rule-table-v3-review-candidate.js','psc-v83209-v208-semantic-rule-table-promotion.js','qc-evidence-extractor-v1r3-v210-concept-coverage.js','psc-v83210-v209-semantic-rule-table-v4.js','qc-evidence-extractor-v1r4-v210-relational-preservation.js','psc-v83210-v209-v1-relational-preservation.js','qc-evidence-extractor-v2-v210-relational-semantics.js','psc-v83210-v210-semantic-rule-table-v5.js','qc-evidence-extractor-v2r-v210-multilingual-aliases.js','psc-v83210-v210-semantic-rule-table-v6.js','qc-evidence-extractor-v2s-v210-context-sanitizer.js','psc-v83210-v210-semantic-rule-table-v7.js','qc-evidence-extractor-v2t-v210-contextual-recall.js','psc-v83210-v210-semantic-rule-table-v8-parent-containment.js','qc-evidence-extractor-v3-v211-context-scoped.js','psc-v83211-v210-context-scoped-rule-table.js','qc-evidence-extractor-v3r-v211-preservation.js','psc-v83211-v210-preservation-containment.js','qc-evidence-extractor-v4-v211-relational-recall.js','psc-v83211-v210-v89-relational-recall.js','qc-evidence-extractor-v5-v212-scope-propagation.js','psc-v83212-v211-v90-scope-propagation.js','qc-evidence-extractor-v5r-v212-delegated-decision-preservation.js','psc-v83212-v211-v91-delegated-decision-preservation.js','qc-evidence-extractor-v5s-v212-relational-recall.js','psc-v83212-v211-v92-relational-recall.js']

BUILD_FILES=[
'psc-v83209-v208-evidence-slot-composition.js','psc-v83209-v208-v1-preservation-repair.js','qc-evidence-extractor-v1-review-candidate.js','qc-evidence-extractor-v1r-review-candidate.js','qc-evidence-extractor-v1r2-review-candidate.js','psc-v83209-semantic-rule-table-v3-review-candidate.js','psc-v83209-v208-semantic-rule-table-promotion.js','qc-evidence-extractor-v1r3-v210-concept-coverage.js','psc-v83210-v209-semantic-rule-table-v4.js','qc-evidence-extractor-v1r4-v210-relational-preservation.js','psc-v83210-v209-v1-relational-preservation.js','qc-evidence-extractor-v2-v210-relational-semantics.js','psc-v83210-v210-semantic-rule-table-v5.js','qc-evidence-extractor-v2r-v210-multilingual-aliases.js','psc-v83210-v210-semantic-rule-table-v6.js','qc-evidence-extractor-v2s-v210-context-sanitizer.js','psc-v83210-v210-semantic-rule-table-v7.js','qc-evidence-extractor-v2t-v210-contextual-recall.js','psc-v83210-v210-semantic-rule-table-v8-parent-containment.js','qc-evidence-extractor-v3-v211-context-scoped.js','psc-v83211-v210-context-scoped-rule-table.js','qc-evidence-extractor-v3r-v211-preservation.js','psc-v83211-v210-preservation-containment.js','qc-evidence-extractor-v4-v211-relational-recall.js','psc-v83211-v210-v89-relational-recall.js','qc-evidence-extractor-v5-v212-scope-propagation.js','psc-v83212-v211-v90-scope-propagation.js','qc-evidence-extractor-v5r-v212-delegated-decision-preservation.js','psc-v83212-v211-v91-delegated-decision-preservation.js','qc-evidence-extractor-v5s-v212-relational-recall.js','psc-v83212-v211-v92-relational-recall.js']

def run(cmd,cwd=None,env=None):
    print('+',cmd,flush=True)
    subprocess.run(cmd,shell=True,cwd=cwd or ROOT,env=env,check=True)

def canon(o): return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def sha_file(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()

# Materialize immutable historical carriers.
names=['V8_3_172_V171_V1_FAILURE_REGRESSION','V8_3_172_V171_V1_PREVIOUS_PASS_REGRESSION','V8_3_171_V170_V1_FAILURE_REGRESSION','V8_3_171_V170_V1_PREVIOUS_PASS_REGRESSION','V8_3_169_V168_V1_FAILURE_REGRESSION','V8_3_169_V168_V1_PREVIOUS_PASS_REGRESSION','V8_3_168_V167_V1_FAILURE_REGRESSION','V8_3_168_V167_V1_PREVIOUS_PASS_REGRESSION']
for n in names:
    p=VAL/(n+'.json.gz.b64')
    (VAL/(n+'.json')).write_bytes(gzip.decompress(base64.b64decode(p.read_text().strip())))
with zipfile.ZipFile(ROOT/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip') as z:
    z.extractall(ROOT)
assert (VAL/'V8_3_212_V211_R4_A_REGRESSION.json').exists()

# Build and run exact V92 regression runner.
base=(VAL/'run-v83196-full-regression-sweep-v2.cjs').read_text()
needle="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];"
chain=','.join(repr(x) for x in CHAIN)
reg=base.replace(needle,chain+"];",1).replace('QCSemanticCoreV65R','QCSemanticCoreV92').replace('V8.3.196 V65R full immutable regression sweep V2','V8.3.212 V92 final development regression').replace('V8_3_196_V2_FULL_REGRESSION_SWEEP_RESULTS.json','V8_3_212_V92_FINAL_REGRESSION_RESULTS.json')
(VAL/'run-v83212-v92-final-regression.cjs').write_text(reg)
run('node validation/run-v83212-v92-final-regression.cjs')
reg_result=json.loads((ROOT/'V8_3_212_V92_FINAL_REGRESSION_RESULTS.json').read_text())
assert reg_result['total']==1470 and reg_result['failed']==0

# Re-run the frozen 800 challenge against V92.
run('python validation/v83212-generalization-800-generator.py')
refs=VAL/'v83212-generalization-refs'; refs.mkdir(exist_ok=True)
for v in range(201,210):
    s=str(v)[-2:]
    run(f'git fetch --depth=1 origin refs/heads/v832{s}-v1-sealed-validation:refs/remotes/origin/v832{s}-v1-sealed-validation')
    run(f'git show origin/v832{s}-v1-sealed-validation:validation/v832{s}-v1-sealed/V8_3_{v}_SEALED_FIXTURE_V1.json > validation/v83212-generalization-refs/V8_3_{v}_SEALED.json')
run('git fetch --depth=1 origin refs/heads/v83210-v1-sealed-validation:refs/remotes/origin/v83210-v1-sealed-validation')
run('git show origin/v83210-v1-sealed-validation:validation/v83210-v1-sealed/V8_3_210_SEALED_FIXTURE_V1.json > validation/v83212-generalization-refs/V8_3_210_SEALED.json')
run('git fetch --depth=1 origin 6d82282b620f03e397368a6d973b566d8055d2eb')
tmp=pathlib.Path('/tmp/v211-r4-final'); shutil.rmtree(tmp,ignore_errors=True); (tmp/'validation/v83211-r4-frozen').mkdir(parents=True)
run(f'git show 6d82282b620f03e397368a6d973b566d8055d2eb:validation/v83211-r4-frozen/generate-r4-carrier.py > {tmp}/validation/v83211-r4-frozen/generate-r4-carrier.py')
run('python validation/v83211-r4-frozen/generate-r4-carrier.py',cwd=tmp)
shutil.copy2(tmp/'validation/v83211-r4-runtime/V8_3_211_R4_SEALED_FIXTURE.json',refs/'V8_3_211_R4_SEALED.json')
run('python validation/v83211-generalization-600-generator-v1r.py')
shutil.copy2(VAL/'V8_3_211_DEVELOPMENT_GENERALIZATION_600_V1.json',refs/'V8_3_211_DEV_600.json')
run('python validation/v83212-build-generalization-800-v2-runner.py')
run('node validation/run-v83212-generalization-800-v2.cjs')
gen_result=json.loads((ROOT/'V8_3_212_DEVELOPMENT_GENERALIZATION_800_RESULTS_V1.json').read_text())
assert gen_result['total']==800 and gen_result['pass'] is True

# Fresh build + artifact validation with the complete current semantic extension chain.
pub=APP/'public'; pub.mkdir(exist_ok=True)
for f in BUILD_FILES:
    shutil.copy2(VAL/f,pub/f)
run('chmod +x scripts/*.sh',cwd=APP)
run('npm run install:ci',cwd=APP)
run('npm run build',cwd=APP)
run('npm run validate:artifact',cwd=APP)
assert not list((APP/'dist').rglob('*.map'))
for f in BUILD_FILES:
    a=pub/f; b=APP/'dist/client'/f
    assert b.exists() and a.read_bytes()==b.read_bytes(),f

# Build and run Browser E2E over all 1470 immutable cases.
b=(VAL/'run-v83196-browser-e2e.cjs').read_text()
b=b.replace(needle,chain+"];",1).replace('QCSemanticCoreV65R','QCSemanticCoreV92').replace('V8_3_196_BROWSER_E2E_RESULTS.json','V8_3_212_V92_FINAL_BROWSER_E2E_RESULTS.json').replace('built_v65_v65r_identity','built_v92_identity')
b=b.replace("if(!pf.version?.startsWith('V8.3.196'))throw Error(JSON.stringify(pf));","if(pf.version!=='V8.3.212-V92-RELATIONAL-RECALL')throw Error(JSON.stringify(pf));")
(VAL/'run-v83212-v92-final-browser-e2e.cjs').write_text(b)
e2e=ROOT/'.e2e'; e2e.mkdir(exist_ok=True); (e2e/'package.json').write_text('{"private":true}\n')
run('npm install --prefix .e2e --no-package-lock playwright@1.55.0')
chrome=shutil.which('google-chrome') or shutil.which('google-chrome-stable') or shutil.which('chromium')
if not chrome: raise RuntimeError('Chrome executable not found')
env=os.environ.copy(); env['CHROME']=chrome
run('node validation/run-v83212-v92-final-browser-e2e.cjs',env=env)
browser_result=json.loads((ROOT/'V8_3_212_V92_FINAL_BROWSER_E2E_RESULTS.json').read_text())
assert browser_result['passed'] is True and browser_result['total']==1470

# Package immutable final-development checkpoint.
st=ROOT/'V8_3_212_V92_FINAL_DEVELOPMENT_CHECKPOINT'; shutil.rmtree(st,ignore_errors=True); st.mkdir()
copy_files=[
ROOT/'V8_3_212_V92_FINAL_REGRESSION_RESULTS.json',
ROOT/'V8_3_212_DEVELOPMENT_GENERALIZATION_800_RESULTS_V1.json',
ROOT/'V8_3_212_V92_FINAL_BROWSER_E2E_RESULTS.json',
VAL/'qc-evidence-extractor-v5s-v212-relational-recall.js',
VAL/'psc-v83212-v211-v92-relational-recall.js',
VAL/'V8_3_212_V211_R4_A_REGRESSION.json']
for p in copy_files: shutil.copy2(p,st/p.name)
status={
'candidate':'V8.3.212','phase':'v92-final-development','run_id':RUN_ID,'run_attempt':RUN_ATTEMPT,'head_sha':HEAD,
'semantic_authority':'QCSemanticCoreV92','regression_total':reg_result['total'],'regression_passed':reg_result['passed'],
'generalization_total':gen_result['total'],'generalization_passed':gen_result['classification_passed'],'generalization_pass':gen_result['pass'],
'browser_total':browser_result['total'],'browser_passed':browser_result['passed'],'development':'PASS',
'v211_r4_sealed_rerun':False,'sealed_validation_executed':False,'step_111_authorized':False,'production_authorized':False}
(st/'STATUS.json').write_text(json.dumps(status,indent=2)+'\n')
(st/'SHA256_MANIFEST.txt').write_text(''.join(f'{sha_file(p)}  {p.name}\n' for p in sorted(st.iterdir()) if p.is_file()))
zpath=ROOT/'PSC_V8_3_212_V92_DEVELOPMENT_VALIDATION_CHECKPOINT.zip'
if zpath.exists(): zpath.unlink()
with zipfile.ZipFile(zpath,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(st.iterdir()): z.write(p,p.name)
(ROOT/'PSC_V8_3_212_V92_DEVELOPMENT_VALIDATION_CHECKPOINT_SHA256.txt').write_text(f'{sha_file(zpath)}  {zpath.name}\n')
receipt={**status,'status':'completed','conclusion':'success'}
(VAL/'V8_3_212_V92_FINAL_DEVELOPMENT_RUN_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(status,indent=2))
