from pathlib import Path
src=Path('validation/v83215-v95-regression-orchestrator.py').read_text()
# Promote frozen source from V8.3.214 sealed to exact frozen V8.3.215 sealed first-run evidence.
src=src.replace("V213_SEALED='4b8d903aff5597864f75f08e646a74ca0c7085b8'","V213_SEALED='146afea9914ef23a28943178f6ab8f7b6c319057'")
# Extend validated semantic chain through V95 with bounded V96 repair.
old="'qc-evidence-extractor-v5v-v215-compositional-recall.js','psc-v83215-v214-v95-compositional-recall.js']"
new="'qc-evidence-extractor-v5v-v215-compositional-recall.js','psc-v83215-v214-v95-compositional-recall.js','qc-evidence-extractor-v5w-v216-sealed-recall.js','psc-v83216-v215-v96-sealed-recall.js']"
assert old in src
src=src.replace(old,new,1)
src=src.replace('V8_3_215_V214_V1_BATCH_A_REGRESSION','V8_3_216_V215_V1_BATCH_A_REGRESSION')
src=src.replace('V8_3_215_V214_A_REGRESSION_RESULTS','V8_3_216_V215_A_REGRESSION_RESULTS')
src=src.replace('validation/v83214-v1-sealed/V8_3_214_V1_BATCH_A_FIRST_RUN_RESULTS.json','validation/v83215-v1-sealed/V8_3_215_V1_BATCH_A_FIRST_RUN_RESULTS.json')
src=src.replace("c['passed']==12 and c['failed']==18","c['passed']==23 and c['failed']==7")
src=src.replace('V8.3.215 DEVELOPMENT regression of frozen V8.3.214 sealed-A first run','V8.3.216 DEVELOPMENT regression of frozen V8.3.215 sealed-A first run')
src=src.replace('QCSemanticCoreV95','QCSemanticCoreV96')
src=src.replace('V8.3.215 V95 immutable regression','V8.3.216 V96 immutable regression')
src=src.replace('V8_3_215_V95_REGRESSION_RESULTS','V8_3_216_V96_REGRESSION_RESULTS')
src=src.replace("'candidate':'V8.3.215'","'candidate':'V8.3.216'")
src=src.replace("'phase':'v95-regression-v1'","'phase':'v96-regression-v1'")
src=src.replace("'semantic_authority':'QCSemanticCoreV96'","'semantic_authority':'QCSemanticCoreV96'")
src=src.replace("'v214_frozen_a_regression_total'","'v215_frozen_a_regression_total'")
src=src.replace("'v214_frozen_a_regression_passed'","'v215_frozen_a_regression_passed'")
src=src.replace("'v214_sealed_rerun':False","'v215_sealed_rerun':False")
src=src.replace('V8_3_215_V95_REGRESSION_V1_RECEIPT','V8_3_216_V96_REGRESSION_V1_RECEIPT')
exec(compile(src,'v83216-v96-regression-orchestrator.py','exec'))
