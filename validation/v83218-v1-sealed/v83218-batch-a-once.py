import subprocess

# Mechanical adaptation of the frozen V8.3.217 protected runner architecture.
# V8.3.217 sealed data/results are never executed or reused; only runner structure is adapted.
subprocess.run(['git','fetch','--depth=1','origin','refs/heads/v83217-v1-sealed-validation:refs/remotes/origin/v83217-v1-sealed-validation'],check=True)
src=subprocess.check_output(['git','show','origin/v83217-v1-sealed-validation:validation/v83217-v1-sealed/v83217-batch-a-once.py'],text=True)
src=src.replace("TARGET='456a88d01b671f0cb92a0be31f4d34d68f60d135'","TARGET='9d946d3ddf8b98c2b3f80e1b5b849b12415381c2'",1)
src=src.replace("SEALED=REPO/'validation'/'v83217-v1-sealed'","SEALED=REPO/'validation'/'v83218-v1-sealed'",1)
src=src.replace("WORK=pathlib.Path('/tmp/v83217-batch-a-authority')","WORK=pathlib.Path('/tmp/v83218-batch-a-authority')",1)
src=src.replace('V8_3_217','V8_3_218').replace('V8.3.217','V8.3.218')
src=src.replace('v83217-v1-sealed-runtime','v83218-v1-sealed-runtime')
src=src.replace("auth['semantic_authority']=='QCSemanticCoreV97'","auth['semantic_authority']=='QCEvidenceExtractorV5X -> QCSemanticCoreV97'",1)
src=src.replace("'v216_sealed_rerun':False","'v217_sealed_rerun':False")
# Exact bounded repair: materialize the historical public loader tree before Node loads the chain.
needle="assert subprocess.check_output(['git','-C',str(WORK),'rev-parse','HEAD'],text=True).strip()==TARGET\nVAL=WORK/'validation'"
insert="assert subprocess.check_output(['git','-C',str(WORK),'rev-parse','HEAD'],text=True).strip()==TARGET\nwith zipfile.ZipFile(WORK/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip') as _z: _z.extractall(WORK)\nassert (WORK/'PSC_V8_3_138_DEV/public/psc-v3.js').exists()\nVAL=WORK/'validation'"
assert needle in src
src=src.replace(needle,insert,1)
# Frozen invariants for the new candidate.
assert "TARGET='9d946d3ddf8b98c2b3f80e1b5b849b12415381c2'" in src
assert "SEALED=REPO/'validation'/'v83218-v1-sealed'" in src
assert 'V8_3_218_BATCH_A_RESULT_V1.json' in src
assert 'QCSemanticCoreV97.analyze' in src
assert "auth['semantic_authority']=='QCEvidenceExtractorV5X -> QCSemanticCoreV97'" in src
assert "WORK/'PSC_V8_3_138_DEV/public/psc-v3.js'" in src
assert 'V8_3_217_BATCH_A_RESULT_V1.json' not in src
exec(compile(src,'v83218-batch-a-adapted.py','exec'))
