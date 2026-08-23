import json,hashlib,pathlib,subprocess,zipfile,tempfile,shutil
R=pathlib.Path('.');V=R/'validation';O=V/'v83254-v1-sealed';DEV='238cdba6ee2d4d17bcde19de2d895a7087983345';BASE='89db04ec936af998c14d2f0451ef87270ea8e349';SEM='QCEvidenceExtractorV5AY -> QCSemanticCoreV124'
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def ho(o):return hashlib.sha256(canon(o)).hexdigest()
def hb(b):return hashlib.sha256(b).hexdigest()
def fsha(p):return hb(pathlib.Path(p).read_bytes())
def show(ref,path):return subprocess.check_output(['git','show',f'{ref}:{path}'])
a=json.loads((O/'V8_3_254_SEALED_AUTHORITY_V1.json').read_text());rec=json.loads((O/'V8_3_254_PRESEAL_RUN_RECEIPT.json').read_text());mat=json.loads((O/'V8_3_254_RUNNER_MATERIALIZATION_V1.json').read_text());devrec=json.loads(show(DEV,'validation/V8_3_254_DEVELOPMENT_EVIDENCE_REGRESSION_RECEIPT_V1.json'))
assert a['validated_development_head_sha']==DEV and a['base_exact_development_sha']==BASE and a['semantic_authority']==SEM and a['preseal_pass'] is True
assert rec['conclusion']=='success' and devrec['conclusion']=='success' and devrec['immutable_regression_passed']==1470 and devrec['semantic_change'] is False and devrec['v253_sealed_rerun'] is False
paths={'candidate_bank':'V8_3_254_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_254_SEALED_SELECTION_V1.json','fixture':'V8_3_254_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_254_INDEPENDENT_GOLD_V1.json','membership':'V8_3_254_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_254_PRESEAL_DIVERSITY_AUDIT_V1.json','contamination_duplicate_audit':'V8_3_254_CONTAMINATION_DUPLICATE_AUDIT_V1.json','semantic_fingerprints':'V8_3_254_SEMANTIC_FINGERPRINTS_V1.json'}
hash_match={k:ho(json.loads((O/n).read_text()))==a['hashes'][k] for k,n in paths.items()};assert all(hash_match.values())
cont=json.loads((O/paths['contamination_duplicate_audit']).read_text());div=json.loads((O/paths['preseal_audit']).read_text());assert cont['pass'] and div['pass'] and not cont['pairs_at_or_above_0_75'] and not cont['exact_surface_duplicates'] and not cont['semantic_fingerprint_exact_duplicates']
identity=json.loads((O/'V8_3_254_SEMANTIC_SOURCE_IDENTITY_REPORT_V1.json').read_text());manifest=json.loads((O/'V8_3_254_RUNTIME_CONFIG_SCHEMA_MANIFEST_V1.json').read_text());assert identity['pass'] and identity['all_byte_identical_to_frozen_development'] and identity['loaded_semantic_source_count']>=55 and manifest['pass']
runner=V/'v83254-batch-a-self-contained.py';assert fsha(runner)==mat['runner_sha256'];text=runner.read_text()
required=['V8_3_254_BATCH_A_RESERVATION_V1.json','V8_3_254_BATCH_A_CASE_PROVENANCE_V1.json','V8_3_254_BATCH_A_EXECUTION_LEDGER_V1.json','execution_ordinal','executed_at_utc','previous_record_sha256','schema_contract_sha256','runtime_case_timestamp_capture','QCSemanticCoreV124.analyze',DEV]
# runtime_case_timestamp_capture is in receipt rather than runner; check separately.
assert all(x in text for x in required if x!='runtime_case_timestamp_capture') and mat['runtime_case_timestamp_capture'] is True and mat['append_only_ledger'] is True and mat['case_level_hash_chain'] is True
for n in ['V8_3_254_HARNESS_POSITIVE_TEST_V1.json','V8_3_254_HARNESS_NEGATIVE_MISSING_FIELD_TEST_V1.json','V8_3_254_HARNESS_MUTATION_DETECTION_TEST_V1.json']:
    assert json.loads((O/n).read_text())['pass'] is True
contract_copy=O/'V8_3_254_EVIDENCE_PROVENANCE_CONTRACT_COPY_V1.json';assert fsha(contract_copy)==fsha(V/'V8_3_254_EVIDENCE_PROVENANCE_CONTRACT_V1.json')==devrec['evidence_contract_sha256']
# Public runtime transport materialization from exact frozen DEVELOPMENT authority.
archive=R/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip';assert archive.exists();tmp=pathlib.Path(tempfile.mkdtemp(prefix='v83254-transport-'))
try:
    with zipfile.ZipFile(archive) as z:z.extractall(tmp)
    public=tmp/'PSC_V8_3_138_DEV/public/psc-v3.js';assert public.exists() and public.stat().st_size>0
    public_hash=fsha(public);archive_hash=fsha(archive)
finally:shutil.rmtree(tmp,ignore_errors=True)
transport={'candidate':'V8.3.254','phase':'transport-verification','validated_development_head_sha':DEV,'base_exact_development_sha':BASE,'semantic_authority':SEM,'public_runtime_materialized':True,'public_runtime_sha256':public_hash,'base_archive_sha256':archive_hash,'self_contained_runner_verified':True,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'v253_sealed_rerun':False,'pass':True};(O/'V8_3_254_TRANSPORT_VERIFICATION_V1.json').write_text(json.dumps(transport,indent=2)+'\n')
# Freeze runtime manifest extension with transport hashes without changing sealed semantic objects.
manifest['public_runtime_sha256']=public_hash;manifest['base_archive_sha256']=archive_hash;manifest['transport_verified']=True;(O/'V8_3_254_RUNTIME_CONFIG_SCHEMA_MANIFEST_V1.json').write_text(json.dumps(manifest,indent=2)+'\n')
absence_names=['V8_3_254_SEALED_FIRST_RUN_MARKER.json','V8_3_254_BATCH_A_ATTEMPT_MARKER.json','V8_3_254_BATCH_A_RESERVATION_V1.json','V8_3_254_BATCH_A_RESULT_V1.json','V8_3_254_BATCH_A_STATUS_V1.json','V8_3_254_BATCH_A_CASE_PROVENANCE_V1.json','V8_3_254_BATCH_A_EXECUTION_LEDGER_V1.json','V8_3_254_BATCH_B_ATTEMPT_MARKER.json','V8_3_254_BATCH_B_RESULT_V1.json','V8_3_254_BATCH_B_STATUS_V1.json']
absence={n:not (O/n).exists() for n in absence_names};assert all(absence.values())
sel=json.loads((O/paths['selection']).read_text());assert len(sel['batch_a'])==30 and len(sel['batch_b'])==30 and set(sel['batch_a']).isdisjoint(sel['batch_b'])
pf={'candidate':'V8.3.254','phase':'hardened-static-transport-evidence-preflight','validated_development_head_sha':DEV,'base_exact_development_sha':BASE,'semantic_authority':SEM,'development_regression':'1470/1470','semantic_change':False,'expected_gold_changed':False,'v253_sealed_rerun':False,'canonical_hashes_match':hash_match,'preseal_diversity_pass':True,'contamination_duplicate_pass':True,'semantic_source_identity_pass':True,'loaded_semantic_source_count':identity['loaded_semantic_source_count'],'runner_hash_verified':True,'runtime_case_timestamp_capture':True,'append_only_ledger_contract':True,'case_hash_chain_contract':True,'provenance_harness_tests_pass':True,'contract_hash_verified':True,'transport_pass':True,'batch_a_b_disjoint':True,'pre_execution_absence':absence,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'batch_a_executed':False,'batch_b_executed':False,'step_111_authorized':False,'production_authorized':False,'pass':True};(O/'V8_3_254_STATIC_SEALED_PREFLIGHT_V1.json').write_text(json.dumps(pf,indent=2)+'\n');print(json.dumps(pf))
