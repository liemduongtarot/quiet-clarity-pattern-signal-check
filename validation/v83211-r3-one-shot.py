import json,pathlib,subprocess,sys,os,shutil,zipfile,hashlib
WORKSPACE=pathlib.Path(os.environ['GITHUB_WORKSPACE']).resolve()
ROOT=pathlib.Path('/tmp/v211-r3-authority')
VALIDATED='ec0646c126ffd60358013663c148f4ffd7080ca2'
CARRIER='bb15242d740bd169e3a8655ef2e002f291ac6acf'
RUN_ID=int(os.environ['GITHUB_RUN_ID']);ATTEMPT=int(os.environ['GITHUB_RUN_ATTEMPT'])
def sh(args,cwd=WORKSPACE,check=True,stdout=None): return subprocess.run(args,cwd=cwd,check=check,text=True,stdout=stdout)
def sha(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
if ROOT.exists(): shutil.rmtree(ROOT)
receipt={'candidate':'V8.3.211','phase':'sealed-validation-r3','target_validated_head':VALIDATED,'carrier_commit':CARRIER,'run_id':RUN_ID,'run_attempt':ATTEMPT,'status':'completed','conclusion':'failure','transport_passed':False,'batch_a_executed':False,'batch_a_passed':None,'batch_a_failed':None,'batch_b_executed':False,'batch_b_passed':None,'batch_b_failed':None,'sealed_trigger_repeated':False,'v210_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False}
try:
    sh(['git','fetch','--depth=1','origin',VALIDATED]);sh(['git','fetch','--depth=1','origin',CARRIER])
    sh(['git','worktree','add','--detach',str(ROOT),VALIDATED])
    cr=ROOT/'validation/v83211-r3-sealed';cr.mkdir(parents=True,exist_ok=True)
    for i in range(5):
        with open(cr/f'part{i}.b64','w') as f:sh(['git','show',f'{CARRIER}:validation/v83211-r3-carrier/part{i}.b64'],stdout=f)
    with open(cr/'MANIFEST.json','w') as f:sh(['git','show',f'{CARRIER}:validation/v83211-r3-carrier/MANIFEST.json'],stdout=f)
    assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()==VALIDATED
    sh([sys.executable,str(WORKSPACE/'validation/v83211-r3-materialize.py'),str(ROOT)])
    meta=json.loads((cr/'V8_3_211_R3_TRANSPORT_METADATA.json').read_text());meta['carrier_commit']=CARRIER;(cr/'V8_3_211_R3_TRANSPORT_METADATA.json').write_text(json.dumps(meta,indent=2)+'\n')
    receipt['transport_passed']=True
    A=ROOT/'V8_3_211_R3_BATCH_A_FIRST_RUN_RESULTS.json';B=ROOT/'V8_3_211_R3_BATCH_B_FIRST_RUN_RESULTS.json'
    assert not A.exists() and not B.exists()
    rcA=subprocess.run(['node','validation/v83211-r3-sealed/run-v211-r3-sealed.cjs','A'],cwd=ROOT).returncode
    assert A.exists();a=json.loads(A.read_text());receipt.update(batch_a_executed=True,batch_a_passed=a['passed'],batch_a_failed=a['failed'])
    rcB=None
    if rcA==0:
        rcB=subprocess.run(['node','validation/v83211-r3-sealed/run-v211-r3-sealed.cjs','B'],cwd=ROOT).returncode
        assert B.exists();b=json.loads(B.read_text());receipt.update(batch_b_executed=True,batch_b_passed=b['passed'],batch_b_failed=b['failed'])
    receipt['conclusion']='success' if rcA==0 and rcB==0 else 'failure'
except Exception as e:
    receipt['error']=f'{type(e).__name__}: {e}'
finally:
    st=ROOT/'V8_3_211_R3_SEALED_CHECKPOINT';st.mkdir(parents=True,exist_ok=True)
    cr=ROOT/'validation/v83211-r3-sealed'
    if cr.exists():
        for p in cr.iterdir():
            if p.is_file() and not p.name.startswith('part'):shutil.copy2(p,st/p.name)
    for n in ['V8_3_211_R3_BATCH_A_FIRST_RUN_RESULTS.json','V8_3_211_R3_BATCH_B_FIRST_RUN_RESULTS.json']:
        p=ROOT/n
        if p.exists():shutil.copy2(p,st/n)
    (st/'STATUS.json').write_text(json.dumps(receipt,indent=2)+'\n')
    (st/'SHA256_MANIFEST.txt').write_text(''.join(f'{sha(p)}  {p.name}\n' for p in sorted(st.iterdir()) if p.is_file()))
    z=WORKSPACE/'PSC_V8_3_211_R3_SEALED_VALIDATION_CHECKPOINT.zip'
    with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as q:
        for p in sorted(st.iterdir()):q.write(p,p.name)
    (WORKSPACE/'PSC_V8_3_211_R3_SEALED_VALIDATION_CHECKPOINT_SHA256.txt').write_text(f'{sha(z)}  {z.name}\n')
    (WORKSPACE/'validation/V8_3_211_R3_ONE_SHOT_RUN_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
sys.exit(0 if receipt['conclusion']=='success' else 1)
