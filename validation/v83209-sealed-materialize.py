import json,hashlib,pathlib,base64,gzip
root=pathlib.Path('validation/v83209-v1-sealed')
auth=json.loads((root/'V8_3_209_SEALED_AUTHORITY_V1.json').read_text())
raw=gzip.decompress(base64.b64decode((root/'V8_3_209_PRESEAL_BUNDLE_V1.json.gz.b64').read_text().strip()))
bundle=json.loads(raw)
def canon(o): return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
name_map={'bank':('candidate_bank','V8_3_209_PRESEAL_CANDIDATE_BANK_V1.json'),'selection':('selection','V8_3_209_SEALED_SELECTION_V1.json'),'fixture':('fixture','V8_3_209_SEALED_FIXTURE_V1.json'),'gold':('independent_gold','V8_3_209_INDEPENDENT_GOLD_V1.json'),'membership':('membership','V8_3_209_SEALED_MEMBERSHIP_V1.json'),'audit':('preseal_audit','V8_3_209_PRESEAL_DIVERSITY_AUDIT_V1.json')}
for key,(hk,fn) in name_map.items():
    obj=bundle[key]
    got=hashlib.sha256(canon(obj)).hexdigest()
    assert got==auth['hashes'][hk],(key,got,auth['hashes'][hk])
    (root/fn).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
bank=bundle['bank'];sel=bundle['selection'];fixture=bundle['fixture'];gold=bundle['gold'];membership=bundle['membership'];audit=bundle['audit']
assert auth['validated_development_head_sha']=='513c58f31bf7307a103c3daef7c37d74477e8899'
assert auth['semantic_authority']=='QCSemanticCoreV80'
assert auth['v208_batch_a_rerun'] is False and auth['v208_batch_b_accessed'] is False
assert auth['step_111_authorized'] is False and auth['production_authorized'] is False
assert bank['runtime_output_used'] is False and bank['development_challenge_reused'] is False
assert len(bank['cases'])==180 and len({c['surface'] for c in bank['cases']})==180
assert len(fixture['cases'])==60 and len(sel['batch_a'])==30 and len(sel['batch_b'])==30
assert set(sel['batch_a']).isdisjoint(sel['batch_b'])
assert gold['runtime_output_used'] is False
assert audit['pass'] is True and audit['external_cases_at_or_above_0_75']==0 and audit['exact_external_duplicates']==0
assert audit['development_challenge_cases_at_or_above_0_75']==0 and audit['development_challenge_reused'] is False
assert audit['runtime_executed_during_bank_or_selection'] is False and audit['semantic_authority_loaded_during_bank_or_selection'] is False and audit['selection_uses_runtime_output'] is False
assert not (root/'V8_3_209_BATCH_A_FIRST_RUN_RESULTS.json').exists()
assert not (root/'V8_3_209_BATCH_B_FIRST_RUN_RESULTS.json').exists()
print('V8.3.209 sealed materialization verified: 180 bank / 60 selected / runtime=0')
