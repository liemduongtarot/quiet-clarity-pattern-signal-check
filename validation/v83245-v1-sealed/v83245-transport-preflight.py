import json,hashlib,pathlib,subprocess,zipfile,tempfile,shutil
R=pathlib.Path('.');O=R/'validation/v83245-v1-sealed';DEV='2015436433bede4e454739efe2ebae4807f800af';BASE='885608fce9e70a8818d1ebda23c786a81005a2fe';SEM='QCEvidenceExtractorV5AS -> QCSemanticCoreV118'
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def ho(o):return hashlib.sha256(canon(o)).hexdigest()
def hb(b):return hashlib.sha256(b).hexdigest()
def show(ref,path):return subprocess.check_output(['git','show',f'{ref}:{path}'])
a=json.loads((O/'V8_3_245_SEALED_AUTHORITY_V1.json').read_text());rec=json.loads((O/'V8_3_245_PRESEAL_RUN_RECEIPT.json').read_text());mat=json.loads((O/'V8_3_245_RUNNER_MATERIALIZATION_V1.json').read_text())
assert a['validated_development_head_sha']==DEV and a['base_exact_development_sha']==BASE and a['semantic_authority']==SEM and a['preseal_pass'] is True and rec['conclusion']=='success'
files={'candidate_bank':'V8_3_245_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_245_SEALED_SELECTION_V1.json','fixture':'V8_3_245_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_245_INDEPENDENT_GOLD_V1.json','membership':'V8_3_245_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_245_PRESEAL_DIVERSITY_AUDIT_V1.json'}
hash_match={k:ho(json.loads((O/n).read_text()))==a['hashes'][k] for k,n in files.items()};assert all(hash_match.values())
dev_auth=json.loads(show(DEV,'validation/V8_3_245_DEVELOPMENT_AUTHORITY_V1.json'));reg=json.loads(show(DEV,'validation/V8_3_245_V118_REGRESSION_RECEIPT.json'))
assert dev_auth['regression_pass'] is True and dev_auth['semantic_authority']==SEM and dev_auth['expected_gold_changed'] is False and dev_auth['sealed_validation_executed'] is False
assert reg['conclusion']=='success' and reg['immutable_regression_passed']==1470 and reg['v244_previous_failures_repaired']==14 and reg['v244_previous_passes_preserved']==16 and reg['expected_gold_changed'] is False and reg['sealed_validation_executed'] is False
for k,v in reg.items():
 if k.startswith('v') and k.endswith('_frozen_a_passed'): assert v==30,k
child=['validation/qc-evidence-extractor-v5as-v245-v244-residuals.js','validation/psc-v83245-v244-v118-residuals.js']
parent=['validation/qc-evidence-extractor-v5ar-v243-v242-residuals.js','validation/psc-v83243-v242-v117-residuals.js']
child_identity={p:hb(pathlib.Path(p).read_bytes())==hb(show(DEV,p)) for p in child};assert all(child_identity.values())
parent_identity={p:hb(pathlib.Path(p).read_bytes())==hb(show(DEV,p))==hb(show(BASE,p)) for p in parent};assert all(parent_identity.values())
runner=pathlib.Path('validation/v83245-batch-a-self-contained.py');assert runner.exists();runner_hash=hb(runner.read_bytes());assert mat['pass'] is True and mat['self_contained'] is True and mat['runner_sha256']==runner_hash and mat['validated_development_head_sha']==DEV and mat['semantic_authority']==SEM
text=runner.read_text()
forbidden=['validation/v83244-v1-sealed-runtime','run-v83244-batch-a.cjs','V8_3_244_BATCH_A_RESULT_V1.json',"TARGET='885608fce9e70a8818d1ebda23c786a81005a2fe'",'QCSemanticCoreV117.analyze']
stale={x:(x in text) for x in forbidden};assert not any(stale.values()),stale
required=['validation/v83245-v1-sealed-runtime','run-v83245-batch-a.cjs','V8_3_245_BATCH_A_RESULT_V1.json','QCSemanticCoreV118.analyze','QCEvidenceExtractorV5AS -> QCSemanticCoreV118','2015436433bede4e454739efe2ebae4807f800af']
req={x:(x in text) for x in required};assert all(req.values()),req
archive=R/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip';assert archive.exists();tmp=pathlib.Path(tempfile.mkdtemp(prefix='v83245-transport-'))
try:
 with zipfile.ZipFile(archive) as z:z.extractall(tmp)
 public=tmp/'PSC_V8_3_138_DEV/public/psc-v3.js';assert public.exists() and public.stat().st_size>0
finally:shutil.rmtree(tmp,ignore_errors=True)
transport={'candidate':'V8.3.245','phase':'transport-verification','validated_development_head_sha':DEV,'base_exact_development_sha':BASE,'semantic_authority':SEM,'public_runtime_materialized':True,'self_contained_runner_verified':True,'runner_sha256':runner_hash,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'pass':True};(O/'V8_3_245_TRANSPORT_VERIFICATION_V1.json').write_text(json.dumps(transport,indent=2)+'\n')
marker_absent=not (O/'V8_3_245_SEALED_FIRST_RUN_MARKER.json').exists();attempt_absent=not (O/'V8_3_245_BATCH_A_ATTEMPT_MARKER.json').exists();result_absent=not (O/'V8_3_245_BATCH_A_RESULT_V1.json').exists()
pf={'candidate':'V8.3.245','phase':'static-sealed-preflight','validated_development_head_sha':DEV,'base_exact_development_sha':BASE,'loader_chain':SEM,'loader_chain_static_verified':True,'child_semantic_files_byte_identical_to_frozen_development':all(child_identity.values()),'parent_layers_byte_identical_to_base_and_frozen_development':all(parent_identity.values()),'self_contained_runner_hash_verified':True,'runner_stale_literal_scan':stale,'runner_required_literal_scan':req,'exact_v5as_path':child[0],'exact_v118_path':child[1],'exact_runner_path':str(runner),'frozen_canonical_hashes_match':hash_match,'transport_pass':True,'zero_failure_development_predicate':True,'runner_runtime_root_contract':{'version_root':'validation/v83245-v1-sealed-runtime','fixture':'V8_3_245_SEALED_FIXTURE_V1.json','selection':'V8_3_245_SEALED_SELECTION_V1.json','gold':'V8_3_245_INDEPENDENT_GOLD_V1.json','single_source_of_truth_for_runtime_root':True},'first_run_marker_absent':marker_absent,'batch_a_attempt_marker_absent':attempt_absent,'prior_batch_a_execution_absent':result_absent,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'v244_sealed_rerun':False,'pass':all(hash_match.values()) and all(child_identity.values()) and all(parent_identity.values()) and not any(stale.values()) and all(req.values()) and marker_absent and attempt_absent and result_absent}
assert pf['pass'];(O/'V8_3_245_STATIC_SEALED_PREFLIGHT_V1.json').write_text(json.dumps(pf,indent=2)+'\n');print(json.dumps(pf))
