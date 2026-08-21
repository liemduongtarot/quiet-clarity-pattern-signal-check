import json,hashlib,pathlib,subprocess,zipfile,shutil
R=pathlib.Path('.');O=R/'validation/v83223-v1-sealed';DEV='857e98039a6d603fdcae2ec90f471ffd0bbabbb8'
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def h(o):return hashlib.sha256(canon(o)).hexdigest()
def fsha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
A=json.loads((O/'V8_3_223_SEALED_AUTHORITY_V1.json').read_text());assert A['validated_development_head_sha']==DEV and A['preseal_pass'] is True
names={'candidate_bank':'V8_3_223_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_223_SEALED_SELECTION_V1.json','fixture':'V8_3_223_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_223_INDEPENDENT_GOLD_V1.json','membership':'V8_3_223_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_223_PRESEAL_DIVERSITY_AUDIT_V1.json'}
checks={}
for k,n in names.items():
 o=json.loads((O/n).read_text()); checks[k]=h(o)==A['hashes'][k]
assert all(checks.values())
# Transport bundle: frozen sealed inputs only, no runtime.
stage=R/'V8_3_223_TRANSPORT_BUNDLE';shutil.rmtree(stage,ignore_errors=True);stage.mkdir()
for n in names.values():shutil.copy2(O/n,stage/n)
shutil.copy2(O/'V8_3_223_SEALED_AUTHORITY_V1.json',stage/'V8_3_223_SEALED_AUTHORITY_V1.json')
zip_path=R/'PSC_V8_3_223_TRANSPORT_BUNDLE.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(stage.iterdir()):z.write(p,p.name)
with zipfile.ZipFile(zip_path) as z:
 assert z.testzip() is None; assert set(z.namelist())=={p.name for p in stage.iterdir()}
raw={p.name:fsha(p) for p in stage.iterdir()}
transport={'candidate':'V8.3.223','phase':'transport-only','validated_development_head_sha':DEV,'frozen_canonical_hashes_match':checks,'zip_integrity':True,'bundle_purity':True,'raw_file_hashes':raw,'bundle_sha256':fsha(zip_path),'semantic_runtime_executed':False,'semantic_authority_loaded':False,'batch_a_executed':False,'batch_b_executed':False,'pass':True}
(O/'V8_3_223_TRANSPORT_VERIFICATION_V1.json').write_text(json.dumps(transport,indent=2)+'\n')
# Static chain identity against exact DEVELOPMENT SHA.
chain=['validation/qc-evidence-extractor-v5x-v217-relational-recall.js','validation/psc-v83217-v216-v97-relational-recall.js','validation/qc-evidence-extractor-v5y-v220-bounded-recall.js','validation/psc-v83220-v219-v98-bounded-recall.js','validation/qc-evidence-extractor-v5z-v222-compositional-generalization.js','validation/psc-v83222-v221-v99-compositional-generalization.js','validation/qc-evidence-extractor-v5aa-v223-precedence-generalization.js','validation/psc-v83223-v222-v100-precedence-generalization.js']
identity={}
for p in chain:
 local=R/p;assert local.exists(),p
 exact=subprocess.check_output(['git','show',f'{DEV}:{p}'])
 identity[p]=hashlib.sha256(local.read_bytes()).hexdigest()==hashlib.sha256(exact).hexdigest()
assert all(identity.values())
# Parent layers must also be identical to V222 DEVELOPMENT parent authority.
PARENT='8fd91bfd1e9abdc25b9af12a9494b8e2f14e9f16'
parent_identity={}
for p in chain[:-2]:
 a=subprocess.check_output(['git','show',f'{DEV}:{p}']);b=subprocess.check_output(['git','show',f'{PARENT}:{p}']);parent_identity[p]=hashlib.sha256(a).hexdigest()==hashlib.sha256(b).hexdigest()
assert all(parent_identity.values())
# DEVELOPMENT zero-failure predicate.
dr=json.loads(subprocess.check_output(['git','show',f'{DEV}:validation/V8_3_223_V100_REGRESSION_RECEIPT.json'],text=True));assert dr['conclusion']=='success' and dr['immutable_regression_passed']==1470 and dr['v216_frozen_a_passed']==30 and dr['v219_frozen_a_passed']==30 and dr['v221_frozen_a_passed']==30 and dr['v222_frozen_a_passed']==30
markers=['V8_3_223_BATCH_A_ATTEMPT_MARKER.json','V8_3_223_SEALED_FIRST_RUN_MARKER.json','V8_3_223_BATCH_A_RESULT_V1.json']
absent=all(not (O/x).exists() for x in markers);assert absent
preflight={'candidate':'V8.3.223','phase':'static-sealed-preflight','validated_development_head_sha':DEV,'loader_chain':'QCEvidenceExtractorV5AA -> QCSemanticCoreV100','loader_chain_static_verified':True,'semantic_files_byte_identical_to_v223_dev':all(identity.values()),'parent_layers_byte_identical':all(parent_identity.values()),'frozen_canonical_hashes_match':checks,'transport_pass':True,'zero_failure_development_predicate':True,'first_run_marker_absent':True,'prior_batch_a_execution_absent':True,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'v219_sealed_rerun':False,'v220_sealed_rerun':False,'v221_sealed_rerun':False,'v222_sealed_rerun':False,'pass':True}
(O/'V8_3_223_STATIC_SEALED_PREFLIGHT_V1.json').write_text(json.dumps(preflight,indent=2)+'\n')
print(json.dumps({'transport':transport,'preflight':preflight}))
