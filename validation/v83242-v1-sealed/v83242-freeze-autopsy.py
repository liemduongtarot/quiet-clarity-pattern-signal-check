import json,pathlib,collections
O=pathlib.Path('validation/v83242-v1-sealed')
r=json.loads((O/'V8_3_242_BATCH_A_RESULT_V1.json').read_text());s=json.loads((O/'V8_3_242_BATCH_A_STATUS_V1.json').read_text())
assert r['total']==30 and r['passed']==16 and r['failed']==14 and s['batch_a_attempt_consumed'] is True and s['semantic_runtime_executed'] is True
fails=[x for x in r['results'] if not x['pass']];dist=dict(sorted(collections.Counter(x['category'] for x in fails).items()))
out={'candidate':'V8.3.242','phase':'FROZEN_SEALED_AUTOPSY','batch_a_run_id':r['run_id'],'validated_development_head_sha':'79645f8973c9e8288119f79318b39646e2feb00f','semantic_authority':'QCEvidenceExtractorV5AQ -> QCSemanticCoreV116','batch_a_total':30,'batch_a_passed':16,'batch_a_failed':14,'batch_a_attempt_consumed':True,'batch_a_rerun_forbidden':True,'batch_b_skipped':True,'batch_b_rerun_forbidden':True,'failure_layer':'ENGINE LOGIC','failure_class':'GENERALIZATION / COMPOSITIONAL RECALL / PRECEDENCE','failure_distribution':dist,'failures':fails,'expected_gold_changed':False,'v242_sealed_rerun':False,'production_authorized':False,'step_111_authorized':False}
(O/'V8_3_242_FROZEN_AUTOPSY_V1.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'distribution':dist,'failed':len(fails)}))
