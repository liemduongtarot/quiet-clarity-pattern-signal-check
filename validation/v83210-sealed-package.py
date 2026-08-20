import json,pathlib,zipfile,hashlib,shutil,os
root=pathlib.Path('validation/v83210-v1-sealed')
st=pathlib.Path('V8_3_210_SEALED_CHECKPOINT');st.mkdir(exist_ok=True)
base=['V8_3_210_SEALED_AUTHORITY_V1.json','V8_3_210_PRESEAL_CANDIDATE_BANK_V1.json','V8_3_210_PRESEAL_DIVERSITY_AUDIT_V1.json','V8_3_210_SEALED_SELECTION_V1.json','V8_3_210_SEALED_FIXTURE_V1.json','V8_3_210_INDEPENDENT_GOLD_V1.json','V8_3_210_SEALED_MEMBERSHIP_V1.json','V8_3_210_TRANSPORT_METADATA_V1.json']
for n in base:
    p=root/n
    if p.exists():shutil.copy2(p,st/n)
for n in ['V8_3_210_BATCH_A_FIRST_RUN_RESULTS.json','V8_3_210_BATCH_B_FIRST_RUN_RESULTS.json']:
    p=pathlib.Path(n)
    if p.exists():shutil.copy2(p,st/n)
A=pathlib.Path('V8_3_210_BATCH_A_FIRST_RUN_RESULTS.json');B=pathlib.Path('V8_3_210_BATCH_B_FIRST_RUN_RESULTS.json')
a=json.loads(A.read_text()) if A.exists() else None;b=json.loads(B.read_text()) if B.exists() else None
status={'candidate':'V8.3.210','phase':'sealed-validation-v1','run_id':int(os.environ['GITHUB_RUN_ID']),'run_attempt':int(os.environ['GITHUB_RUN_ATTEMPT']),'semantic_authority':'QCSemanticCoreV86','batch_a_executed':a is not None,'batch_a_passed':a.get('passed') if a else None,'batch_a_failed':a.get('failed') if a else None,'batch_b_executed':b is not None,'batch_b_passed':b.get('passed') if b else None,'batch_b_failed':b.get('failed') if b else None,'frozen_on_batch_a_failure':bool(a and a.get('failed',0)>0),'v209_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False}
(st/'V8_3_210_SEALED_STATUS.json').write_text(json.dumps(status,indent=2)+'\n')
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
(st/'SHA256_MANIFEST.txt').write_text(''.join(f'{sha(p)}  {p.name}\n' for p in sorted(st.iterdir()) if p.is_file()))
z=pathlib.Path('PSC_V8_3_210_V1_SEALED_VALIDATION_CHECKPOINT.zip')
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as q:
    for p in sorted(st.iterdir()):q.write(p,p.name)
pathlib.Path('PSC_V8_3_210_V1_SEALED_VALIDATION_CHECKPOINT_SHA256.txt').write_text(f'{sha(z)}  {z.name}\n')
print(status)
