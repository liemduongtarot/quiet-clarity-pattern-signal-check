import json,collections,pathlib
O=pathlib.Path('validation/v83240-v1-sealed')
r=json.loads((O/'V8_3_240_BATCH_A_RESULT_V1.json').read_text());s=json.loads((O/'V8_3_240_BATCH_A_STATUS_V1.json').read_text())
assert s['batch_a_attempt_consumed'] is True and s['batch_a_executed'] is True and s['semantic_runtime_executed'] is True and s['conclusion']=='failure'
f=[x for x in r['results'] if not x['pass']];assert len(f)==10 and r['passed']==20 and r['failed']==10
dist=dict(sorted(collections.Counter(x['category'] for x in f).items()))
out={'candidate':'V8.3.240','phase':'FROZEN_SEALED_AUTOPSY','batch_a_run_id':r['run_id'],'validated_development_head_sha':'11a6b7da05b9ed48bdee76c789c17b83c575152d','semantic_authority':'QCEvidenceExtractorV5AO -> QCSemanticCoreV114','batch_a_total':30,'batch_a_passed':20,'batch_a_failed':10,'batch_a_attempt_consumed':True,'batch_a_rerun_forbidden':True,'batch_b_skipped':True,'batch_b_rerun_forbidden':True,'failure_layer':'ENGINE LOGIC','failure_class':'GENERALIZATION / COMPOSITIONAL RECALL / PRECEDENCE','failure_distribution':dist,'failures':f,'expected_gold_changed':False,'v240_sealed_rerun':False,'production_authorized':False,'step_111_authorized':False}
(O/'V8_3_240_FROZEN_AUTOPSY_V1.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'distribution':dist,'failed':len(f)}))
