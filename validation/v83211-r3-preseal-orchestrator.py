import subprocess, pathlib, json, hashlib, shutil, zipfile, os
ROOT=pathlib.Path('.')
REF=ROOT/'validation'/'preseal_refs'; REF.mkdir(parents=True,exist_ok=True)
OUT=ROOT/'validation'/'v83211-r3-preseal'; OUT.mkdir(parents=True,exist_ok=True)
SRC=ROOT/'validation'/'v83211-v1-sealed'; SRC.mkdir(parents=True,exist_ok=True)
def sh(*args, capture=False):
    r=subprocess.run(args,check=True,text=True,capture_output=capture)
    return r.stdout if capture else ''
def show(ref,path,dest):
    data=sh('git','show',f'{ref}:{path}',capture=True); pathlib.Path(dest).write_text(data)
for v in range(201,210):
    s=str(v)[-2:]
    br=f'v8320{s}-v1-sealed-validation'
    sh('git','fetch','--depth=1','origin',f'refs/heads/{br}:refs/remotes/origin/{br}')
    show(f'origin/{br}',f'validation/v8320{s}-v1-sealed/V8_3_{v}_SEALED_FIXTURE_V1.json',REF/f'V8_3_{v}_SEALED_FIXTURE_REFERENCE.json')
br='v83210-v1-sealed-validation';sh('git','fetch','--depth=1','origin',f'refs/heads/{br}:refs/remotes/origin/{br}')
show(f'origin/{br}','validation/v83210-v1-sealed/V8_3_210_SEALED_FIXTURE_V1.json',REF/'V8_3_210_SEALED_FIXTURE_REFERENCE.json')
subprocess.run(['python','validation/v83211-generalization-600-generator-v1r.py'],check=True)
shutil.copy2('validation/V8_3_211_DEVELOPMENT_GENERALIZATION_600_V1.json',REF/'V8_3_211_DEVELOPMENT_GENERALIZATION_600_REFERENCE.json')
carrier='f2907d7107089dbf5d01ce5d193a0d8fb6b278dc';sh('git','fetch','--depth=1','origin',carrier)
show(carrier,'validation/v83211-preseal-generator.py','validation/v83211-preseal-generator.py')
show(carrier,'validation/v83211-preseal-generator-v1r.py','validation/v83211-preseal-generator-v1r.py')
subprocess.run(['python','validation/v83211-preseal-generator-v1r.py'],check=True)
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
auth=json.loads((SRC/'V8_3_211_SEALED_AUTHORITY_V1.json').read_text()); audit=json.loads((SRC/'V8_3_211_PRESEAL_DIVERSITY_AUDIT_V1.json').read_text())
assert auth['validated_development_head_sha']=='ec0646c126ffd60358013663c148f4ffd7080ca2'
assert auth['semantic_authority']=='QCSemanticCoreV89'
assert audit['pass'] is True and audit['candidate_count']==180 and audit['selected_count']==60
assert audit['internal_max_similarity']<.75 and audit['external_cases_at_or_above_0_75']==0 and audit['exact_external_duplicates']==0
assert audit['runtime_executed_during_bank_or_selection'] is False and audit['semantic_authority_loaded_during_bank_or_selection'] is False and audit['selection_uses_runtime_output'] is False
files={'candidate_bank':'V8_3_211_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_211_SEALED_SELECTION_V1.json','fixture':'V8_3_211_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_211_INDEPENDENT_GOLD_V1.json','membership':'V8_3_211_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_211_PRESEAL_DIVERSITY_AUDIT_V1.json'}
for k,fn in files.items():
    obj=json.loads((SRC/fn).read_text());got=hashlib.sha256(canon(obj)).hexdigest();assert got==auth['hashes'][k],(k,got,auth['hashes'][k]);shutil.copy2(SRC/fn,OUT/fn)
shutil.copy2(SRC/'V8_3_211_SEALED_AUTHORITY_V1.json',OUT/'V8_3_211_SEALED_AUTHORITY_V1.json')
receipt={'candidate':'V8.3.211','phase':'preseal-r3-direct-carrier','run_id':int(os.environ.get('GITHUB_RUN_ID','0')),'run_attempt':int(os.environ.get('GITHUB_RUN_ATTEMPT','0')),'source_validated_head':'ec0646c126ffd60358013663c148f4ffd7080ca2','conclusion':'success','candidate_count':audit['candidate_count'],'selected_count':audit['selected_count'],'internal_max_similarity':audit['internal_max_similarity'],'external_max_similarity':audit['external_max_similarity'],'semantic_runtime_executed':False,'semantic_authority_loaded':False,'v210_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False}
(OUT/'V8_3_211_R3_PRESEAL_RUN_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n')
st=pathlib.Path('V8_3_211_R3_PRESEAL_CHECKPOINT');st.mkdir(exist_ok=True)
for p in OUT.iterdir():
    if p.is_file():shutil.copy2(p,st/p.name)
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
(st/'SHA256_MANIFEST.txt').write_text(''.join(f'{sha(p)}  {p.name}\n' for p in sorted(st.iterdir()) if p.is_file()))
z=pathlib.Path('PSC_V8_3_211_R3_PRESEAL_CHECKPOINT.zip')
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as q:
    for p in sorted(st.iterdir()):q.write(p,p.name)
pathlib.Path('PSC_V8_3_211_R3_PRESEAL_CHECKPOINT_SHA256.txt').write_text(f'{sha(z)}  {z.name}\n')
print(json.dumps(receipt))
