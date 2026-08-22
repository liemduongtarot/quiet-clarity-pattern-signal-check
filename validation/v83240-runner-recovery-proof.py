import json,hashlib,pathlib,subprocess
R=pathlib.Path('.')
BASE='00ad4e2e12d58a22f26f171523c67231c662d325'
E='validation/qc-evidence-extractor-v5ao-v239-v238-residuals.js'
C='validation/psc-v83239-v238-v114-v238-residuals.js'
def sha(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def show(p): return subprocess.check_output(['git','show',f'{BASE}:{p}'])
assert pathlib.Path(E).exists() and pathlib.Path(C).exists()
assert sha(E)==hashlib.sha256(show(E)).hexdigest()
assert sha(C)==hashlib.sha256(show(C)).hexdigest()
reg=json.loads(pathlib.Path('validation/V8_3_239_V114_REGRESSION_RECEIPT.json').read_text())
assert reg['conclusion']=='success' and reg['immutable_regression_passed']==1470 and reg['v238_frozen_a_passed']==30
receipt={'candidate':'V8.3.240','phase':'runner-plumbing-recovery-proof','semantic_authority':'QCEvidenceExtractorV5AO -> QCSemanticCoreV114','base_development_sha':BASE,'extractor_path':E,'core_path':C,'semantic_files_byte_identical':True,'v239_development_regression_preserved':True,'v239_batch_a_rerun':False,'v239_semantic_runtime_executed':False,'sealed_validation_executed':False,'expected_gold_changed':False,'step_111_authorized':False,'production_authorized':False,'conclusion':'success'}
pathlib.Path('validation/V8_3_240_RUNNER_PLUMBING_RECOVERY_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
