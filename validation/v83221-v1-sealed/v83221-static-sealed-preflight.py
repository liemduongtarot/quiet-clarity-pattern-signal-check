import json,hashlib,pathlib,subprocess
R=pathlib.Path('.');O=R/'validation/v83221-v1-sealed';DEV='0e17e6d62edf8334ea75ba70b4f28f2746dd8436';SEMBASE='456a88d01b671f0cb92a0be31f4d34d68f60d135'
A=json.loads((O/'V8_3_221_SEALED_AUTHORITY_V1.json').read_text())
FILES={'candidate_bank':'V8_3_221_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_221_SEALED_SELECTION_V1.json','fixture':'V8_3_221_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_221_INDEPENDENT_GOLD_V1.json','membership':'V8_3_221_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_221_PRESEAL_DIVERSITY_AUDIT_V1.json'}
def csha(p):
 o=json.loads(pathlib.Path(p).read_text());return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def show(ref,path):
 p=subprocess.run(['git','show',f'{ref}:{path}'],capture_output=True)
 if p.returncode:raise SystemExit(p.stderr.decode())
 return p.stdout
assert A['validated_development_head_sha']==DEV and A['semantic_authority']=='QCEvidenceExtractorV5Y -> QCSemanticCoreV98' and A['preseal_pass'] is True
hm={k:csha(O/n)==A['hashes'][k] for k,n in FILES.items()};assert all(hm.values())
tr=json.loads((O/'V8_3_221_TRANSPORT_VERIFICATION_V1.json').read_text());assert tr['pass'] is True and tr['semantic_runtime_executed'] is False
# Exact DEVELOPMENT source preservation.
semfiles=['validation/qc-evidence-extractor-v5x-v217-relational-recall.js','validation/psc-v83217-v216-v97-relational-recall.js','validation/qc-evidence-extractor-v5y-v220-bounded-recall.js','validation/psc-v83220-v219-v98-bounded-recall.js']
sem_dev_unchanged=all(pathlib.Path(p).read_bytes()==show(DEV,p) for p in semfiles);assert sem_dev_unchanged
v5x_v97_parent=all(pathlib.Path(p).read_bytes()==show(SEMBASE,p) for p in semfiles[:2]);assert v5x_v97_parent
v5y=pathlib.Path(semfiles[2]).read_text();v98=pathlib.Path(semfiles[3]).read_text()
chain=('global.QCEvidenceExtractorV5Y' in v5y and ('global.QCEvidenceExtractorV5Y' in v98 or 'QCEvidenceExtractorV5Y' in v98) and 'global.QCSemanticCoreV98' in v98);assert chain
recovery=json.loads(show(DEV,'validation/V8_3_221_BOUNDED_RUNNER_SCHEMA_RECOVERY_RECEIPT.json').decode());devauth=json.loads(show(DEV,'validation/V8_3_221_DEVELOPMENT_AUTHORITY_V1.json').decode());assert recovery['pass'] is True and devauth['development']=='PASS' and devauth['semantic_change_from_v8_3_220'] is False
reg=json.loads(show(DEV,'validation/V8_3_220_V98_REGRESSION_RECEIPT.json').decode());zero=(reg['immutable_regression_passed']==1470 and reg['v216_frozen_a_passed']==30 and reg['v219_frozen_a_passed']==30);assert zero
first=O/'V8_3_221_SEALED_FIRST_RUN_MARKER.json';attempt=O/'V8_3_221_BATCH_A_ATTEMPT_MARKER.json';ares=O/'V8_3_221_BATCH_A_RESULT_V1.json'
markers_absent=not first.exists() and not attempt.exists() and not ares.exists();assert markers_absent
result={'candidate':'V8.3.221','phase':'static-sealed-preflight','validated_development_head_sha':DEV,'loader_chain':'QCEvidenceExtractorV5Y -> QCSemanticCoreV98','loader_chain_static_verified':chain,'semantic_files_byte_identical_to_v221_dev':sem_dev_unchanged,'v5x_v97_byte_identical_to_parent':v5x_v97_parent,'frozen_canonical_hashes_match':hm,'transport_pass':True,'bounded_recovery_pass':True,'development_authority_pass':True,'zero_failure_development_predicate':True,'first_run_marker_absent':True,'prior_batch_a_execution_absent':True,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'v217_sealed_rerun':False,'v218_sealed_rerun':False,'v219_sealed_rerun':False,'v220_sealed_rerun':False,'pass':True}
(O/'V8_3_221_STATIC_SEALED_PREFLIGHT_V1.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
