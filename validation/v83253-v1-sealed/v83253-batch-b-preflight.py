import json,hashlib,pathlib
R=pathlib.Path('.'); O=R/'validation/v83253-v1-sealed'
def hb(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
a_status=json.loads((O/'V8_3_253_BATCH_A_STATUS_V1.json').read_text())
a_result=json.loads((O/'V8_3_253_BATCH_A_RESULT_V1.json').read_text())
mat=json.loads((O/'V8_3_253_BATCH_B_RUNNER_MATERIALIZATION_V1.json').read_text())
auth=json.loads((O/'V8_3_253_SEALED_AUTHORITY_V1.json').read_text())
sel=json.loads((O/'V8_3_253_SEALED_SELECTION_V1.json').read_text())
assert a_status['conclusion']=='success' and a_status['batch_a_passed']==30 and a_status['batch_a_failed']==0
assert a_result['passed']==30 and a_result['failed']==0 and a_result['total']==30
assert mat['pass'] is True and mat['requires_batch_a_30_of_30'] is True and mat['semantic_change'] is False and mat['expected_gold_changed'] is False
assert auth['preseal_pass'] is True and auth['semantic_authority']=='QCEvidenceExtractorV5AY -> QCSemanticCoreV124'
assert len(sel['batch_a'])==30 and len(sel['batch_b'])==30 and set(sel['batch_a']).isdisjoint(sel['batch_b'])
runner=pathlib.Path('validation/v83253-batch-b-materialized.py')
assert runner.exists() and hb(runner)==mat['batch_b_runner_sha256']
text=runner.read_text()
required=['new Set(S.batch_b)','V8.3.253 V1 SEALED BATCH B FIRST RUN','V8_3_253_BATCH_B_RESULT_V1.json','V8_3_253_BATCH_B_STATUS_V1.json','run-v83253-batch-b.cjs',"a_result['passed']==30",'QCSemanticCoreV124.analyze','QCEvidenceExtractorV5AY -> QCSemanticCoreV124']
for x in required: assert x in text, x
forbidden=['new Set(S.batch_a)','V8.3.253 V1 SEALED BATCH A FIRST RUN','run-v83253-batch-a.cjs']
for x in forbidden: assert x not in text, x
attempt_absent=not (O/'V8_3_253_BATCH_B_ATTEMPT_MARKER.json').exists()
result_absent=not (O/'V8_3_253_BATCH_B_RESULT_V1.json').exists()
status_absent=not (O/'V8_3_253_BATCH_B_STATUS_V1.json').exists()
assert attempt_absent and result_absent and status_absent
out={'candidate':'V8.3.253','phase':'batch-b-hardened-preflight','batch_a_30_of_30_verified':True,'batch_b_runner_hash_verified':True,'batch_b_selection_count':30,'semantic_authority':'QCEvidenceExtractorV5AY -> QCSemanticCoreV124','semantic_change':False,'expected_gold_changed':False,'batch_b_attempt_absent':attempt_absent,'batch_b_result_absent':result_absent,'batch_b_status_absent':status_absent,'batch_b_executed':False,'step_111_authorized':False,'pass':True}
(O/'V8_3_253_BATCH_B_PREFLIGHT_V1.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps(out))
