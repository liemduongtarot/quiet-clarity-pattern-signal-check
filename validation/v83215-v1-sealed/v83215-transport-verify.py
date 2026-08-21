import json,hashlib,pathlib,os
O=pathlib.Path('validation/v83215-v1-sealed')
def can(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def h(o):return hashlib.sha256(can(o)).hexdigest()
a=json.loads((O/'V8_3_215_SEALED_AUTHORITY_V1.json').read_text());r=json.loads((O/'V8_3_215_PRESEAL_RUN_RECEIPT.json').read_text())
assert a['validated_development_head_sha']=='e0ee7b03ad0dcdc616b242f6df810f4211e08baa';assert a['semantic_authority']=='QCSemanticCoreV95';assert a['preseal_pass'] is True;assert r['conclusion']=='success'
assert r['semantic_runtime_executed'] is False and r['semantic_authority_loaded'] is False and r['selection_uses_runtime_output'] is False and r['batch_a_executed'] is False and r['batch_b_executed'] is False
N={'candidate_bank':'V8_3_215_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_215_SEALED_SELECTION_V1.json','fixture':'V8_3_215_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_215_INDEPENDENT_GOLD_V1.json','membership':'V8_3_215_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_215_PRESEAL_DIVERSITY_AUDIT_V1.json'};obs={}
for k,n in N.items():
 o=json.loads((O/n).read_text());obs[k]=h(o);assert obs[k]==a['hashes'][k],k
out={'authority':'V8.3.215 FROZEN TRANSPORT VERIFICATION','run_id':int(os.environ.get('GITHUB_RUN_ID','0')),'validated_development_head_sha':a['validated_development_head_sha'],'semantic_authority':'QCSemanticCoreV95','observed_hashes':obs,'hashes_match':True,'candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'batch_a_executed':False,'batch_b_executed':False,'v214_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False,'conclusion':'success'}
(O/'V8_3_215_TRANSPORT_VERIFICATION_V1.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2))
