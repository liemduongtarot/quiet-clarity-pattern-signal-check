import json,pathlib,subprocess,hashlib
R=pathlib.Path('.')
BASE='06ac0e51c958f5c64dcb97f91d66b122d3048bf8'
SEMBASE='456a88d01b671f0cb92a0be31f4d34d68f60d135'
V220='refs/remotes/origin/v83220-v1-sealed-validation'
subprocess.run(['git','fetch','--depth=1','origin','refs/heads/v83220-v1-sealed-validation:refs/remotes/origin/v83220-v1-sealed-validation'],check=True,stdout=subprocess.DEVNULL)
def show(path):
    return subprocess.check_output(['git','show',f'{V220}:{path}'],text=True)
auth=json.loads(show('validation/v83220-v1-sealed/V8_3_220_SEALED_AUTHORITY_V1.json'))
autopsy=json.loads(show('validation/v83220-v1-sealed/V8_3_220_BATCH_A_FAILURE_AUTOPSY_V1.json'))
marker=json.loads(show('validation/v83220-v1-sealed/V8_3_220_BATCH_A_ATTEMPT_MARKER.json'))
assert auth['validated_development_head_sha']==BASE
assert auth['semantic_authority']=='QCEvidenceExtractorV5Y -> QCSemanticCoreV98'
assert auth['preseal_pass'] is True
assert 'semantic_base_sha' not in auth
assert autopsy['classification']=='VALIDATION RUNNER / INFRASTRUCTURE'
assert "KeyError: 'semantic_base_sha'" in autopsy['ACTUAL']
assert marker['validated_development_head_sha']==BASE and marker['reserved_before_semantic_execution'] is True
# Correct V8.3.221 runner schema contract: validate only fields actually frozen in V8.3.220 sealed authority.
corrected_contract={
  'validated_development_head_sha':auth['validated_development_head_sha'],
  'semantic_authority':auth['semantic_authority'],
  'preseal_pass':auth['preseal_pass'],
  'hash_contract':auth['hash_contract']
}
assert corrected_contract=={
  'validated_development_head_sha':BASE,
  'semantic_authority':'QCEvidenceExtractorV5Y -> QCSemanticCoreV98',
  'preseal_pass':True,
  'hash_contract':'canonical-json-sort-keys-compact'
}
# Prove semantic source preservation from the exact V8.3.220 DEVELOPMENT authority.
semfiles=[
 'validation/qc-evidence-extractor-v5x-v217-relational-recall.js',
 'validation/psc-v83217-v216-v97-relational-recall.js',
 'validation/qc-evidence-extractor-v5y-v220-bounded-recall.js',
 'validation/psc-v83220-v219-v98-bounded-recall.js'
]
for p in semfiles:
    here=pathlib.Path(p).read_bytes()
    base=subprocess.check_output(['git','show',f'{BASE}:{p}'])
    assert here==base,p
# V5X/V97 remain byte-identical to the original semantic base.
for p in semfiles[:2]:
    assert pathlib.Path(p).read_bytes()==subprocess.check_output(['git','show',f'{SEMBASE}:{p}']),p
# Run exact V8.3.220 DEVELOPMENT regression architecture as preservation regression.
cp=subprocess.run(['python','validation/v83220-v98-regression-orchestrator.py'],text=True)
assert cp.returncode==0
reg=json.loads((R/'validation/V8_3_220_V98_REGRESSION_RECEIPT.json').read_text())
assert reg['immutable_regression_total']==1470 and reg['immutable_regression_passed']==1470
assert reg['v216_frozen_a_total']==30 and reg['v216_frozen_a_passed']==30
assert reg['v219_frozen_a_total']==30 and reg['v219_frozen_a_passed']==30
receipt={
 'candidate':'V8.3.221',
 'phase':'bounded-runner-schema-recovery',
 'base_development_authority_sha':BASE,
 'semantic_base_sha':SEMBASE,
 'semantic_authority':'QCEvidenceExtractorV5Y -> QCSemanticCoreV98',
 'repair_scope':'validation runner adapter/schema contract only',
 'checks':{
   'v220_failure_reproduced_from_frozen_evidence':True,
   'v220_authority_semantic_base_sha_absent':True,
   'corrected_schema_contract_uses_present_fields_only':True,
   'v5x_v97_byte_identical':True,
   'v5y_v98_byte_identical_to_v220_dev':True,
   'immutable_historical_1470_1470':True,
   'v216_frozen_a_30_30':True,
   'v219_frozen_a_30_30':True,
   'v220_sealed_rerun':False,
   'expected_gold_changed':False
 },
 'sealed_validation_executed':False,
 'step_111_authorized':False,
 'production_authorized':False,
 'pass':True
}
(R/'validation/V8_3_221_BOUNDED_RUNNER_SCHEMA_RECOVERY_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
