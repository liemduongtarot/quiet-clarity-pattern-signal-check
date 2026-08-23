import json,hashlib,pathlib,zipfile
R=pathlib.Path('.'); O=R/'validation/v83253-v1-sealed'
DEV='89db04ec936af998c14d2f0451ef87270ea8e349'; BASE='59d1d564a2208ae4ce5899262ad094357a20402a'; SEM='QCEvidenceExtractorV5AY -> QCSemanticCoreV124'
def canon(o): return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def ho(o): return hashlib.sha256(canon(o)).hexdigest()
def hb(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
auth=json.loads((O/'V8_3_253_SEALED_AUTHORITY_V1.json').read_text())
assert auth['validated_development_head_sha']==DEV and auth['base_exact_development_sha']==BASE and auth['semantic_authority']==SEM and auth['preseal_pass'] is True
files={'candidate_bank':'V8_3_253_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_253_SEALED_SELECTION_V1.json','fixture':'V8_3_253_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_253_INDEPENDENT_GOLD_V1.json','membership':'V8_3_253_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_253_PRESEAL_DIVERSITY_AUDIT_V1.json'}
hash_match={k:ho(json.loads((O/n).read_text()))==auth['hashes'][k] for k,n in files.items()}; assert all(hash_match.values())
sel=json.loads((O/'V8_3_253_SEALED_SELECTION_V1.json').read_text()); assert len(sel['batch_a'])==30 and len(sel['batch_b'])==30 and set(sel['batch_a']).isdisjoint(sel['batch_b'])
a_att=json.loads((O/'V8_3_253_BATCH_A_ATTEMPT_MARKER.json').read_text()); b_att=json.loads((O/'V8_3_253_BATCH_B_ATTEMPT_MARKER.json').read_text())
a_stat=json.loads((O/'V8_3_253_BATCH_A_STATUS_V1.json').read_text()); b_stat=json.loads((O/'V8_3_253_BATCH_B_STATUS_V1.json').read_text())
a_res=json.loads((O/'V8_3_253_BATCH_A_RESULT_V1.json').read_text()); b_res=json.loads((O/'V8_3_253_BATCH_B_RESULT_V1.json').read_text())
assert a_att['run_attempt']=='1' and b_att['run_attempt']=='1' and a_att['reserved_before_semantic_execution'] and b_att['reserved_before_semantic_execution']
assert a_att['semantic_runtime_executed'] is False and b_att['semantic_runtime_executed'] is False
assert a_stat['conclusion']=='success' and a_stat['batch_a_passed']==30 and a_stat['batch_a_failed']==0 and a_stat['semantic_runtime_executed'] is True
assert b_stat['conclusion']=='success' and b_stat['batch_b_passed']==30 and b_stat['batch_b_failed']==0 and b_stat['semantic_runtime_executed'] is True
assert a_res['total']==30 and a_res['passed']==30 and a_res['failed']==0 and b_res['total']==30 and b_res['passed']==30 and b_res['failed']==0
assert a_stat.get('v252_batch_a_rerun') is False and b_stat.get('v253_batch_b_rerun') is False
amat=json.loads((O/'V8_3_253_RUNNER_MATERIALIZATION_V1.json').read_text()); bmat=json.loads((O/'V8_3_253_BATCH_B_RUNNER_MATERIALIZATION_V1.json').read_text()); bpf=json.loads((O/'V8_3_253_BATCH_B_PREFLIGHT_V1.json').read_text())
assert amat['pass'] is True and bmat['pass'] is True and bpf['pass'] is True and bmat['requires_batch_a_30_of_30'] is True
assert hb('validation/v83253-batch-a-self-contained.py')==amat['runner_sha256']
assert hb('validation/v83253-batch-b-materialized.py')==bmat['batch_b_runner_sha256']
for obj in [auth,a_att,b_att,a_stat,b_stat,amat,bmat,bpf]: assert obj.get('step_111_authorized',False) is False
for obj in [auth,a_att,b_att,a_stat,b_stat]: assert obj.get('production_authorized',False) is False
reg=json.loads((R/'validation/V8_3_253_V124_REGRESSION_RECEIPT.json').read_text()); assert reg['conclusion']=='success' and reg['immutable_regression_passed']==1470 and reg['v252_batch_a_previous_failures_repaired']==1 and reg['v252_batch_a_previous_passes_preserved']==29 and reg['expected_gold_changed'] is False
out={'candidate':'V8.3.253','phase':'post-b-integrity-gate','validated_development_head_sha':DEV,'base_exact_development_sha':BASE,'semantic_authority':SEM,'development_regression':'1470/1470','v252_residual_repaired':'1/1','v252_previous_passes_preserved':'29/29','preseal_pass':True,'canonical_hashes_match':hash_match,'batch_a_run_id':a_att['run_id'],'batch_a':'30/30','batch_b_run_id':b_att['run_id'],'batch_b':'30/30','batch_a_single_attempt':True,'batch_b_single_attempt':True,'batch_a_b_disjoint':True,'a_runner_hash_verified':True,'b_runner_hash_verified':True,'semantic_runtime_executed_a':True,'semantic_runtime_executed_b':True,'expected_gold_changed':False,'step_111_authorized':False,'production_authorized':False,'pass':True}
(O/'V8_3_253_POST_B_INTEGRITY_GATE_V1.json').write_text(json.dumps(out,indent=2)+'\n')
ready={'candidate':'V8.3.253','phase':'step-111-readiness','status':'READY_PENDING_EXPLICIT_OWNER_AUTHORIZATION','all_pre_step_111_gates_pass':True,'validated_development_head_sha':DEV,'semantic_authority':SEM,'batch_a':'30/30','batch_b':'30/30','step_111_authorized':False,'step_111_executed':False,'production_authorized':False,'instruction':'STOP BEFORE STEP 111 UNTIL EXPLICIT OWNER AUTHORIZATION'}
(O/'V8_3_253_STEP_111_READINESS_V1.json').write_text(json.dumps(ready,indent=2)+'\n')
zip_path=R/'PSC_V8_3_253_PRE_STEP_111_CHECKPOINT.zip'
if zip_path.exists(): zip_path.unlink()
include=[R/'validation/V8_3_253_V124_REGRESSION_RECEIPT.json',O/'V8_3_253_SEALED_AUTHORITY_V1.json',O/'V8_3_253_PRESEAL_DIVERSITY_AUDIT_V1.json',O/'V8_3_253_BATCH_A_ATTEMPT_MARKER.json',O/'V8_3_253_BATCH_A_STATUS_V1.json',O/'V8_3_253_BATCH_A_RESULT_V1.json',O/'V8_3_253_BATCH_B_ATTEMPT_MARKER.json',O/'V8_3_253_BATCH_B_STATUS_V1.json',O/'V8_3_253_BATCH_B_RESULT_V1.json',O/'V8_3_253_RUNNER_MATERIALIZATION_V1.json',O/'V8_3_253_BATCH_B_RUNNER_MATERIALIZATION_V1.json',O/'V8_3_253_BATCH_B_PREFLIGHT_V1.json',O/'V8_3_253_POST_B_INTEGRITY_GATE_V1.json',O/'V8_3_253_STEP_111_READINESS_V1.json']
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
    for p in include: z.write(p,p.name)
sha=hb(zip_path); (R/'PSC_V8_3_253_PRE_STEP_111_CHECKPOINT_SHA256.txt').write_text(sha+'  '+zip_path.name+'\n')
print(json.dumps(out)); print(json.dumps(ready)); print(sha)
