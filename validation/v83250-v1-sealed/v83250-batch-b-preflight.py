import json,hashlib,pathlib
R=pathlib.Path('.');O=R/'validation/v83250-v1-sealed'
def hb(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
a_status=json.loads((O/'V8_3_250_BATCH_A_STATUS_V1.json').read_text());a_result=json.loads((O/'V8_3_250_BATCH_A_RESULT_V1.json').read_text())
assert a_status['conclusion']=='success' and a_status['batch_a_passed']==30 and a_status['batch_a_failed']==0
assert a_result['passed']==30 and a_result['failed']==0 and a_result['total']==30
mat=json.loads((O/'V8_3_250_BATCH_B_RUNNER_MATERIALIZATION_V1.json').read_text());assert mat['pass'] is True and mat['requires_batch_a_30_of_30'] is True
runner=R/'validation/v83250-batch-b-materialized.py';assert runner.exists() and hb(runner)==mat['batch_b_runner_sha256']
a_runner=R/'validation/v83250-batch-a-self-contained.py';assert hb(a_runner)==mat['source_runner_sha256']
text=runner.read_text()
required=['new Set(S.batch_b)','V8.3.250 V1 SEALED BATCH B FIRST RUN','V8_3_250_BATCH_B_RESULT_V1.json','V8_3_250_BATCH_B_STATUS_V1.json','run-v83250-batch-b.cjs',"a_result['passed']==30",'QCSemanticCoreV121.analyze','QCEvidenceExtractorV5AV -> QCSemanticCoreV121']
stale=['new Set(S.batch_a)','V8.3.250 V1 SEALED BATCH A FIRST RUN','run-v83250-batch-a.cjs','QCSemanticCoreV120.analyze']
req={x:(x in text) for x in required};st={x:(x in text) for x in stale};assert all(req.values()) and not any(st.values())
assert (O/'V8_3_250_SEALED_FIRST_RUN_MARKER.json').exists()
assert not (O/'V8_3_250_BATCH_B_ATTEMPT_MARKER.json').exists()
assert not (O/'V8_3_250_BATCH_B_RESULT_V1.json').exists()
assert not (O/'V8_3_250_BATCH_B_STATUS_V1.json').exists()
auth=json.loads((O/'V8_3_250_SEALED_AUTHORITY_V1.json').read_text());assert auth['validated_development_head_sha']=='514cbcb34fbe336033c8f8858a53415371137973' and auth['semantic_authority']=='QCEvidenceExtractorV5AV -> QCSemanticCoreV121'
out={'candidate':'V8.3.250','phase':'batch-b-preflight','batch_a_30_of_30':True,'batch_b_runner_hash_verified':True,'runner_required_scan':req,'runner_stale_scan':st,'batch_b_attempt_marker_absent':True,'batch_b_result_absent':True,'batch_b_status_absent':True,'semantic_authority':'QCEvidenceExtractorV5AV -> QCSemanticCoreV121','semantic_change':False,'expected_gold_changed':False,'batch_b_executed':False,'step_111_authorized':False,'pass':True}
(O/'V8_3_250_BATCH_B_PREFLIGHT_V1.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
