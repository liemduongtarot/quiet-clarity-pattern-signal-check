import json,pathlib,collections
O=pathlib.Path('validation/v83230-v1-sealed')
r=json.loads((O/'V8_3_230_BATCH_A_RESULT_V1.json').read_text());s=json.loads((O/'V8_3_230_BATCH_A_STATUS_V1.json').read_text())
assert r['total']==30 and r['passed']==14 and r['failed']==16 and s['batch_a_attempt_consumed'] is True and s['semantic_runtime_executed'] is True and s['semantic_failure'] is True
fails=[x for x in r['results'] if not x['pass']];passes=[x for x in r['results'] if x['pass']];assert len(fails)==16 and len(passes)==14
dist=dict(sorted(collections.Counter(x['category'] for x in fails).items()))
route_conf=collections.Counter((x['category'],x['expected']['route'],x['actual']['route']) for x in fails)
family_conf=collections.Counter((x['category'],tuple(x['expected'].get('families',[])),tuple(x['actual'].get('families',[])),bool(x['expected'].get('sequence')),bool(x['actual'].get('sequence'))) for x in fails)
out={'candidate':'V8.3.230','phase':'FROZEN_SEALED_AUTOPSY','batch_a_run_id':r['run_id'],'validated_development_head_sha':r['validated_development_head_sha'],'semantic_authority':r['semantic_authority'],'batch_a_total':30,'batch_a_passed':14,'batch_a_failed':16,'batch_a_attempt_consumed':True,'batch_a_rerun_forbidden':True,'batch_b_skipped':True,'batch_b_rerun_forbidden':True,'failure_layer':'ENGINE LOGIC','failure_class':'GENERALIZATION / COMPOSITIONAL RECALL / PRECEDENCE','failure_distribution':dist,'route_confusions':[{'category':k[0],'expected_route':k[1],'actual_route':k[2],'count':v} for k,v in sorted(route_conf.items())],'family_confusions':[{'category':k[0],'expected_families':list(k[1]),'actual_families':list(k[2]),'expected_sequence':k[3],'actual_sequence':k[4],'count':v} for k,v in sorted(family_conf.items(),key=lambda z:str(z[0]))],'failures':fails,'passes':passes,'expected_gold_changed':False,'v230_sealed_rerun':False,'production_authorized':False,'step_111_authorized':False,'conclusion':'FROZEN_FAILURE'}
(O/'V8_3_230_FROZEN_AUTOPSY_V1.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'distribution':dist,'route_confusions':out['route_confusions'],'family_confusions':out['family_confusions']}))
