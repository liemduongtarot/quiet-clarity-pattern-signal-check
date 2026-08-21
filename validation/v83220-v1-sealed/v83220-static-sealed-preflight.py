import json,hashlib,pathlib,subprocess
R=pathlib.Path('.');O=R/'validation/v83220-v1-sealed';DEV='06ac0e51c958f5c64dcb97f91d66b122d3048bf8'
A=json.loads((O/'V8_3_220_SEALED_AUTHORITY_V1.json').read_text())
FILES={'candidate_bank':'V8_3_220_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_220_SEALED_SELECTION_V1.json','fixture':'V8_3_220_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_220_INDEPENDENT_GOLD_V1.json','membership':'V8_3_220_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_220_PRESEAL_DIVERSITY_AUDIT_V1.json'}
def csha(p):
 o=json.loads(pathlib.Path(p).read_text());return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def show(ref,path):
 p=subprocess.run(['git','show',f'{ref}:{path}'],capture_output=True)
 if p.returncode:raise SystemExit(p.stderr.decode())
 return p.stdout
assert A['validated_development_head_sha']==DEV and A['semantic_authority']=='QCEvidenceExtractorV5Y -> QCSemanticCoreV98' and A['preseal_pass'] is True
hm={k:csha(O/n)==A['hashes'][k] for k,n in FILES.items()};assert all(hm.values())
tr=json.loads((O/'V8_3_220_TRANSPORT_VERIFICATION_V1.json').read_text());assert tr['pass'] is True and tr['semantic_runtime_executed'] is False
v5y=show(DEV,'validation/qc-evidence-extractor-v5y-v220-bounded-recall.js').decode();v98=show(DEV,'validation/psc-v83220-v219-v98-bounded-recall.js').decode();chain_ok=('global.QCEvidenceExtractorV5Y' in v5y and 'const extractor=global.QCEvidenceExtractorV5Y' in v98 and 'global.QCSemanticCoreV98=core' in v98);assert chain_ok
reg=json.loads(show(DEV,'validation/V8_3_220_V98_REGRESSION_RECEIPT.json').decode());devauth=json.loads(show(DEV,'validation/V8_3_220_DEVELOPMENT_AUTHORITY.json').decode())
zero_failure=(reg['immutable_regression_total']==reg['immutable_regression_passed']==1470 and reg['v216_frozen_a_total']==reg['v216_frozen_a_passed']==30 and reg['v219_frozen_a_total']==reg['v219_frozen_a_passed']==30 and reg['v219_previous_failures_repaired']==15 and reg['v219_previous_passes_preserved']==15 and reg['conclusion']=='success' and reg['sealed_validation_executed'] is False);assert zero_failure and devauth['development']=='PASS'
first=O/'V8_3_220_SEALED_FIRST_RUN_MARKER.json';attempt=O/'V8_3_220_BATCH_A_ATTEMPT_MARKER.json';ares=O/'V8_3_220_BATCH_A_RESULT_V1.json';markers_absent=not first.exists() and not attempt.exists() and not ares.exists();assert markers_absent
result={'candidate':'V8.3.220','phase':'static-sealed-preflight','validated_development_head_sha':DEV,'loader_chain':'QCEvidenceExtractorV5Y -> QCSemanticCoreV98','loader_chain_static_verified':chain_ok,'frozen_canonical_hashes_match':hm,'transport_pass':True,'zero_failure_development_predicate':zero_failure,'first_run_marker_absent':True,'prior_batch_a_execution_absent':True,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'v217_sealed_rerun':False,'v218_sealed_rerun':False,'v219_sealed_rerun':False,'pass':True}
(O/'V8_3_220_STATIC_SEALED_PREFLIGHT_V1.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
