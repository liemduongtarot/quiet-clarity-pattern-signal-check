import json,pathlib,collections
O=pathlib.Path('validation/v83233-v1-sealed')
r=json.loads((O/'V8_3_233_BATCH_A_RESULT_V1.json').read_text());s=json.loads((O/'V8_3_233_BATCH_A_STATUS_V1.json').read_text())
assert r['total']==30 and r['passed']==20 and r['failed']==10 and s['batch_a_attempt_consumed'] is True and s['batch_a_executed'] is True and s['semantic_runtime_executed'] is True
fails=[x for x in r['results'] if not x['pass']];assert len(fails)==10
by=collections.Counter(x['category'] for x in fails)
route=collections.Counter((x['category'],x['expected']['route'],x['actual']['route']) for x in fails)
fam=collections.Counter((x['category'],tuple(x['expected']['families']),tuple(x['actual']['families']),bool(x['expected']['sequence']),bool(x['actual']['sequence'])) for x in fails)
out={'candidate':'V8.3.233','phase':'FROZEN_SEALED_AUTOPSY','batch_a_run_id':r['run_id'],'validated_development_head_sha':r['validated_development_head_sha'],'semantic_authority':r['semantic_authority'],'batch_a_total':30,'batch_a_passed':20,'batch_a_failed':10,'batch_a_attempt_consumed':True,'batch_a_rerun_forbidden':True,'batch_b_skipped':True,'batch_b_rerun_forbidden':True,'failure_layer':'ENGINE LOGIC','failure_class':'GENERALIZATION / COMPOSITIONAL RECALL / PRECEDENCE','failure_distribution':dict(sorted(by.items())),'route_confusions':[{'category':k[0],'expected_route':k[1],'actual_route':k[2],'count':v} for k,v in sorted(route.items())],'family_confusions':[{'category':k[0],'expected_families':list(k[1]),'actual_families':list(k[2]),'expected_sequence':k[3],'actual_sequence':k[4],'count':v} for k,v in sorted(fam.items())],'failures':fails,'expected_gold_changed':False,'v233_sealed_rerun':False,'production_authorized':False,'step_111_authorized':False}
(O/'V8_3_233_FROZEN_AUTOPSY_V1.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out))
