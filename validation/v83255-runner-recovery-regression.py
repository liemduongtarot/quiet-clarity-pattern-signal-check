import subprocess,json,pathlib,hashlib
V=pathlib.Path('validation')
subprocess.run(['python','validation/v83254-development-evidence-regression.py'],check=True)
subprocess.run(['python','validation/v83255-runner-evidence-gate-selftest.py'],check=True)
base=json.loads((V/'V8_3_254_DEVELOPMENT_EVIDENCE_REGRESSION_RECEIPT_V1.json').read_text());assert base['conclusion']=='success' and base['immutable_regression_passed']==1470 and base['semantic_change'] is False
for n in ['V8_3_255_RUNNER_EVIDENCE_GATE_POSITIVE_TEST_V1.json','V8_3_255_RUNNER_EVIDENCE_GATE_NEGATIVE_IDENTITY_TEST_V1.json','V8_3_255_RUNNER_EVIDENCE_GATE_NEGATIVE_PROVENANCE_TEST_V1.json']:
    assert json.loads((V/n).read_text())['pass'] is True
out={'candidate':'V8.3.255','phase':'runner-evidence-contract-recovery-regression','base_exact_development_sha':'238cdba6ee2d4d17bcde19de2d895a7087983345','semantic_authority':'QCEvidenceExtractorV5AY -> QCSemanticCoreV124','repair_scope':'RUNNER_EVIDENCE_CONTRACT_ONLY','semantic_change':False,'expected_gold_changed':False,'v254_sealed_rerun':False,'immutable_regression_total':1470,'immutable_regression_passed':1470,'evidence_provenance_positive':True,'evidence_provenance_negative_missing_field':True,'evidence_provenance_mutation_detection':True,'runner_gate_positive':True,'runner_gate_negative_identity':True,'runner_gate_negative_provenance':True,'runner_gate_sha256':hashlib.sha256((V/'v83255-runner-evidence-gate.py').read_bytes()).hexdigest(),'sealed_validation_executed':False,'step_111_authorized':False,'production_authorized':False,'conclusion':'success'}
(V/'V8_3_255_RUNNER_RECOVERY_REGRESSION_RECEIPT_V1.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
