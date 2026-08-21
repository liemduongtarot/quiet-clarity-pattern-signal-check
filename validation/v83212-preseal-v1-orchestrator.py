import os,json,pathlib,subprocess,shutil,traceback
ROOT=pathlib.Path('.').resolve();VAL=ROOT/'validation';REF=VAL/'v83212-preseal-refs';OUT=VAL/'v83212-v1-sealed'
RUN_ID=int(os.environ.get('GITHUB_RUN_ID','0'));RUN_ATTEMPT=int(os.environ.get('GITHUB_RUN_ATTEMPT','0'));HEAD=os.environ.get('GITHUB_SHA','UNKNOWN')
state={'candidate':'V8.3.212','phase':'preseal-v1-diagnostic','run_id':RUN_ID,'run_attempt':RUN_ATTEMPT,'head_sha':HEAD,'validated_development_head_sha':'840cfd3aeea515a335a97615fbc321ebf0e1ce11','semantic_authority':'QCSemanticCoreV92','semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'v211_r4_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False}
def run(cmd,cwd=None):
 print('+',cmd,flush=True); subprocess.run(cmd,shell=True,cwd=cwd or ROOT,check=True)
def receipt(conclusion,phase,error=None):
 r={**state,'conclusion':conclusion,'failed_phase':None if conclusion=='success' else phase,'error':error}
 if OUT.exists():
  try:
   a=json.loads((OUT/'V8_3_212_PRESEAL_DIVERSITY_AUDIT_V1.json').read_text());r.update({'candidate_count':a.get('candidate_count'),'selected_count':a.get('selected_count'),'internal_max_similarity':a.get('internal_max_similarity'),'external_max_similarity':a.get('external_max_similarity'),'external_reference_surfaces':a.get('external_reference_surfaces')})
  except Exception: pass
 VAL.joinpath('V8_3_212_PRESEAL_DIAGNOSTIC_RECEIPT.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2),flush=True)
try:
 phase='fetch-generator'
 run('git fetch --depth=1 origin 343887012d73d8ae3710acb9f07b82637452f63b')
 run('git show 343887012d73d8ae3710acb9f07b82637452f63b:validation/v83212-sealed-v1-generator.py > validation/v83212-sealed-v1-generator.py')
 phase='prior-sealed-refs'
 shutil.rmtree(REF,ignore_errors=True);REF.mkdir(parents=True)
 for v in range(201,210):
  s=str(v)[-2:];run(f'git fetch --depth=1 origin refs/heads/v832{s}-v1-sealed-validation:refs/remotes/origin/v832{s}-v1-sealed-validation');run(f'git show origin/v832{s}-v1-sealed-validation:validation/v832{s}-v1-sealed/V8_3_{v}_SEALED_FIXTURE_V1.json > validation/v83212-preseal-refs/V8_3_{v}_SEALED.json')
 run('git fetch --depth=1 origin refs/heads/v83210-v1-sealed-validation:refs/remotes/origin/v83210-v1-sealed-validation');run('git show origin/v83210-v1-sealed-validation:validation/v83210-v1-sealed/V8_3_210_SEALED_FIXTURE_V1.json > validation/v83212-preseal-refs/V8_3_210_SEALED.json')
 phase='v211-r4-ref'
 run('git fetch --depth=1 origin 6d82282b620f03e397368a6d973b566d8055d2eb');tmp=pathlib.Path('/tmp/v211-r4-preseal-orch');shutil.rmtree(tmp,ignore_errors=True);(tmp/'validation/v83211-r4-frozen').mkdir(parents=True);run(f'git show 6d82282b620f03e397368a6d973b566d8055d2eb:validation/v83211-r4-frozen/generate-r4-carrier.py > {tmp}/validation/v83211-r4-frozen/generate-r4-carrier.py');run('python validation/v83211-r4-frozen/generate-r4-carrier.py',cwd=tmp);shutil.copy2(tmp/'validation/v83211-r4-runtime/V8_3_211_R4_SEALED_FIXTURE.json',REF/'V8_3_211_R4_SEALED.json')
 phase='development-challenge-refs'
 run('python validation/v83211-generalization-600-generator-v1r.py');shutil.copy2(VAL/'V8_3_211_DEVELOPMENT_GENERALIZATION_600_V1.json',REF/'V8_3_211_DEV_600.json');run('python validation/v83212-generalization-800-generator.py');shutil.copy2(VAL/'V8_3_212_DEVELOPMENT_GENERALIZATION_800_V1.json',REF/'V8_3_212_DEV_800.json')
 phase='construct-bank'
 shutil.rmtree(OUT,ignore_errors=True);run('python validation/v83212-sealed-v1-generator-v1r.py')
 phase='verify-authority'
 a=json.loads((OUT/'V8_3_212_PRESEAL_DIVERSITY_AUDIT_V1.json').read_text());u=json.loads((OUT/'V8_3_212_SEALED_AUTHORITY_V1.json').read_text());assert a['pass'] and a['candidate_count']==180 and a['selected_count']==60 and a['internal_max_similarity']<.75 and a['external_cases_at_or_above_0_75']==0 and a['exact_external_duplicates']==0;assert not a['runtime_executed_during_bank_or_selection'] and not a['semantic_authority_loaded_during_bank_or_selection'] and not a['selection_uses_runtime_output'];assert u['validated_development_head_sha']==state['validated_development_head_sha'] and u['semantic_authority']=='QCSemanticCoreV92'
 receipt('success','complete')
except Exception as e:
 receipt('failure',phase,f'{type(e).__name__}: {e}')
 traceback.print_exc();raise
