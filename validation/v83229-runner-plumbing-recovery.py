from pathlib import Path
import json,subprocess,hashlib
BASE='2d5725e4b12f532ca9b710083e55e21efdb6c686'
SEM='QCEvidenceExtractorV5AF -> QCSemanticCoreV105'
# Immutable V8.3.228 first-run failure evidence.
subprocess.run(['git','fetch','--depth=1','origin','refs/heads/v83228-v1-sealed-validation:refs/remotes/origin/v83228-v1-sealed-validation'],check=True,stdout=subprocess.DEVNULL)
aut=json.loads(subprocess.check_output(['git','show','origin/v83228-v1-sealed-validation:validation/v83228-v1-sealed/V8_3_228_BATCH_A_FAILURE_AUTOPSY_V1.json'],text=True))
status=json.loads(subprocess.check_output(['git','show','origin/v83228-v1-sealed-validation:validation/v83228-v1-sealed/V8_3_228_BATCH_A_STATUS_V1.json'],text=True))
assert aut['failure_layer']=='VALIDATION RUNNER / INFRASTRUCTURE'
assert status['batch_a_attempt_consumed'] is True and status['batch_a_executed'] is False and status['semantic_runtime_executed'] is False
assert 'v83227-v1-sealed-runtime' in aut['exact_error']
# Exact V8.3.228 DEVELOPMENT semantic regression remains authority and must be clean.
reg=json.loads(subprocess.check_output(['git','show',f'{BASE}:validation/V8_3_228_V105_REGRESSION_RECEIPT.json'],text=True))
assert reg['conclusion']=='success' and reg['immutable_regression_passed']==1470 and reg['v216_frozen_a_passed']==30
for k in ['v219_frozen_a_passed','v221_frozen_a_passed','v222_frozen_a_passed','v223_frozen_a_passed','v224_frozen_a_passed','v225_frozen_a_passed','v226_frozen_a_passed','v227_frozen_a_passed']: assert reg[k]==30,k
assert reg['v227_previous_failures_repaired']==13 and reg['v227_previous_passes_preserved']==17
assert reg['expected_gold_changed'] is False and reg['sealed_validation_executed'] is False
# Parent semantic files are byte-identical to exact DEVELOPMENT authority.
semfiles=['validation/qc-evidence-extractor-v5af-v228-witness-completion.js','validation/psc-v83228-v227-v105-witness-completion.js']
identity={p:Path(p).read_bytes()==subprocess.check_output(['git','show',f'{BASE}:{p}']) for p in semfiles}
assert all(identity.values())
# Freeze a self-contained runner-path contract. V229 sealed runners MUST construct paths from one VERSION_ROOT constant.
contract={
 'candidate':'V8.3.229','phase':'runner-plumbing-recovery','base_development_sha':BASE,'semantic_authority':SEM,
 'frozen_v228_failure_reproduced':True,'failure_layer':'VALIDATION RUNNER / INFRASTRUCTURE',
 'v228_batch_a_rerun':False,'v228_semantic_runtime_executed':False,
 'semantic_parent_identity':identity,'immutable_regression':'1470/1470','v216_frozen_a':'30/30',
 'prior_frozen_a_regressions':{str(v):'30/30' for v in [219,221,222,223,224,225,226,227]},
 'runner_contract':{
   'version_root':'validation/v83229-v1-sealed-runtime',
   'fixture':'V8_3_229_SEALED_FIXTURE_V1.json','selection':'V8_3_229_SEALED_SELECTION_V1.json','gold':'V8_3_229_INDEPENDENT_GOLD_V1.json',
   'single_source_of_truth_for_runtime_root':True,'parent_runtime_root_literal_forbidden':'validation/v83228-v1-sealed-runtime',
   'older_parent_runtime_root_literal_forbidden':'validation/v83227-v1-sealed-runtime'
 },
 'expected_gold_changed':False,'sealed_validation_executed':False,'production_authorized':False,'step_111_authorized':False,'conclusion':'success'
}
Path('validation/V8_3_229_RUNNER_PLUMBING_RECOVERY_RECEIPT.json').write_text(json.dumps(contract,indent=2)+'\n')
print(json.dumps(contract))
