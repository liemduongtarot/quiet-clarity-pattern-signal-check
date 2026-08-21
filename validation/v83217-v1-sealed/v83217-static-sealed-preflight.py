import hashlib,json,pathlib,subprocess
ROOT=pathlib.Path('.');OUT=ROOT/'validation/v83217-v1-sealed';DEV='456a88d01b671f0cb92a0be31f4d34d68f60d135'
AUTH=json.loads((OUT/'V8_3_217_SEALED_AUTHORITY_V1.json').read_text())
FILES={'candidate_bank':'V8_3_217_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_217_SEALED_SELECTION_V1.json','fixture':'V8_3_217_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_217_INDEPENDENT_GOLD_V1.json','membership':'V8_3_217_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_217_PRESEAL_DIVERSITY_AUDIT_V1.json'}
def canonical_sha(path):
 o=json.loads(pathlib.Path(path).read_text());return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
assert AUTH['validated_development_head_sha']==DEV;assert AUTH['semantic_authority']=='QCSemanticCoreV97' and AUTH['preseal_pass'] is True
hash_match={k:canonical_sha(OUT/v)==AUTH['hashes'][k] for k,v in FILES.items()};assert all(hash_match.values())
audit=json.loads((OUT/FILES['preseal_audit']).read_text());assert audit['pass'] is True
transport=json.loads((OUT/'V8_3_217_TRANSPORT_VERIFICATION_V1.json').read_text());assert transport['pass'] is True and transport['semantic_runtime_executed'] is False and transport['semantic_authority_loaded'] is False

def show(ref,path):
 p=subprocess.run(['git','show',f'{ref}:{path}'],capture_output=True,text=True)
 if p.returncode:raise SystemExit(p.stderr)
 return p.stdout
orch=show(DEV,'validation/v83217-v97-final-development-orchestrator.py');v5x=show(DEV,'validation/qc-evidence-extractor-v5x-v217-relational-recall.js');v97=show(DEV,'validation/psc-v83217-v216-v97-relational-recall.js')
chain_ok=("'qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js'" in orch and 'global.QCEvidenceExtractorV5X' in v5x and 'const extractor=global.QCEvidenceExtractorV5X' in v97 and 'global.QCSemanticCoreV97=core' in v97);assert chain_ok
subprocess.run(['git','fetch','--depth=1','origin','refs/heads/v83217-v1-validation:refs/remotes/origin/v83217-v1-validation'],check=True,stdout=subprocess.DEVNULL)
dev_receipt=json.loads(show('origin/v83217-v1-validation','validation/V8_3_217_V97_FINAL_DEVELOPMENT_RUN_RECEIPT.json'))
zero_failure=(dev_receipt['candidate']=='V8.3.217' and dev_receipt['semantic_authority']=='QCSemanticCoreV97' and dev_receipt['regression_total']==dev_receipt['regression_passed']==1470 and dev_receipt['v216_frozen_a_total']==dev_receipt['v216_frozen_a_passed']==30 and dev_receipt['generalization_pass'] is True and dev_receipt['browser_passed'] is True and dev_receipt['development']=='PASS' and dev_receipt['conclusion']=='success' and dev_receipt['sealed_validation_executed'] is False);assert zero_failure
first=OUT/'V8_3_217_SEALED_FIRST_RUN_MARKER.json';am=OUT/'V8_3_217_BATCH_A_ATTEMPT_MARKER.json';ar=OUT/'V8_3_217_BATCH_A_RESULT_V1.json';marker_absent=not first.exists();batch_a_absent=not am.exists() and not ar.exists();assert marker_absent and batch_a_absent
result={'candidate':'V8.3.217','phase':'static-sealed-preflight-r4-canonical-hash','validated_development_head_sha':DEV,'loader_chain':'QCEvidenceExtractorV5X -> QCSemanticCoreV97','loader_chain_static_verified':chain_ok,'frozen_canonical_hashes_match':hash_match,'transport_pass':True,'zero_failure_development_pass_predicate':zero_failure,'first_run_marker_absent':marker_absent,'prior_batch_a_execution_absent':batch_a_absent,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'pass':True}
(OUT/'V8_3_217_STATIC_SEALED_PREFLIGHT_V1.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
