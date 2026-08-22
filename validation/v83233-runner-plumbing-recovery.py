import json,pathlib,subprocess,hashlib
R=pathlib.Path('.');BASE='7731574dd6db5d4c257dc088f5e791b1e980d5be';SEM='QCEvidenceExtractorV5AI -> QCSemanticCoreV108'
def show(ref,path):return subprocess.check_output(['git','show',f'{ref}:{path}'])
def hb(b):return hashlib.sha256(b).hexdigest()
# Freeze exact V232 infrastructure failure without rerun.
subprocess.run(['git','fetch','--depth=1','origin','refs/heads/v83232-v1-sealed-validation:refs/remotes/origin/v83232-v1-sealed-validation'],check=True,stdout=subprocess.DEVNULL)
st=json.loads(subprocess.check_output(['git','show','origin/v83232-v1-sealed-validation:validation/v83232-v1-sealed/V8_3_232_BATCH_A_STATUS_V1.json'],text=True))
assert st['batch_a_attempt_consumed'] is True and st['batch_a_executed'] is False and st['semantic_runtime_executed'] is False and st['failure_layer']=='VALIDATION RUNNER / INFRASTRUCTURE' and st['frozen_on_batch_a_failure'] is True
# Semantic authority remains exact V232 DEVELOPMENT bytes and zero-failure regression authority.
reg=json.loads(show(BASE,'validation/V8_3_232_V108_REGRESSION_RECEIPT.json'));auth=json.loads(show(BASE,'validation/V8_3_232_DEVELOPMENT_AUTHORITY_V1.json'))
assert reg['conclusion']=='success' and reg['immutable_regression_passed']==1470 and reg['v216_frozen_a_passed']==30 and auth['regression_pass'] is True
for k in ['v219_frozen_a_passed','v221_frozen_a_passed','v222_frozen_a_passed','v223_frozen_a_passed','v224_frozen_a_passed','v225_frozen_a_passed','v226_frozen_a_passed','v227_frozen_a_passed','v229_frozen_a_passed','v230_frozen_a_passed','v231_frozen_a_passed']:assert reg[k]==30,k
semfiles=['validation/qc-evidence-extractor-v5ai-v232-residual-isolated-generalization.js','validation/psc-v83232-v231-v108-residual-isolated-generalization.js']
ident={p:hb(pathlib.Path(p).read_bytes())==hb(show(BASE,p)) for p in semfiles};assert all(ident.values())
receipt={'candidate':'V8.3.233','phase':'runner-plumbing-recovery','base_development_sha':BASE,'semantic_authority':SEM,'semantic_change_from_v232':False,'frozen_v232_failure_reproduced':True,'failure_layer':'VALIDATION RUNNER / INFRASTRUCTURE','v232_batch_a_rerun':False,'v232_semantic_runtime_executed':False,'semantic_parent_identity':ident,'immutable_regression':'1470/1470','v216_frozen_a':'30/30','prior_frozen_a_regressions':{'219':'30/30','221':'30/30','222':'30/30','223':'30/30','224':'30/30','225':'30/30','226':'30/30','227':'30/30','229':'30/30','230':'30/30','231':'30/30'},'runner_contract':{'version_root':'validation/v83233-v1-sealed-runtime','fixture':'V8_3_233_SEALED_FIXTURE_V1.json','selection':'V8_3_233_SEALED_SELECTION_V1.json','gold':'V8_3_233_INDEPENDENT_GOLD_V1.json','single_source_of_truth_for_runtime_root':True,'adapter_from_parent_runner_forbidden':True},'expected_gold_changed':False,'sealed_validation_executed':False,'production_authorized':False,'step_111_authorized':False,'conclusion':'success'}
pathlib.Path('validation/V8_3_233_RUNNER_PLUMBING_RECOVERY_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
