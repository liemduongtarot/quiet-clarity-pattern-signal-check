import json,hashlib,pathlib,subprocess,zipfile,tempfile,shutil
R=pathlib.Path('.');O=R/'validation/v83244-v1-sealed';BASE='885608fce9e70a8818d1ebda23c786a81005a2fe';DEV='184cb1253121307b72f66462ec7196625623635c';SEM='QCEvidenceExtractorV5AR -> QCSemanticCoreV117'
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def ho(o):return hashlib.sha256(canon(o)).hexdigest()
def hb(b):return hashlib.sha256(b).hexdigest()
def show(ref,path):return subprocess.check_output(['git','show',f'{ref}:{path}'])
a=json.loads((O/'V8_3_244_SEALED_AUTHORITY_V1.json').read_text());rec=json.loads((O/'V8_3_244_PRESEAL_RUN_RECEIPT.json').read_text())
assert a['recovery_development_head_sha']==DEV and a['base_exact_development_sha']==BASE and a['semantic_authority']==SEM and a['preseal_pass'] is True and rec['conclusion']=='success'
files={'candidate_bank':'V8_3_244_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_244_SEALED_SELECTION_V1.json','fixture':'V8_3_244_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_244_INDEPENDENT_GOLD_V1.json','membership':'V8_3_244_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_244_PRESEAL_DIVERSITY_AUDIT_V1.json'}
hash_match={k:ho(json.loads((O/n).read_text()))==a['hashes'][k] for k,n in files.items()};assert all(hash_match.values())
base_reg=json.loads(show(BASE,'validation/V8_3_243_V117_REGRESSION_RECEIPT.json'));dev244=json.loads(show(DEV,'validation/V8_3_244_DEVELOPMENT_AUTHORITY_V1.json'));mat=json.loads(show(DEV,'validation/V8_3_244_RUNNER_MATERIALIZATION_V1.json'))
assert base_reg['conclusion']=='success' and base_reg['immutable_regression_passed']==1470 and base_reg['expected_gold_changed'] is False
assert dev244['semantic_change'] is False and dev244['expected_gold_changed'] is False and mat['pass'] is True and mat['self_contained'] is True
semfiles=['validation/qc-evidence-extractor-v5ar-v243-v242-residuals.js','validation/psc-v83243-v242-v117-residuals.js'];identity={p:hb(pathlib.Path(p).read_bytes())==hb(show(BASE,p)) for p in semfiles};assert all(identity.values())
runner='validation/v83244-batch-a-self-contained.py';runner_identity=hb(pathlib.Path(runner).read_bytes())==hb(show(DEV,runner));assert runner_identity and hb(pathlib.Path(runner).read_bytes())==mat['runner_sha256']
archive=R/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip';assert archive.exists();tmp=pathlib.Path(tempfile.mkdtemp(prefix='v83244-transport-'))
try:
 with zipfile.ZipFile(archive) as z:z.extractall(tmp)
 public=tmp/'PSC_V8_3_138_DEV/public/psc-v3.js';assert public.exists() and public.stat().st_size>0
finally:shutil.rmtree(tmp,ignore_errors=True)
transport={'candidate':'V8.3.244','phase':'transport-verification','recovery_development_head_sha':DEV,'base_exact_development_sha':BASE,'semantic_authority':SEM,'public_runtime_materialized':True,'self_contained_runner_verified':runner_identity,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'pass':True};(O/'V8_3_244_TRANSPORT_VERIFICATION_V1.json').write_text(json.dumps(transport,indent=2)+'\n')
marker_absent=not (O/'V8_3_244_SEALED_FIRST_RUN_MARKER.json').exists();attempt_absent=not (O/'V8_3_244_BATCH_A_ATTEMPT_MARKER.json').exists();result_absent=not (O/'V8_3_244_BATCH_A_RESULT_V1.json').exists()
pf={'candidate':'V8.3.244','phase':'static-sealed-preflight','recovery_development_head_sha':DEV,'base_exact_development_sha':BASE,'loader_chain':SEM,'loader_chain_static_verified':True,'semantic_files_byte_identical_to_base_exact_development':all(identity.values()),'self_contained_runner_byte_identical_to_recovery_development':runner_identity,'exact_v5ar_path':semfiles[0],'exact_v117_path':semfiles[1],'exact_runner_path':runner,'frozen_canonical_hashes_match':hash_match,'transport_pass':True,'zero_failure_semantic_development_predicate':True,'runner_runtime_root_contract':{'version_root':'validation/v83244-v1-sealed-runtime','fixture':'V8_3_244_SEALED_FIXTURE_V1.json','selection':'V8_3_244_SEALED_SELECTION_V1.json','gold':'V8_3_244_INDEPENDENT_GOLD_V1.json','single_source_of_truth_for_runtime_root':True},'first_run_marker_absent':marker_absent,'batch_a_attempt_marker_absent':attempt_absent,'prior_batch_a_execution_absent':result_absent,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'v243_batch_a_rerun':False,'pass':all(hash_match.values()) and all(identity.values()) and runner_identity and marker_absent and attempt_absent and result_absent}
assert pf['pass'];(O/'V8_3_244_STATIC_SEALED_PREFLIGHT_V1.json').write_text(json.dumps(pf,indent=2)+'\n');print(json.dumps(pf))
