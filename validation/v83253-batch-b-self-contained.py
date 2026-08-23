from pathlib import Path
import hashlib,json
src=Path('validation/v83253-batch-a-self-contained.py').read_text()
repls=[
("WORK=pathlib.Path('/tmp/v83253-batch-a-authority')","WORK=pathlib.Path('/tmp/v83253-batch-b-authority')"),
("ATTEMPT=SEALED/'V8_3_253_BATCH_A_ATTEMPT_MARKER.json'","ATTEMPT=SEALED/'V8_3_253_BATCH_B_ATTEMPT_MARKER.json'"),
("RESULT=SEALED/'V8_3_253_BATCH_A_RESULT_V1.json'","RESULT=SEALED/'V8_3_253_BATCH_B_RESULT_V1.json'"),
("STATUS=SEALED/'V8_3_253_BATCH_A_STATUS_V1.json'","STATUS=SEALED/'V8_3_253_BATCH_B_STATUS_V1.json'"),
("'phase':'sealed-batch-a-first-run'","'phase':'sealed-batch-b-first-run'"),
("'batch_b_executed':False,'v251_sealed_rerun':False,'v252_batch_a_rerun':False","'batch_a_executed':True,'v251_sealed_rerun':False,'v253_batch_b_rerun':False"),
("PSC_V8_3_253_V1_BATCH_A_CHECKPOINT","PSC_V8_3_253_V1_BATCH_B_CHECKPOINT"),
("V8_3_253_BATCH_A_RESULT_V1.json","V8_3_253_BATCH_B_RESULT_V1.json"),
("V8_3_253_BATCH_A_STATUS_V1.json","V8_3_253_BATCH_B_STATUS_V1.json"),
("V8_3_253_BATCH_A_ATTEMPT_MARKER.json","V8_3_253_BATCH_B_ATTEMPT_MARKER.json"),
("att['batch']=='A'","att['batch']=='B'"),
("run-v83253-batch-a.cjs","run-v83253-batch-b.cjs"),
("new Set(S.batch_a)","new Set(S.batch_b)"),
("A cardinality ","B cardinality "),
("V8.3.253 V1 SEALED BATCH A FIRST RUN","V8.3.253 V1 SEALED BATCH B FIRST RUN"),
("console.log('V252 A'","console.log('V253 B'"),
("batch_a_attempt_consumed=True,batch_a_executed=True,batch_a_passed=a['passed'],batch_a_failed=a['failed']","batch_b_attempt_consumed=True,batch_b_executed=True,batch_b_passed=a['passed'],batch_b_failed=a['failed']"),
("batch_a_attempt_consumed=True,batch_a_executed=False","batch_b_attempt_consumed=True,batch_b_executed=False")]
for a,b in repls:
    if a not in src: raise SystemExit('missing B transform anchor '+a)
    src=src.replace(a,b)
anchor="A=json.loads((SEALED/'V8_3_253_SEALED_AUTHORITY_V1.json').read_text());pf=json.loads((SEALED/'V8_3_253_STATIC_SEALED_PREFLIGHT_V1.json').read_text());tr=json.loads((SEALED/'V8_3_253_TRANSPORT_VERIFICATION_V1.json').read_text())"
insert="a_status=json.loads((SEALED/'V8_3_253_BATCH_A_STATUS_V1.json').read_text());a_result=json.loads((SEALED/'V8_3_253_BATCH_A_RESULT_V1.json').read_text());assert a_status['conclusion']=='success' and a_status['batch_a_passed']==30 and a_status['batch_a_failed']==0 and a_result['passed']==30 and a_result['failed']==0\n "+anchor
if anchor not in src: raise SystemExit('B gate anchor missing')
src=src.replace(anchor,insert,1)
forbidden=['new Set(S.batch_a)','V8.3.253 V1 SEALED BATCH A FIRST RUN','run-v83253-batch-a.cjs']
left=[x for x in forbidden if x in src]
if left: raise SystemExit('stale B literals '+repr(left))
required=['new Set(S.batch_b)','V8.3.253 V1 SEALED BATCH B FIRST RUN','V8_3_253_BATCH_B_RESULT_V1.json','V8_3_253_BATCH_B_STATUS_V1.json','run-v83253-batch-b.cjs',"a_result['passed']==30"]
miss=[x for x in required if x not in src]
if miss: raise SystemExit('missing B literals '+repr(miss))
compile(src,'validation/v83253-batch-b-materialized.py','exec')
Path('validation/v83253-batch-b-materialized.py').write_text(src)
receipt={'candidate':'V8.3.253','phase':'batch-b-runner-materialization','source_runner_sha256':hashlib.sha256(Path('validation/v83253-batch-a-self-contained.py').read_bytes()).hexdigest(),'batch_b_runner_sha256':hashlib.sha256(src.encode()).hexdigest(),'requires_batch_a_30_of_30':True,'semantic_authority':'QCEvidenceExtractorV5AY -> QCSemanticCoreV124','expected_gold_changed':False,'semantic_change':False,'pass':True,'batch_b_executed':False,'step_111_authorized':False}
Path('validation/v83253-v1-sealed/V8_3_253_BATCH_B_RUNNER_MATERIALIZATION_V1.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
