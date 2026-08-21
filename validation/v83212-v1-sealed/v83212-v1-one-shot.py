import json,hashlib,pathlib,subprocess,shutil,os,zipfile,gzip,base64

REPO=pathlib.Path.cwd()
TARGET='840cfd3aeea515a335a97615fbc321ebf0e1ce11'
WORK=pathlib.Path('/tmp/v212-v1-authority')
SEALED=REPO/'validation'/'v83212-v1-sealed'
OUT=SEALED
MARKER=REPO/'validation'/'V8_3_212_V1_SEMANTIC_FIRST_RUN_EXECUTED.json'

CHAIN=[
'psc-v83196-v195-v1-hypothetical-preservation-repair.js','psc-v83197-v196-sealed-a-bounded-repair.js','psc-v83198-v197-sealed-a-bounded-repair.js','psc-v83199-v198-sealed-a-bounded-repair.js','psc-v83200-v199-sealed-a-bounded-repair.js','psc-v83201-v200-sealed-a-bounded-repair.js','psc-v83201-v200-v1-preservation-precedence-repair.js','psc-v83202-v201-sealed-a-bounded-repair.js','psc-v83203-v202-sealed-a-bounded-repair.js','psc-v83204-v203-sealed-a-bounded-repair.js','psc-v83205-v204-sealed-a-bounded-repair.js','psc-v83206-v205-compositional-generalization.js','psc-v83206-v205-v1-preservation-repair.js','psc-v83207-v206-mechanism-cue-repair.js','psc-v83207-v206-v1-preservation-repair.js','psc-v83208-v207-mechanism-cue-repair.js','psc-v83208-v207-v1-preservation-repair.js','psc-v83209-v208-evidence-slot-composition.js','psc-v83209-v208-v1-preservation-repair.js','qc-evidence-extractor-v1-review-candidate.js','qc-evidence-extractor-v1r-review-candidate.js','qc-evidence-extractor-v1r2-review-candidate.js','psc-v83209-semantic-rule-table-v3-review-candidate.js','psc-v83209-v208-semantic-rule-table-promotion.js','qc-evidence-extractor-v1r3-v210-concept-coverage.js','psc-v83210-v209-semantic-rule-table-v4.js','qc-evidence-extractor-v1r4-v210-relational-preservation.js','psc-v83210-v209-v1-relational-preservation.js','qc-evidence-extractor-v2-v210-relational-semantics.js','psc-v83210-v210-semantic-rule-table-v5.js','qc-evidence-extractor-v2r-v210-multilingual-aliases.js','psc-v83210-v210-semantic-rule-table-v6.js','qc-evidence-extractor-v2s-v210-context-sanitizer.js','psc-v83210-v210-semantic-rule-table-v7.js','qc-evidence-extractor-v2t-v210-contextual-recall.js','psc-v83210-v210-semantic-rule-table-v8-parent-containment.js','qc-evidence-extractor-v3-v211-context-scoped.js','psc-v83211-v210-context-scoped-rule-table.js','qc-evidence-extractor-v3r-v211-preservation.js','psc-v83211-v210-preservation-containment.js','qc-evidence-extractor-v4-v211-relational-recall.js','psc-v83211-v210-v89-relational-recall.js','qc-evidence-extractor-v5-v212-scope-propagation.js','psc-v83212-v211-v90-scope-propagation.js','qc-evidence-extractor-v5r-v212-delegated-decision-preservation.js','psc-v83212-v211-v91-delegated-decision-preservation.js','qc-evidence-extractor-v5s-v212-relational-recall.js','psc-v83212-v211-v92-relational-recall.js']

def sh(*args,cwd=None):
    return subprocess.run(list(args),cwd=cwd,text=True,check=True,capture_output=False)

def canon(o):
    return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()

def sha_obj(o):
    return hashlib.sha256(canon(o)).hexdigest()

def fsha(p):
    return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()

# Hard one-shot guard: never consume sealed semantic evidence twice.
if MARKER.exists():
    raise SystemExit('V8.3.212 V1 semantic first-run marker already exists; refusing rerun')

# Verify frozen V8.3.212 sealed authority and successful transport before loading semantics.
auth=json.loads((SEALED/'V8_3_212_SEALED_AUTHORITY_V1.json').read_text())
audit=json.loads((SEALED/'V8_3_212_PRESEAL_DIVERSITY_AUDIT_V1.json').read_text())
selection=json.loads((SEALED/'V8_3_212_SEALED_SELECTION_V1.json').read_text())
fixture=json.loads((SEALED/'V8_3_212_SEALED_FIXTURE_V1.json').read_text())
gold=json.loads((SEALED/'V8_3_212_INDEPENDENT_GOLD_V1.json').read_text())
membership=json.loads((SEALED/'V8_3_212_SEALED_MEMBERSHIP_V1.json').read_text())
transport=json.loads((SEALED/'V8_3_212_TRANSPORT_VERIFICATION_V1.json').read_text())
assert auth['validated_development_head_sha']==TARGET
assert auth['semantic_authority']=='QCSemanticCoreV92'
assert auth['step_111_authorized'] is False and auth['production_authorized'] is False
checks={'selection':selection,'fixture':fixture,'independent_gold':gold,'membership':membership,'preseal_audit':audit}
for k,o in checks.items():
    assert sha_obj(o)==auth['hashes'][k],k
assert audit['pass'] is True and audit['candidate_count']==180 and audit['selected_count']==60
assert audit['runtime_executed_during_bank_or_selection'] is False
assert audit['semantic_authority_loaded_during_bank_or_selection'] is False
assert audit['selection_uses_runtime_output'] is False
assert transport['conclusion']=='success' and transport['hashes_match'] is True
assert transport['semantic_runtime_executed'] is False and transport['semantic_authority_loaded'] is False
assert transport['batch_a_executed'] is False and transport['batch_b_executed'] is False
assert len(selection['batch_a'])==30 and len(selection['batch_b'])==30
assert set(selection['batch_a']).isdisjoint(selection['batch_b'])

# Pin exact validated V8.3.212 development source.
sh('git','fetch','--depth=1','origin',TARGET)
if WORK.exists(): shutil.rmtree(WORK)
sh('git','worktree','add','--detach',str(WORK),TARGET)
assert subprocess.check_output(['git','-C',str(WORK),'rev-parse','HEAD'],text=True).strip()==TARGET

# Materialize historical carriers required by the validated V92 loader environment.
VAL=WORK/'validation'
for n in ['V8_3_172_V171_V1_FAILURE_REGRESSION','V8_3_172_V171_V1_PREVIOUS_PASS_REGRESSION','V8_3_171_V170_V1_FAILURE_REGRESSION','V8_3_171_V170_V1_PREVIOUS_PASS_REGRESSION','V8_3_169_V168_V1_FAILURE_REGRESSION','V8_3_169_V168_V1_PREVIOUS_PASS_REGRESSION','V8_3_168_V167_V1_FAILURE_REGRESSION','V8_3_168_V167_V1_PREVIOUS_PASS_REGRESSION']:
    p=VAL/f'{n}.json.gz.b64'
    if p.exists():
        (VAL/f'{n}.json').write_bytes(gzip.decompress(base64.b64decode(p.read_text().strip())))
with zipfile.ZipFile(WORK/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip') as z:
    z.extractall(WORK)

# Copy only already-frozen V212 evaluation objects into detached runtime workspace.
runtime=VAL/'v83212-v1-sealed-runtime'; runtime.mkdir(exist_ok=True)
for fn in ['V8_3_212_SEALED_SELECTION_V1.json','V8_3_212_SEALED_FIXTURE_V1.json','V8_3_212_INDEPENDENT_GOLD_V1.json']:
    shutil.copy2(SEALED/fn,runtime/fn)

# Build exact V92 sealed evaluator from the same validated immutable runner lineage.
base=(VAL/'run-v83196-full-regression-sweep-v2.cjs').read_text()
needle="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];"
chain=','.join(repr(x) for x in CHAIN)
assert needle in base
base=base.replace(needle,chain+"];",1)
marker="const files=fs.readdirSync('validation')"
assert marker in base
prefix=base.split(marker)[0]
runner=runtime/'run-v212-v1-sealed.cjs'
tail=r'''
if(!s.QCSemanticCoreV92)throw Error('QCSemanticCoreV92 missing');
const batch=(process.argv[2]||'A').toUpperCase();
const root='validation/v83212-v1-sealed-runtime';
const F=JSON.parse(fs.readFileSync(root+'/V8_3_212_SEALED_FIXTURE_V1.json','utf8'));
const S=JSON.parse(fs.readFileSync(root+'/V8_3_212_SEALED_SELECTION_V1.json','utf8'));
const G=JSON.parse(fs.readFileSync(root+'/V8_3_212_INDEPENDENT_GOLD_V1.json','utf8'));
const gold=new Map(G.cases.map(x=>[x.case_id,x.expected]));
const ids=new Set(batch==='A'?S.batch_a:S.batch_b), cases=F.cases.filter(c=>ids.has(c.case_id));
let passed=0; const results=[];
for(const c of cases){
 const r=s.QCSemanticCoreV92.analyze(c.surface,c.domain);
 const a={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};
 const ge=gold.get(c.case_id); if(!ge)throw Error('missing gold '+c.case_id);
 const e={route:ge.route,families:[...(ge.families||[])].sort(),sequence:!!ge.sequence};
 const ok=JSON.stringify(a)===JSON.stringify(e); if(ok)passed++;
 results.push({case_id:c.case_id,mechanism:c.category,language:c.language,domain:c.domain,pass:ok,expected:e,actual:a,surface:c.surface});
}
const out={authority:'V8.3.212 V1 SEALED BATCH '+batch+' FIRST RUN',run_id:process.env.GITHUB_RUN_ID,run_attempt:process.env.GITHUB_RUN_ATTEMPT,total:cases.length,passed,failed:cases.length-passed,results};
fs.writeFileSync('V8_3_212_V1_BATCH_'+batch+'_FIRST_RUN_RESULTS.json',JSON.stringify(out,null,2));
console.log('Batch',batch,passed+'/'+cases.length); if(passed!==cases.length)process.exit(1);
'''
runner.write_text(prefix+tail)

# Execute A exactly once. B is inaccessible unless A has zero failures.
def run_batch(b):
    cp=subprocess.run(['node',str(runner.relative_to(WORK)),b],cwd=WORK,text=True)
    src=WORK/f'V8_3_212_V1_BATCH_{b}_FIRST_RUN_RESULTS.json'
    if src.exists(): shutil.copy2(src,OUT/src.name)
    return cp.returncode

rca=run_batch('A')
a_path=OUT/'V8_3_212_V1_BATCH_A_FIRST_RUN_RESULTS.json'
a=json.loads(a_path.read_text()) if a_path.exists() else None
marker_payload={'candidate':'V8.3.212','phase':'v1-semantic-first-run','run_id':os.environ.get('GITHUB_RUN_ID'),'run_attempt':os.environ.get('GITHUB_RUN_ATTEMPT'),'validated_development_head_sha':TARGET,'semantic_authority':'QCSemanticCoreV92','batch_a_executed':a is not None,'batch_a_passed':a.get('passed') if a else None,'batch_a_failed':a.get('failed') if a else None,'v211_r4_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False}
MARKER.write_text(json.dumps(marker_payload,indent=2)+'\n')

b=None
if rca==0 and a and a.get('failed')==0:
    run_batch('B')
    b_path=OUT/'V8_3_212_V1_BATCH_B_FIRST_RUN_RESULTS.json'
    b=json.loads(b_path.read_text()) if b_path.exists() else None

status={'candidate':'V8.3.212','phase':'sealed-validation-v1','run_id':os.environ.get('GITHUB_RUN_ID'),'run_attempt':os.environ.get('GITHUB_RUN_ATTEMPT'),'validated_development_head_sha':TARGET,'semantic_authority':'QCSemanticCoreV92','transport_passed':True,'batch_a_executed':a is not None,'batch_a_passed':a.get('passed') if a else None,'batch_a_failed':a.get('failed') if a else None,'batch_b_executed':b is not None,'batch_b_passed':b.get('passed') if b else None,'batch_b_failed':b.get('failed') if b else None,'frozen_on_batch_a_failure':bool(a and a.get('failed',0)>0),'v211_r4_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False}
(OUT/'V8_3_212_V1_SEALED_STATUS.json').write_text(json.dumps(status,indent=2)+'\n')

# Immutable checkpoint + SHA256.
st=REPO/'V8_3_212_V1_SEALED_CHECKPOINT'; shutil.rmtree(st,ignore_errors=True); st.mkdir()
for p in [OUT/'V8_3_212_V1_BATCH_A_FIRST_RUN_RESULTS.json',OUT/'V8_3_212_V1_BATCH_B_FIRST_RUN_RESULTS.json',OUT/'V8_3_212_V1_SEALED_STATUS.json',SEALED/'V8_3_212_SEALED_AUTHORITY_V1.json',SEALED/'V8_3_212_PRESEAL_DIVERSITY_AUDIT_V1.json',SEALED/'V8_3_212_SEALED_SELECTION_V1.json',SEALED/'V8_3_212_SEALED_FIXTURE_V1.json',SEALED/'V8_3_212_INDEPENDENT_GOLD_V1.json',SEALED/'V8_3_212_SEALED_MEMBERSHIP_V1.json',SEALED/'V8_3_212_TRANSPORT_VERIFICATION_V1.json']:
    if p.exists(): shutil.copy2(p,st/p.name)
(st/'SHA256_MANIFEST.txt').write_text(''.join(f'{fsha(p)}  {p.name}\n' for p in sorted(st.iterdir()) if p.is_file()))
z=REPO/'PSC_V8_3_212_V1_SEALED_VALIDATION_CHECKPOINT.zip'
if z.exists(): z.unlink()
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as q:
    for p in sorted(st.iterdir()): q.write(p,p.name)
(REPO/'PSC_V8_3_212_V1_SEALED_VALIDATION_CHECKPOINT_SHA256.txt').write_text(f'{fsha(z)}  {z.name}\n')

success=bool(a and a.get('failed')==0 and b and b.get('failed')==0)
receipt=dict(status); receipt['status']='completed'; receipt['conclusion']='success' if success else 'failure'; receipt['sealed_trigger_repeated']=False
(OUT/'V8_3_212_V1_SEALED_RUN_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(status))
raise SystemExit(0 if success else 1)
