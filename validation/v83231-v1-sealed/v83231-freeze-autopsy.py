import json,pathlib,collections
O=pathlib.Path('validation/v83231-v1-sealed')
a=json.loads((O/'V8_3_231_BATCH_A_RESULT_V1.json').read_text());s=json.loads((O/'V8_3_231_BATCH_A_STATUS_V1.json').read_text())
assert a['total']==30 and a['passed']==18 and a['failed']==12 and s['batch_a_attempt_consumed'] is True and s['frozen_on_batch_a_failure'] is True
fails=[x for x in a['results'] if not x['pass']];assert len(fails)==12
dist=dict(sorted(collections.Counter(x['category'] for x in fails).items()))
route_conf=[]
for k,v in sorted(collections.Counter((x['category'],x['expected']['route'],x['actual']['route']) for x in fails).items()):route_conf.append({'category':k[0],'expected_route':k[1],'actual_route':k[2],'count':v})
family_conf=[]
for k,v in sorted(collections.Counter((x['category'],tuple(x['expected']['families']),tuple(x['actual']['families']),bool(x['expected']['sequence']),bool(x['actual']['sequence'])) for x in fails).items()):family_conf.append({'category':k[0],'expected_families':list(k[1]),'actual_families':list(k[2]),'expected_sequence':k[3],'actual_sequence':k[4],'count':v})
out={'candidate':'V8.3.231','phase':'FROZEN_SEALED_AUTOPSY','batch_a_run_id':a['run_id'],'validated_development_head_sha':'8be235fe1d00396dc43de3ac82990f4255bb73a7','semantic_authority':'QCEvidenceExtractorV5AH -> QCSemanticCoreV107','batch_a_total':30,'batch_a_passed':18,'batch_a_failed':12,'batch_a_attempt_consumed':True,'batch_a_rerun_forbidden':True,'batch_b_skipped':True,'batch_b_rerun_forbidden':True,'failure_layer':'ENGINE LOGIC','failure_class':'GENERALIZATION / COMPOSITIONAL RECALL / PRECEDENCE','failure_distribution':dist,'route_confusions':route_conf,'family_confusions':family_conf,'failures':fails,'expected_gold_changed':False,'v231_sealed_rerun':False,'production_authorized':False,'step_111_authorized':False}
(O/'V8_3_231_FROZEN_AUTOPSY_V1.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'distribution':dist,'fail_ids':[x['case_id'] for x in fails]}))
