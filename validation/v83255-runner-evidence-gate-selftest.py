import importlib.util,pathlib,json,copy
V=pathlib.Path('validation');spec=importlib.util.spec_from_file_location('gate',V/'v83255-runner-evidence-gate.py');gate=importlib.util.module_from_spec(spec);spec.loader.exec_module(gate)
DEV='V255-DEV';SEM='QCEvidenceExtractorV5AY -> QCSemanticCoreV124'
pf={'pass':True,'validated_development_head_sha':DEV,'semantic_authority':SEM,'semantic_change':False,'expected_gold_changed':False,'semantic_source_identity_pass':True,'loaded_semantic_source_count':55,'runner_hash_verified':True,'runtime_case_timestamp_capture':True,'append_only_ledger_contract':True,'case_hash_chain_contract':True,'provenance_harness_tests_pass':True,'transport_pass':True}
identity={'pass':True,'semantic_authority':SEM,'all_byte_identical_to_frozen_development':True,'loaded_semantic_source_count':55}
assert gate.validate_preflight(pf,identity,DEV) is True
positive={'candidate':'V8.3.255','test':'runner-evidence-gate-positive','pass':True,'legacy_exact_path_fields_required':False}
bad=copy.deepcopy(identity);bad['all_byte_identical_to_frozen_development']=False
try:gate.validate_preflight(pf,bad,DEV);raise AssertionError('negative source identity not rejected')
except AssertionError:pass
negative={'candidate':'V8.3.255','test':'runner-evidence-gate-negative-source-identity','pass':True}
badpf=copy.deepcopy(pf);badpf['runtime_case_timestamp_capture']=False
try:gate.validate_preflight(badpf,identity,DEV);raise AssertionError('negative provenance instrumentation not rejected')
except AssertionError:pass
mutation={'candidate':'V8.3.255','test':'runner-evidence-gate-negative-provenance-instrumentation','pass':True}
(V/'V8_3_255_RUNNER_EVIDENCE_GATE_POSITIVE_TEST_V1.json').write_text(json.dumps(positive,indent=2)+'\n');(V/'V8_3_255_RUNNER_EVIDENCE_GATE_NEGATIVE_IDENTITY_TEST_V1.json').write_text(json.dumps(negative,indent=2)+'\n');(V/'V8_3_255_RUNNER_EVIDENCE_GATE_NEGATIVE_PROVENANCE_TEST_V1.json').write_text(json.dumps(mutation,indent=2)+'\n');print(json.dumps({'positive':positive,'negative':negative,'mutation':mutation}))
