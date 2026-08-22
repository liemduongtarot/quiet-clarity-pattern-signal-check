import json,pathlib,collections
O=pathlib.Path('validation/v83238-v1-sealed')
r=json.loads((O/'V8_3_238_BATCH_A_RESULT_V1.json').read_text());s=json.loads((O/'V8_3_238_BATCH_A_STATUS_V1.json').read_text())
assert r['total']==30 and r['passed']==18 and r['failed']==12
assert s['batch_a_attempt_consumed'] is True and s['batch_a_executed'] is True and s['semantic_runtime_executed'] is True and s['conclusion']=='failure'
f=[x for x in r['results'] if not x['pass']];assert len(f)==12
dist=dict(sorted(collections.Counter(x['category'] for x in f).items()))
rc=collections.Counter((x['category'],x['expected']['route'],x['actual']['route']) for x in f)
fc=collections.Counter((x['category'],tuple(x['expected']['families']),tuple(x['actual']['families']),bool(x['expected']['sequence']),bool(x['actual']['sequence'])) for x in f)
out={'candidate':'V8.3.238','phase':'FROZEN_SEALED_AUTOPSY','batch_a_run_id':r['run_id'],'validated_development_head_sha':r['validated_development_head_sha'],'semantic_authority':r['semantic_authority'],'batch_a_total':30,'batch_a_passed':18,'batch_a_failed':12,'batch_a_attempt_consumed':True,'batch_a_rerun_forbidden':True,'batch_b_skipped':True,'batch_b_rerun_forbidden':True,'failure_layer':'ENGINE LOGIC','failure_class':'GENERALIZATION / COMPOSITIONAL RECALL / PRECEDENCE','failure_distribution':dist,'route_confusions':[{'category':k[0],'expected_route':k[1],'actual_route':k[2],'count':v} for k,v in sorted(rc.items())],'family_confusions':[{'category':k[0],'expected_families':list(k[1]),'actual_families':list(k[2]),'expected_sequence':k[3],'actual_sequence':k[4],'count':v} for k,v in sorted(fc.items())],'failures':f,'expected_gold_changed':False,'v238_sealed_rerun':False,'production_authorized':False,'step_111_authorized':False}
(O/'V8_3_238_FROZEN_AUTOPSY_V1.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'distribution':dist,'failed':12}))
