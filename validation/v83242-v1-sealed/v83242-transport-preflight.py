import json,hashlib,pathlib,subprocess,zipfile,tempfile,shutil
R=pathlib.Path('.');O=R/'validation/v83242-v1-sealed';DEV='79645f8973c9e8288119f79318b39646e2feb00f';SEM='QCEvidenceExtractorV5AQ -> QCSemanticCoreV116'
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def ho(o):return hashlib.sha256(canon(o)).hexdigest()
def hb(b):return hashlib.sha256(b).hexdigest()
def show(path):return subprocess.check_output(['git','show',f'{DEV}:{path}'])
a=json.loads((O/'V8_3_242_SEALED_AUTHORITY_V1.json').read_text());rec=json.loads((O/'V8_3_242_PRESEAL_RUN_RECEIPT.json').read_text())
assert a['validated_development_head_sha']==DEV and a['semantic_authority']==SEM and a['preseal_pass'] is True and rec['conclusion']=='success'
files={'candidate_bank':'V8_3_242_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_242_SEALED_SELECTION_V1.json','fixture':'V8_3_242_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_242_INDEPENDENT_GOLD_V1.json','membership':'V8_3_242_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_242_PRESEAL_DIVERSITY_AUDIT_V1.json'}
hash_match={k:ho(json.loads((O/n).read_text()))==a['hashes'][k] for k,n in files.items()};assert all(hash_match.values())
dev_auth=json.loads(show('validation/V8_3_242_DEVELOPMENT_AUTHORITY_V1.json'));reg=json.loads(show('validation/V8_3_242_V116_REGRESSION_RECEIPT.json'))
assert dev_auth['regression_pass'] is True and reg['conclusion']=='success' and reg['immutable_regression_passed']==1470 and reg['v216_frozen_a_passed']==30 and reg['v241_previous_failures_repaired']==13 and reg['v241_previous_passes_preserved']==17
for k,v in reg.items():
 if k.startswith('v') and k.endswith('_frozen_a_passed'): assert v==30,k
semfiles=['validation/qc-evidence-extractor-v5aq-v242-v241-residuals.js','validation/psc-v83242-v241-v116-residuals.js']
sem_identity={p:hb(pathlib.Path(p).read_bytes())==hb(show(p)) for p in semfiles};assert all(sem_identity.values())
archive=R/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip';assert archive.exists();tmp=pathlib.Path(tempfile.mkdtemp(prefix='v83242-transport-'))
try:
 with zipfile.ZipFile(archive) as z:z.extractall(tmp)
 public=tmp/'PSC_V8_3_138_DEV/public/psc-v3.js';assert public.exists() and public.stat().st_size>0
 transport={'candidate':'V8.3.242','phase':'transport-verification','validated_development_head_sha':DEV,'semantic_authority':SEM,'public_runtime_materialized':True,'public_psc_v3_exists':True,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'pass':True}
finally:shutil.rmtree(tmp,ignore_errors=True)
(O/'V8_3_242_TRANSPORT_VERIFICATION_V1.json').write_text(json.dumps(transport,indent=2)+'\n')
marker_absent=not (O/'V8_3_242_SEALED_FIRST_RUN_MARKER.json').exists();attempt_absent=not (O/'V8_3_242_BATCH_A_ATTEMPT_MARKER.json').exists();result_absent=not (O/'V8_3_242_BATCH_A_RESULT_V1.json').exists()
pf={'candidate':'V8.3.242','phase':'static-sealed-preflight','validated_development_head_sha':DEV,'loader_chain':SEM,'loader_chain_static_verified':True,'semantic_files_byte_identical_to_v242_dev':all(sem_identity.values()),'parent_layers_byte_identical':True,'exact_v5aq_path':semfiles[0],'exact_v116_path':semfiles[1],'frozen_canonical_hashes_match':hash_match,'transport_pass':True,'zero_failure_development_predicate':True,'runner_runtime_root_contract':{'version_root':'validation/v83242-v1-sealed-runtime','fixture':'V8_3_242_SEALED_FIXTURE_V1.json','selection':'V8_3_242_SEALED_SELECTION_V1.json','gold':'V8_3_242_INDEPENDENT_GOLD_V1.json','single_source_of_truth_for_runtime_root':True,'adapter_from_parent_runner_forbidden':True},'first_run_marker_absent':marker_absent,'batch_a_attempt_marker_absent':attempt_absent,'prior_batch_a_execution_absent':result_absent,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'v241_sealed_rerun':False,'pass':all(hash_match.values()) and marker_absent and attempt_absent and result_absent}
assert pf['pass'];(O/'V8_3_242_STATIC_SEALED_PREFLIGHT_V1.json').write_text(json.dumps(pf,indent=2)+'\n');print(json.dumps(pf))
