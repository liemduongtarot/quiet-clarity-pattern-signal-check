import json,hashlib,pathlib,subprocess
R=pathlib.Path('.');O=R/'validation/v83222-v1-sealed';DEV='8fd91bfd1e9abdc25b9af12a9494b8e2f14e9f16';SEMBASE='456a88d01b671f0cb92a0be31f4d34d68f60d135'
A=json.loads((O/'V8_3_222_SEALED_AUTHORITY_V1.json').read_text());FILES={'candidate_bank':'V8_3_222_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_222_SEALED_SELECTION_V1.json','fixture':'V8_3_222_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_222_INDEPENDENT_GOLD_V1.json','membership':'V8_3_222_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_222_PRESEAL_DIVERSITY_AUDIT_V1.json'}
def csha(p):
 o=json.loads(pathlib.Path(p).read_text());return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def show(ref,path):
 p=subprocess.run(['git','show',f'{ref}:{path}'],capture_output=True);assert p.returncode==0,p.stderr.decode();return p.stdout
assert A['validated_development_head_sha']==DEV and A['semantic_authority']=='QCEvidenceExtractorV5Z -> QCSemanticCoreV99' and A['preseal_pass'] is True
hm={k:csha(O/n)==A['hashes'][k] for k,n in FILES.items()};assert all(hm.values())
tr=json.loads((O/'V8_3_222_TRANSPORT_VERIFICATION_V1.json').read_text());assert tr['pass'] is True
semfiles=['validation/qc-evidence-extractor-v5x-v217-relational-recall.js','validation/psc-v83217-v216-v97-relational-recall.js','validation/qc-evidence-extractor-v5y-v220-bounded-recall.js','validation/psc-v83220-v219-v98-bounded-recall.js','validation/qc-evidence-extractor-v5z-v222-compositional-generalization.js','validation/psc-v83222-v221-v99-compositional-generalization.js']
unchanged=all(pathlib.Path(p).read_bytes()==show(DEV,p) for p in semfiles);assert unchanged
parent=all(pathlib.Path(p).read_bytes()==show(SEMBASE,p) for p in semfiles[:2]);assert parent
v5z=pathlib.Path(semfiles[-2]).read_text();v99=pathlib.Path(semfiles[-1]).read_text();chain=('global.QCEvidenceExtractorV5Z' in v5z and 'QCEvidenceExtractorV5Z' in v99 and 'global.QCSemanticCoreV99' in v99);assert chain
reg=json.loads(show(DEV,'validation/V8_3_222_V99_REGRESSION_RECEIPT.json').decode());zero=(reg['immutable_regression_passed']==1470 and reg['v216_frozen_a_passed']==30 and reg['v219_frozen_a_passed']==30 and reg['v221_frozen_a_passed']==30);assert zero
markers_absent=all(not (O/n).exists() for n in ['V8_3_222_SEALED_FIRST_RUN_MARKER.json','V8_3_222_BATCH_A_ATTEMPT_MARKER.json','V8_3_222_BATCH_A_RESULT_V1.json']);assert markers_absent
res={'candidate':'V8.3.222','phase':'static-sealed-preflight','validated_development_head_sha':DEV,'loader_chain':'QCEvidenceExtractorV5Z -> QCSemanticCoreV99','loader_chain_static_verified':chain,'semantic_files_byte_identical_to_v222_dev':unchanged,'v5x_v97_byte_identical_to_parent':parent,'frozen_canonical_hashes_match':hm,'transport_pass':True,'development_authority_pass':True,'zero_failure_development_predicate':True,'first_run_marker_absent':True,'prior_batch_a_execution_absent':True,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'v219_sealed_rerun':False,'v220_sealed_rerun':False,'v221_sealed_rerun':False,'pass':True};(O/'V8_3_222_STATIC_SEALED_PREFLIGHT_V1.json').write_text(json.dumps(res,indent=2)+'\n');print(json.dumps(res))
