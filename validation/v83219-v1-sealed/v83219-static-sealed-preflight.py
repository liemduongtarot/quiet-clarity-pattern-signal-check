import json,hashlib,pathlib,subprocess
R=pathlib.Path('.');O=R/'validation/v83219-v1-sealed';DEV='27a338cb88b054a05f61daa6c902ed8537574eba';SEM='456a88d01b671f0cb92a0be31f4d34d68f60d135'
A=json.loads((O/'V8_3_219_SEALED_AUTHORITY_V1.json').read_text())
FILES={'candidate_bank':'V8_3_219_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_219_SEALED_SELECTION_V1.json','fixture':'V8_3_219_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_219_INDEPENDENT_GOLD_V1.json','membership':'V8_3_219_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_219_PRESEAL_DIVERSITY_AUDIT_V1.json'}
def csha(p):
 o=json.loads(pathlib.Path(p).read_text());return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def show(ref,path):
 p=subprocess.run(['git','show',f'{ref}:{path}'],capture_output=True)
 if p.returncode:raise SystemExit(p.stderr.decode())
 return p.stdout
assert A['validated_development_head_sha']==DEV and A['semantic_base_sha']==SEM and A['preseal_pass'] is True
hm={k:csha(O/n)==A['hashes'][k] for k,n in FILES.items()};assert all(hm.values())
tr=json.loads((O/'V8_3_219_TRANSPORT_VERIFICATION_V1.json').read_text());assert tr['pass'] is True and tr['semantic_runtime_executed'] is False
semfiles=['validation/qc-evidence-extractor-v5x-v217-relational-recall.js','validation/psc-v83217-v216-v97-relational-recall.js']
sem_unchanged=all(show(DEV,p)==show(SEM,p) for p in semfiles);assert sem_unchanged
recovery=json.loads(show(DEV,'validation/V8_3_219_BOUNDED_LOADER_RECOVERY_RECEIPT.json').decode());devauth=json.loads(show(DEV,'validation/V8_3_219_DEVELOPMENT_AUTHORITY.json').decode())
checks=recovery['checks'];chain_ok=all(checks[k] for k in ['public_tree_materialized','psc_v3_exists','v196_tail_preserved','qcs_semantic_core_v65r_available_before_v197_plus','v197_plus_exact_order','final_tail_v5x_to_v97_exact','v5x_available','v97_available','semantic_sources_byte_identical'])
assert recovery['pass'] is True and devauth['development']=='PASS' and devauth['semantic_change'] is False and chain_ok
first=O/'V8_3_219_SEALED_FIRST_RUN_MARKER.json';attempt=O/'V8_3_219_BATCH_A_ATTEMPT_MARKER.json';ares=O/'V8_3_219_BATCH_A_RESULT_V1.json'
markers_absent=not first.exists() and not attempt.exists() and not ares.exists();assert markers_absent
result={'candidate':'V8.3.219','phase':'static-sealed-preflight','validated_development_head_sha':DEV,'semantic_base_sha':SEM,'loader_chain':'QCSemanticCoreV65R -> ... -> QCEvidenceExtractorV5X -> QCSemanticCoreV97','loader_chain_static_verified':chain_ok,'semantic_files_byte_identical_to_v217_dev':sem_unchanged,'frozen_canonical_hashes_match':hm,'transport_pass':True,'bounded_recovery_pass':True,'development_authority_pass':True,'zero_failure_development_predicate':True,'first_run_marker_absent':True,'prior_batch_a_execution_absent':True,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'v217_sealed_rerun':False,'v218_sealed_rerun':False,'pass':True}
(O/'V8_3_219_STATIC_SEALED_PREFLIGHT_V1.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
