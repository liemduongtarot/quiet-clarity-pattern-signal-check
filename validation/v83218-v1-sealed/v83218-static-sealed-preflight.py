import json,hashlib,pathlib,subprocess
R=pathlib.Path('.');O=R/'validation/v83218-v1-sealed';DEV='9d946d3ddf8b98c2b3f80e1b5b849b12415381c2';SEM='456a88d01b671f0cb92a0be31f4d34d68f60d135'
A=json.loads((O/'V8_3_218_SEALED_AUTHORITY_V1.json').read_text())
FILES={'candidate_bank':'V8_3_218_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_218_SEALED_SELECTION_V1.json','fixture':'V8_3_218_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_218_INDEPENDENT_GOLD_V1.json','membership':'V8_3_218_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_218_PRESEAL_DIVERSITY_AUDIT_V1.json'}
def csha(p):
 o=json.loads(pathlib.Path(p).read_text());return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def show(ref,path):
 p=subprocess.run(['git','show',f'{ref}:{path}'],capture_output=True)
 if p.returncode:raise SystemExit(p.stderr.decode())
 return p.stdout
assert A['validated_development_head_sha']==DEV and A['semantic_base_sha']==SEM and A['preseal_pass'] is True
hm={k:csha(O/n)==A['hashes'][k] for k,n in FILES.items()};assert all(hm.values())
tr=json.loads((O/'V8_3_218_TRANSPORT_VERIFICATION_V1.json').read_text());assert tr['pass'] is True and tr['semantic_runtime_executed'] is False
# Exact V8.3.218 DEVELOPMENT authority preserves V5X/V97 byte-for-byte from the exact V8.3.217 semantic base.
semfiles=['validation/qc-evidence-extractor-v5x-v217-relational-recall.js','validation/psc-v83217-v216-v97-relational-recall.js']
sem_unchanged=all(show(DEV,p)==show(SEM,p) for p in semfiles);assert sem_unchanged
orch=show(SEM,'validation/v83217-v97-final-development-orchestrator.py').decode();v5x=show(SEM,semfiles[0]).decode();v97=show(SEM,semfiles[1]).decode()
chain=("'qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js'" in orch and 'global.QCEvidenceExtractorV5X' in v5x and 'const extractor=global.QCEvidenceExtractorV5X' in v97 and 'global.QCSemanticCoreV97=core' in v97);assert chain
recovery=json.loads(show(DEV,'validation/V8_3_218_BOUNDED_RECOVERY_RECEIPT.json').decode());devauth=json.loads(show(DEV,'validation/V8_3_218_DEVELOPMENT_AUTHORITY_V1.json').decode());assert recovery['pass'] is True and devauth['development']=='PASS' and devauth['semantic_change_from_v8_3_217'] is False
first=O/'V8_3_218_SEALED_FIRST_RUN_MARKER.json';attempt=O/'V8_3_218_BATCH_A_ATTEMPT_MARKER.json';ares=O/'V8_3_218_BATCH_A_RESULT_V1.json'
markers_absent=not first.exists() and not attempt.exists() and not ares.exists();assert markers_absent
result={'candidate':'V8.3.218','phase':'static-sealed-preflight','validated_development_head_sha':DEV,'semantic_base_sha':SEM,'loader_chain':'QCEvidenceExtractorV5X -> QCSemanticCoreV97','loader_chain_static_verified':chain,'semantic_files_byte_identical_to_v217_dev':sem_unchanged,'frozen_canonical_hashes_match':hm,'transport_pass':True,'bounded_recovery_pass':True,'development_authority_pass':True,'first_run_marker_absent':True,'prior_batch_a_execution_absent':True,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'v217_sealed_rerun':False,'pass':True}
(O/'V8_3_218_STATIC_SEALED_PREFLIGHT_V1.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
