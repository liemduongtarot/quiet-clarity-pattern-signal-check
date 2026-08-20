import json,hashlib,pathlib,base64,gzip,os
root=pathlib.Path('validation/v83208-v1-sealed')
bank=json.loads(gzip.decompress(base64.b64decode((root/'V8_3_208_PRESEAL_CANDIDATE_BANK_V1.json.gz.b64').read_text().strip())).decode())
sel=json.loads((root/'V8_3_208_SEALED_SELECTION_V1.json').read_text())
audit=json.loads((root/'V8_3_208_PRESEAL_DIVERSITY_AUDIT_V1.json').read_text())
auth=json.loads((root/'V8_3_208_SEALED_AUTHORITY_V1.json').read_text())
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
assert hashlib.sha256(canon(bank)).hexdigest()==auth['hashes']['candidate_bank']
assert hashlib.sha256(canon(sel)).hexdigest()==auth['hashes']['selection']
assert hashlib.sha256(canon(audit)).hexdigest()==auth['hashes']['preseal_audit']
assert audit['pass'] is True and audit['runtime_executed_during_bank_or_selection'] is False
assert auth['semantic_authority']=='QCSemanticCoreV77R'
assert auth['validated_development_head_sha']=='f787117690e4aa4e0095c70cc80afc6d982f8e88'
assert auth['v207_batch_a_rerun'] is False and auth['v207_batch_b_accessed'] is False
assert len(bank['cases'])==180 and len(sel['batch_a'])==30 and len(sel['batch_b'])==30
assert set(sel['batch_a']).isdisjoint(sel['batch_b'])
ids=set(sel['batch_a']+sel['batch_b']);lookup={c['case_id']:c for c in bank['cases']};cases=[c for c in bank['cases'] if c['case_id'] in ids]
assert len(cases)==60
fixture={'authority':'V8.3.208 V1 SEALED EXECUTION FIXTURE','candidate':'V8.3.208','development_authority_head':'f787117690e4aa4e0095c70cc80afc6d982f8e88','semantic_authority':'QCSemanticCoreV77R','runtime_execution_before_fixture':0,'sealed_before_execution':True,'v207_sealed_rerun':False,'batch_a':sel['batch_a'],'batch_b':sel['batch_b'],'cases':cases}
gold={'authority':'V8.3.208 V1 INDEPENDENT GOLD','candidate':'V8.3.208','derived_from_runtime':False,'gold':[{'case_id':c['case_id'],'expected':c['expected']} for c in cases]}
members=[{'batch':'A','case_id':cid,'category':lookup[cid]['category'],'domain':lookup[cid]['domain']} for cid in sel['batch_a']]+[{'batch':'B','case_id':cid,'category':lookup[cid]['category'],'domain':lookup[cid]['domain']} for cid in sel['batch_b']]
membership={'authority':'V8.3.208 V1 SEALED MEMBERSHIP','candidate':'V8.3.208','members':members}
assert hashlib.sha256(canon(fixture)).hexdigest()==auth['hashes']['fixture']
assert hashlib.sha256(canon(gold)).hexdigest()==auth['hashes']['independent_gold']
assert hashlib.sha256(canon(membership)).hexdigest()==auth['hashes']['membership']
(root/'V8_3_208_PRESEAL_CANDIDATE_BANK_V1.json').write_text(json.dumps(bank,ensure_ascii=False,indent=2))
(root/'V8_3_208_SEALED_FIXTURE_V1.json').write_text(json.dumps(fixture,ensure_ascii=False,indent=2))
(root/'V8_3_208_INDEPENDENT_GOLD_V1.json').write_text(json.dumps(gold,ensure_ascii=False,indent=2))
(root/'V8_3_208_SEALED_MEMBERSHIP_V1.json').write_text(json.dumps(membership,ensure_ascii=False,indent=2))
metadata={'candidate':'V8.3.208','phase':'transport-only-preflight','run_id':int(os.environ['GITHUB_RUN_ID']),'head_sha':os.environ['GITHUB_SHA'],'conclusion':'success','semantic_runtime_executed':False,'semantic_authority_loaded':False,'fixture_materialized':True,'hashes_verified':True,'v207_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False}
(root/'V8_3_208_TRANSPORT_METADATA_V1.json').write_text(json.dumps(metadata,indent=2))
