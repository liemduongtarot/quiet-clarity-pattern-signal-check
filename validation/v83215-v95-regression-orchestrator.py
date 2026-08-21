from pathlib import Path
src=Path('validation/v83214-v94-regression-orchestrator.py').read_text()
# Exact frozen V8.3.214 sealed-A evidence becomes DEVELOPMENT carrier only.
src=src.replace("V213_SEALED='3d38673a8d074f72af9b05b7ad2733c182d47505'","V213_SEALED='4b8d903aff5597864f75f08e646a74ca0c7085b8'")
# Extend the validated chain through V94R, then the bounded V95 repair.
old="'qc-evidence-extractor-v5u-v214-sealed-recall.js','psc-v83214-v213-v94-sealed-recall.js']"
new="'qc-evidence-extractor-v5u-v214-sealed-recall.js','psc-v83214-v213-v94-sealed-recall.js','qc-evidence-extractor-v5u2-v214-clarification-containment.js','psc-v83214-v213-v94r-clarification-containment.js','qc-evidence-extractor-v5v-v215-compositional-recall.js','psc-v83215-v214-v95-compositional-recall.js']"
assert old in src
src=src.replace(old,new,1)
src=src.replace('V8_3_214_V213_V1_BATCH_A_REGRESSION','V8_3_215_V214_V1_BATCH_A_REGRESSION')
src=src.replace('V8_3_214_V213_A_REGRESSION_RESULTS','V8_3_215_V214_A_REGRESSION_RESULTS')
src=src.replace("validation/v83213-v1-sealed/V8_3_213_V1_BATCH_A_FIRST_RUN_RESULTS.json","validation/v83214-v1-sealed/V8_3_214_V1_BATCH_A_FIRST_RUN_RESULTS.json")
src=src.replace("c['passed']==16 and c['failed']==14","c['passed']==12 and c['failed']==18")
src=src.replace('V8.3.214 DEVELOPMENT regression of frozen V8.3.213 sealed-A first run','V8.3.215 DEVELOPMENT regression of frozen V8.3.214 sealed-A first run')
src=src.replace('QCSemanticCoreV94','QCSemanticCoreV95')
src=src.replace('V8.3.214 V94 immutable regression','V8.3.215 V95 immutable regression')
src=src.replace('V8_3_214_V94_REGRESSION_RESULTS','V8_3_215_V95_REGRESSION_RESULTS')
src=src.replace("'candidate':'V8.3.214'","'candidate':'V8.3.215'")
src=src.replace("'phase':'v94-regression-v1'","'phase':'v95-regression-v1'")
src=src.replace("'semantic_authority':'QCSemanticCoreV95'","'semantic_authority':'QCSemanticCoreV95'")
src=src.replace("'v213_frozen_a_regression_total'","'v214_frozen_a_regression_total'")
src=src.replace("'v213_frozen_a_regression_passed'","'v214_frozen_a_regression_passed'")
src=src.replace("'v213_sealed_rerun':False","'v214_sealed_rerun':False")
src=src.replace('V8_3_214_V94_REGRESSION_V1_RECEIPT','V8_3_215_V95_REGRESSION_V1_RECEIPT')
exec(compile(src,'v83215-v95-regression-orchestrator.py','exec'))
