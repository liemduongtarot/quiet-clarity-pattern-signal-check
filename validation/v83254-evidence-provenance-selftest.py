import copy, importlib.util, json, pathlib, hashlib
V=pathlib.Path('validation')
spec=importlib.util.spec_from_file_location('prov',V/'v83254-evidence-provenance.py');prov=importlib.util.module_from_spec(spec);spec.loader.exec_module(prov)
contract=json.loads((V/'V8_3_254_EVIDENCE_PROVENANCE_CONTRACT_V1.json').read_text())
contract_sha=hashlib.sha256((V/'V8_3_254_EVIDENCE_PROVENANCE_CONTRACT_V1.json').read_bytes()).hexdigest()
reservation=prov.build_reservation('V8.3.254','A','SELFTEST','1','DEV','QCEvidenceExtractorV5AY -> QCSemanticCoreV124','RUNNER')
ledger=prov.new_ledger('V8.3.254','A','SELFTEST','1',reservation)
records=[]
for i in range(1,31):
    rec=prov.finalize_case_record({
      'case_id':f'SELF-{i:02d}','batch':'A','run_id':'SELFTEST','run_attempt':'1','execution_ordinal':i,'executed_at_utc':'2026-08-23T00:00:00Z',
      'validated_development_head_sha':'DEV','semantic_authority':'QCEvidenceExtractorV5AY -> QCSemanticCoreV124','source_runner_sha256':'RUNNER',
      'candidate_bank_sha256':'BANK','selection_sha256':'SELECTION','fixture_sha256':'FIXTURE','gold_sha256':'GOLD','membership_sha256':'MEMBERSHIP','preseal_audit_sha256':'PRESEAL','schema_contract_sha256':contract_sha,
      'category':'neutral','language':'EN','domain':'money','surface_sha256':hashlib.sha256(f'surface-{i}'.encode()).hexdigest(),
      'expected':{'route':'input:self-lived','families':[],'sequence':False},'actual':{'route':'input:self-lived','families':[],'sequence':False},'pass':True,
      'canonical_state_trace_ref':f'trace://self/{i}','previous_record_sha256':ledger['final_chain_sha256']})
    prov.append_case(ledger,rec);records.append(rec)
prov.seal_ledger(ledger)
ok,why=prov.verify_ledger(ledger);assert ok,why
positive={'candidate':'V8.3.254','test':'positive-complete-ledger','pass':True,'record_count':30,'ledger_sha256':ledger['ledger_sha256']}
# Negative: missing mandatory provenance field must be rejected.
bad=dict(records[0]);bad.pop('gold_sha256');bad['record_sha256']=prov.record_hash_payload(bad)
ok2,why2=prov.verify_case_record(bad);assert not ok2 and why2.startswith('missing:')
negative={'candidate':'V8.3.254','test':'negative-missing-field','pass':True,'detected_reason':why2}
# Mutation: changing actual after sealing must be detected by record hash / ledger verification.
mut=copy.deepcopy(ledger);mut['entries'][5]['actual']['route']='input:prediction'
ok3,why3=prov.verify_ledger(mut);assert not ok3
mutation={'candidate':'V8.3.254','test':'mutation-detection','pass':True,'detected_reason':why3}
(V/'V8_3_254_HARNESS_POSITIVE_TEST_V1.json').write_text(json.dumps(positive,indent=2)+'\n')
(V/'V8_3_254_HARNESS_NEGATIVE_MISSING_FIELD_TEST_V1.json').write_text(json.dumps(negative,indent=2)+'\n')
(V/'V8_3_254_HARNESS_MUTATION_DETECTION_TEST_V1.json').write_text(json.dumps(mutation,indent=2)+'\n')
print(json.dumps({'positive':positive,'negative':negative,'mutation':mutation}))
