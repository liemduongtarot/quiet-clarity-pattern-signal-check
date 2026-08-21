import json,hashlib,pathlib,subprocess,zipfile,shutil
R=pathlib.Path('.');O=R/'validation/v83224-v1-sealed';DEV='93340ec0488207f31a48c82e7b916ff709f700ab'
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def h(o):return hashlib.sha256(canon(o)).hexdigest()
def fsha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
A=json.loads((O/'V8_3_224_SEALED_AUTHORITY_V1.json').read_text());assert A['validated_development_head_sha']==DEV and A['preseal_pass'] is True
names={'candidate_bank':'V8_3_224_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_224_SEALED_SELECTION_V1.json','fixture':'V8_3_224_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_224_INDEPENDENT_GOLD_V1.json','membership':'V8_3_224_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_224_PRESEAL_DIVERSITY_AUDIT_V1.json'};checks={k:h(json.loads((O/n).read_text()))==A['hashes'][k] for k,n in names.items()};assert all(checks.values())
stage=R/'V8_3_224_TRANSPORT_BUNDLE';shutil.rmtree(stage,ignore_errors=True);stage.mkdir()
for n in names.values():shutil.copy2(O/n,stage/n)
shutil.copy2(O/'V8_3_224_SEALED_AUTHORITY_V1.json',stage/'V8_3_224_SEALED_AUTHORITY_V1.json');z=R/'PSC_V8_3_224_TRANSPORT_BUNDLE.zip'
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as q:
 for p in sorted(stage.iterdir()):q.write(p,p.name)
with zipfile.ZipFile(z) as q:assert q.testzip() is None and set(q.namelist())=={p.name for p in stage.iterdir()}
transport={'candidate':'V8.3.224','phase':'transport-only','validated_development_head_sha':DEV,'frozen_canonical_hashes_match':checks,'zip_integrity':True,'bundle_purity':True,'bundle_sha256':fsha(z),'semantic_runtime_executed':False,'semantic_authority_loaded':False,'batch_a_executed':False,'batch_b_executed':False,'pass':True};(O/'V8_3_224_TRANSPORT_VERIFICATION_V1.json').write_text(json.dumps(transport,indent=2)+'\n')
chain=['validation/qc-evidence-extractor-v5x-v217-relational-recall.js','validation/psc-v83217-v216-v97-relational-recall.js','validation/qc-evidence-extractor-v5y-v220-bounded-recall.js','validation/psc-v83220-v219-v98-bounded-recall.js','validation/qc-evidence-extractor-v5z-v222-compositional-generalization.js','validation/psc-v83222-v221-v99-compositional-generalization.js','validation/qc-evidence-extractor-v5aa-v223-precedence-generalization.js','validation/psc-v83223-v222-v100-precedence-generalization.js','validation/qc-evidence-extractor-v5ab-v224-compositional-recall.js','validation/psc-v83224-v223-v101-compositional-recall.js']
identity={}
for p in chain:
 exact=subprocess.check_output(['git','show',f'{DEV}:{p}']);identity[p]=hashlib.sha256((R/p).read_bytes()).hexdigest()==hashlib.sha256(exact).hexdigest()
assert all(identity.values())
dr=json.loads(subprocess.check_output(['git','show',f'{DEV}:validation/V8_3_224_V101_REGRESSION_RECEIPT.json'],text=True));assert dr['conclusion']=='success' and all(dr[k]==30 for k in ['v216_frozen_a_passed','v219_frozen_a_passed','v221_frozen_a_passed','v222_frozen_a_passed','v223_frozen_a_passed']) and dr['immutable_regression_passed']==1470
absent=all(not (O/n).exists() for n in ['V8_3_224_BATCH_A_ATTEMPT_MARKER.json','V8_3_224_SEALED_FIRST_RUN_MARKER.json','V8_3_224_BATCH_A_RESULT_V1.json']);assert absent
pre={'candidate':'V8.3.224','phase':'static-sealed-preflight','validated_development_head_sha':DEV,'loader_chain':'QCEvidenceExtractorV5AB -> QCSemanticCoreV101','loader_chain_static_verified':True,'semantic_files_byte_identical_to_v224_dev':True,'frozen_canonical_hashes_match':checks,'transport_pass':True,'zero_failure_development_predicate':True,'first_run_marker_absent':True,'prior_batch_a_execution_absent':True,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'v219_sealed_rerun':False,'v220_sealed_rerun':False,'v221_sealed_rerun':False,'v222_sealed_rerun':False,'v223_sealed_rerun':False,'pass':True};(O/'V8_3_224_STATIC_SEALED_PREFLIGHT_V1.json').write_text(json.dumps(pre,indent=2)+'\n');print(json.dumps({'transport':transport,'preflight':pre}))
