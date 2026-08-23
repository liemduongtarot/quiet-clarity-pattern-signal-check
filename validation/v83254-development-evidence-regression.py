import json,pathlib,subprocess,hashlib
V=pathlib.Path('validation')
# Provenance infrastructure must validate itself first.
subprocess.run(['python','validation/v83254-evidence-provenance-selftest.py'],check=True)
# Re-run the exact V124 semantic regression authority inherited from the frozen V253 DEVELOPMENT source.
subprocess.run(['python','validation/v83253-v124-legacy-regression.py'],check=True)
subprocess.run(['python','validation/v83253-v124-v252-a-regression.py'],check=True)
legacy=json.loads((V/'V8_3_253_V124_LEGACY_REGRESSION_RECEIPT.json').read_text())
carrier=json.loads((V/'V8_3_253_V252_A_REGRESSION_RECEIPT.json').read_text())
pos=json.loads((V/'V8_3_254_HARNESS_POSITIVE_TEST_V1.json').read_text())
neg=json.loads((V/'V8_3_254_HARNESS_NEGATIVE_MISSING_FIELD_TEST_V1.json').read_text())
mut=json.loads((V/'V8_3_254_HARNESS_MUTATION_DETECTION_TEST_V1.json').read_text())
assert legacy['conclusion']=='success' and legacy['immutable_regression_passed']==1470
assert carrier['v252_batch_a_passed']==30 and carrier['v252_batch_a_previous_failures_repaired']==1 and carrier['v252_batch_a_previous_passes_preserved']==29
assert pos['pass'] and neg['pass'] and mut['pass']
contract_sha=hashlib.sha256((V/'V8_3_254_EVIDENCE_PROVENANCE_CONTRACT_V1.json').read_bytes()).hexdigest()
module_sha=hashlib.sha256((V/'v83254-evidence-provenance.py').read_bytes()).hexdigest()
out={
 'candidate':'V8.3.254','phase':'development-evidence-only-regression',
 'base_exact_development_sha':'89db04ec936af998c14d2f0451ef87270ea8e349',
 'semantic_authority':'QCEvidenceExtractorV5AY -> QCSemanticCoreV124',
 'semantic_change':False,'expected_gold_changed':False,'v253_sealed_rerun':False,
 'immutable_regression_total':1470,'immutable_regression_passed':1470,
 'v252_batch_a_replay_passed':30,'v252_previous_failure_repaired':1,'v252_previous_passes_preserved':29,
 'provenance_positive_test':True,'provenance_negative_missing_field_test':True,'provenance_mutation_detection_test':True,
 'evidence_contract_sha256':contract_sha,'evidence_module_sha256':module_sha,
 'sealed_validation_executed':False,'step_111_authorized':False,'production_authorized':False,'conclusion':'success'}
(V/'V8_3_254_DEVELOPMENT_EVIDENCE_REGRESSION_RECEIPT_V1.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps(out))
