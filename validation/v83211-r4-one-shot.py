import json,hashlib,pathlib,subprocess,shutil,os,zipfile,gzip,base64,textwrap
REPO=pathlib.Path.cwd()
TARGET='ec0646c126ffd60358013663c148f4ffd7080ca2'
CARRIER='6d82282b620f03e397368a6d973b566d8055d2eb'
WORK=pathlib.Path('/tmp/v211-r4-authority')
OUT=REPO/'validation'/'v83211-r4-run'
OUT.mkdir(parents=True,exist_ok=True)
def sh(*args,cwd=None,check=True):
    return subprocess.run(list(args),cwd=cwd,text=True,check=check,capture_output=False)
def sha_obj(o):
    return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
# Pin exact validated development source and exact frozen carrier.
sh('git','fetch','--depth=1','origin',TARGET)
sh('git','fetch','--depth=1','origin',CARRIER)
if WORK.exists(): shutil.rmtree(WORK)
sh('git','worktree','add','--detach',str(WORK),TARGET)
assert subprocess.check_output(['git','-C',str(WORK),'rev-parse','HEAD'],text=True).strip()==TARGET
frozen=WORK/'validation'/'v83211-r4-frozen'; frozen.mkdir(parents=True,exist_ok=True)
carrier_files=['generate-r4-carrier.py','V8_3_211_R4_SEALED_SELECTION.json','V8_3_211_R4_INDEPENDENT_GOLD.json','V8_3_211_R4_SEALED_MEMBERSHIP.json','V8_3_211_R4_PRESEAL_DIVERSITY_AUDIT.json','V8_3_211_R4_SEALED_AUTHORITY.json']
for fn in carrier_files:
    data=subprocess.check_output(['git','show',f'{CARRIER}:validation/v83211-r4-frozen/{fn}'])
    (frozen/fn).write_bytes(data)
# TRANSPORT ONLY: regenerate bank/fixture/selection, verify every frozen hash; no semantic runtime loaded yet.
sh('python',str(frozen/'generate-r4-carrier.py'),cwd=WORK)
runtime=WORK/'validation'/'v83211-r4-runtime'
auth=json.loads((frozen/'V8_3_211_R4_SEALED_AUTHORITY.json').read_text())
audit=json.loads((frozen/'V8_3_211_R4_PRESEAL_DIVERSITY_AUDIT.json').read_text())
selection_frozen=json.loads((frozen/'V8_3_211_R4_SEALED_SELECTION.json').read_text())
gold=json.loads((frozen/'V8_3_211_R4_INDEPENDENT_GOLD.json').read_text())
membership=json.loads((frozen/'V8_3_211_R4_SEALED_MEMBERSHIP.json').read_text())
bank=json.loads((runtime/'V8_3_211_R4_PRESEAL_CANDIDATE_BANK.json').read_text())
selection=json.loads((runtime/'V8_3_211_R4_SEALED_SELECTION.json').read_text())
fixture=json.loads((runtime/'V8_3_211_R4_SEALED_FIXTURE.json').read_text())
assert auth['validated_development_head_sha']==TARGET
assert auth['semantic_authority']=='QCSemanticCoreV89'
assert auth['step_111_authorized'] is False
assert selection==selection_frozen
checks={'candidate_bank':bank,'selection':selection,'fixture':fixture,'independent_gold':gold,'membership':membership,'preseal_audit':audit}
for k,o in checks.items():
    got=sha_obj(o); want=auth['hashes'][k]
    assert got==want,(k,got,want)
assert audit['pass'] is True and audit['candidate_count']==180 and audit['selected_count']==60
assert audit['internal_max_similarity']<0.75 and audit['external_cases_at_or_above_0_75']==0 and audit['exact_external_duplicates']==0
assert audit['runtime_executed_during_bank_or_selection'] is False
assert audit['semantic_authority_loaded_during_bank_or_selection'] is False
assert audit['selection_uses_runtime_output'] is False
assert len(fixture['cases'])==60 and len(selection['batch_a'])==30 and len(selection['batch_b'])==30
assert set(selection['batch_a']).isdisjoint(selection['batch_b'])
transport={'candidate':'V8.3.211','phase':'r4-transport-only','conclusion':'success','validated_development_head_sha':TARGET,'carrier_commit':CARRIER,'semantic_authority':'QCSemanticCoreV89','semantic_runtime_executed':False,'semantic_authority_loaded':False,'hashes_verified':True,'fixture_materialized':True,'v210_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False}
(OUT/'V8_3_211_R4_TRANSPORT_METADATA.json').write_text(json.dumps(transport,indent=2)+'\n')
# Materialize exact historical application authority only after transport has passed.
needed=['V8_3_172_V171_V1_FAILURE_REGRESSION','V8_3_172_V171_V1_PREVIOUS_PASS_REGRESSION','V8_3_171_V170_V1_FAILURE_REGRESSION','V8_3_171_V170_V1_PREVIOUS_PASS_REGRESSION','V8_3_169_V168_V1_FAILURE_REGRESSION','V8_3_169_V168_V1_PREVIOUS_PASS_REGRESSION','V8_3_168_V167_V1_FAILURE_REGRESSION','V8_3_168_V167_V1_PREVIOUS_PASS_REGRESSION']
for n in needed:
    p=WORK/'validation'/f'{n}.json.gz.b64'
    if p.exists(): (WORK/'validation'/f'{n}.json').write_bytes(gzip.decompress(base64.b64decode(p.read_text().strip())))
with zipfile.ZipFile(WORK/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip') as z: z.extractall(WORK)
# Build exact QCSemanticCoreV89 loader from validated historical runner.
base_runner=(WORK/'validation'/'run-v83196-full-regression-sweep-v2.cjs').read_text()
chain="'psc-v83196-v195-v1-hypothetical-preservation-repair.js','psc-v83197-v196-sealed-a-bounded-repair.js','psc-v83198-v197-sealed-a-bounded-repair.js','psc-v83199-v198-sealed-a-bounded-repair.js','psc-v83200-v199-sealed-a-bounded-repair.js','psc-v83201-v200-sealed-a-bounded-repair.js','psc-v83201-v200-v1-preservation-precedence-repair.js','psc-v83202-v201-sealed-a-bounded-repair.js','psc-v83203-v202-sealed-a-bounded-repair.js','psc-v83204-v203-sealed-a-bounded-repair.js','psc-v83205-v204-sealed-a-bounded-repair.js','psc-v83206-v205-compositional-generalization.js','psc-v83206-v205-v1-preservation-repair.js','psc-v83207-v206-mechanism-cue-repair.js','psc-v83207-v206-v1-preservation-repair.js','psc-v83208-v207-mechanism-cue-repair.js','psc-v83208-v207-v1-preservation-repair.js','psc-v83209-v208-evidence-slot-composition.js','psc-v83209-v208-v1-preservation-repair.js','qc-evidence-extractor-v1-review-candidate.js','qc-evidence-extractor-v1r-review-candidate.js','qc-evidence-extractor-v1r2-review-candidate.js','psc-v83209-semantic-rule-table-v3-review-candidate.js','psc-v83209-v208-semantic-rule-table-promotion.js','qc-evidence-extractor-v1r3-v210-concept-coverage.js','psc-v83210-v209-semantic-rule-table-v4.js','qc-evidence-extractor-v1r4-v210-relational-preservation.js','psc-v83210-v209-v1-relational-preservation.js','qc-evidence-extractor-v2-v210-relational-semantics.js','psc-v83210-v210-semantic-rule-table-v5.js','qc-evidence-extractor-v2r-v210-multilingual-aliases.js','psc-v83210-v210-semantic-rule-table-v6.js','qc-evidence-extractor-v2s-v210-context-sanitizer.js','psc-v83210-v210-semantic-rule-table-v7.js','qc-evidence-extractor-v2t-v210-contextual-recall.js','psc-v83210-v210-semantic-rule-table-v8-parent-containment.js','qc-evidence-extractor-v3-v211-context-scoped.js','psc-v83211-v210-context-scoped-rule-table.js','qc-evidence-extractor-v3r-v211-preservation.js','psc-v83211-v210-preservation-containment.js','qc-evidence-extractor-v4-v211-relational-recall.js','psc-v83211-v210-v89-relational-recall.js'"
base_runner=base_runner.replace("'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];",chain+"];")
marker="const files=fs.readdirSync('validation')"
assert marker in base_runner
prefix=base_runner.split(marker)[0]
runner=WORK/'validation'/'v83211-r4-runtime'/'run-r4-sealed.cjs'
tail=r'''
if(!s.QCSemanticCoreV89)throw Error('QCSemanticCoreV89 missing');
const batch=(process.argv[2]||'A').toUpperCase();
const root='validation/v83211-r4-runtime', frozen='validation/v83211-r4-frozen';
const F=JSON.parse(fs.readFileSync(root+'/V8_3_211_R4_SEALED_FIXTURE.json','utf8'));
const S=JSON.parse(fs.readFileSync(frozen+'/V8_3_211_R4_SEALED_SELECTION.json','utf8'));
const G=JSON.parse(fs.readFileSync(frozen+'/V8_3_211_R4_INDEPENDENT_GOLD.json','utf8'));
const gold=new Map(G.cases.map(x=>[x.case_id,x.expected]));
const ids=new Set(batch==='A'?S.batch_a:S.batch_b), cases=F.cases.filter(c=>ids.has(c.case_id));
let passed=0; const results=[];
for(const c of cases){
 const r=s.QCSemanticCoreV89.analyze(c.surface,c.domain);
 const a={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};
 const ge=gold.get(c.case_id); if(!ge)throw Error('missing gold '+c.case_id);
 const e={route:ge.route,families:[...(ge.families||[])].sort(),sequence:!!ge.sequence};
 const ok=JSON.stringify(a)===JSON.stringify(e); if(ok)passed++;
 results.push({case_id:c.case_id,mechanism:c.category,language:c.language,domain:c.domain,pass:ok,expected:e,actual:a,surface:c.surface});
}
const out={authority:'V8.3.211 R4 SEALED BATCH '+batch+' FIRST RUN',run_id:process.env.GITHUB_RUN_ID,run_attempt:process.env.GITHUB_RUN_ATTEMPT,total:cases.length,passed,failed:cases.length-passed,results};
fs.writeFileSync('V8_3_211_R4_BATCH_'+batch+'_FIRST_RUN_RESULTS.json',JSON.stringify(out,null,2));
console.log('Batch',batch,passed+'/'+cases.length); if(passed!==cases.length)process.exit(1);
'''
runner.write_text(prefix+tail)
# Ensure no prior semantic-first-run marker exists in the invoking branch checkout.
marker_file=REPO/'validation'/'V8_3_211_R4_SEMANTIC_FIRST_RUN_EXECUTED.json'
if marker_file.exists(): raise SystemExit('R4 semantic first-run marker already exists; refusing rerun')
# Execute A exactly once. B only if A passes.
def run_batch(b):
    cp=subprocess.run(['node',str(runner.relative_to(WORK)),b],cwd=WORK,text=True)
    src=WORK/f'V8_3_211_R4_BATCH_{b}_FIRST_RUN_RESULTS.json'
    if src.exists(): shutil.copy2(src,OUT/src.name)
    return cp.returncode
rca=run_batch('A')
a_path=OUT/'V8_3_211_R4_BATCH_A_FIRST_RUN_RESULTS.json'
a=json.loads(a_path.read_text()) if a_path.exists() else None
marker_payload={'candidate':'V8.3.211','phase':'r4-semantic-first-run','run_id':os.environ.get('GITHUB_RUN_ID'),'run_attempt':os.environ.get('GITHUB_RUN_ATTEMPT'),'validated_development_head_sha':TARGET,'carrier_commit':CARRIER,'semantic_authority':'QCSemanticCoreV89','batch_a_executed':a is not None,'batch_a_passed':a.get('passed') if a else None,'batch_a_failed':a.get('failed') if a else None,'v210_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False}
marker_file.write_text(json.dumps(marker_payload,indent=2)+'\n')
b=None; rcb=None
if rca==0 and a and a.get('failed')==0:
    rcb=run_batch('B'); b_path=OUT/'V8_3_211_R4_BATCH_B_FIRST_RUN_RESULTS.json'; b=json.loads(b_path.read_text()) if b_path.exists() else None
status={'candidate':'V8.3.211','phase':'sealed-validation-r4','run_id':os.environ.get('GITHUB_RUN_ID'),'run_attempt':os.environ.get('GITHUB_RUN_ATTEMPT'),'validated_development_head_sha':TARGET,'carrier_commit':CARRIER,'semantic_authority':'QCSemanticCoreV89','transport_passed':True,'batch_a_executed':a is not None,'batch_a_passed':a.get('passed') if a else None,'batch_a_failed':a.get('failed') if a else None,'batch_b_executed':b is not None,'batch_b_passed':b.get('passed') if b else None,'batch_b_failed':b.get('failed') if b else None,'frozen_on_batch_a_failure':bool(a and a.get('failed',0)>0),'v210_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False}
(OUT/'V8_3_211_R4_SEALED_STATUS.json').write_text(json.dumps(status,indent=2)+'\n')
# package checkpoint
stage=REPO/'V8_3_211_R4_SEALED_CHECKPOINT'; stage.mkdir(exist_ok=True)
for p in list(OUT.glob('*.json'))+[frozen/'V8_3_211_R4_SEALED_AUTHORITY.json',frozen/'V8_3_211_R4_PRESEAL_DIVERSITY_AUDIT.json',frozen/'V8_3_211_R4_SEALED_SELECTION.json',frozen/'V8_3_211_R4_INDEPENDENT_GOLD.json',frozen/'V8_3_211_R4_SEALED_MEMBERSHIP.json']:
    if p.exists(): shutil.copy2(p,stage/p.name)
def fsha(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
(stage/'SHA256_MANIFEST.txt').write_text(''.join(f'{fsha(p)}  {p.name}\n' for p in sorted(stage.iterdir()) if p.is_file()))
z=REPO/'PSC_V8_3_211_R4_SEALED_VALIDATION_CHECKPOINT.zip'
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as q:
    for p in sorted(stage.iterdir()): q.write(p,p.name)
(REPO/'PSC_V8_3_211_R4_SEALED_VALIDATION_CHECKPOINT_SHA256.txt').write_text(f'{fsha(z)}  {z.name}\n')
# receipt in invoking checkout for bot commit
success=bool(a and a.get('failed')==0 and b and b.get('failed')==0)
receipt=dict(status); receipt['status']='completed'; receipt['conclusion']='success' if success else 'failure'; receipt['sealed_trigger_repeated']=False
(REPO/'validation'/'V8_3_211_R4_ONE_SHOT_RUN_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(status))
raise SystemExit(0 if success else 1)
