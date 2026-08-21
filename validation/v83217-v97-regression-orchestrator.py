from pathlib import Path
src=Path('validation/v83216-v96-regression-orchestrator.py').read_text()
# Promote frozen source to exact V8.3.216 sealed first-run evidence commit.
src=src.replace("V213_SEALED='146afea9914ef23a28943178f6ab8f7b6c319057'","V213_SEALED='bec1b3a2f752a71a7628d50cd2d92aaaa7967fcd'")
# Extend validated semantic chain through V96 with bounded V97 repair.
old="'qc-evidence-extractor-v5w-v216-sealed-recall.js','psc-v83216-v215-v96-sealed-recall.js']"
new="'qc-evidence-extractor-v5w-v216-sealed-recall.js','psc-v83216-v215-v96-sealed-recall.js','qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js']"
assert old in src
src=src.replace(old,new,1)
src=src.replace('V8_3_216_V215_V1_BATCH_A_REGRESSION','V8_3_217_V216_V1_BATCH_A_REGRESSION')
src=src.replace('V8_3_216_V215_A_REGRESSION_RESULTS','V8_3_217_V216_A_REGRESSION_RESULTS')
src=src.replace('validation/v83215-v1-sealed/V8_3_215_V1_BATCH_A_FIRST_RUN_RESULTS.json','validation/v83216-v1-sealed/V8_3_216_V1_BATCH_A_FIRST_RUN_RESULTS.json')
src=src.replace("c['passed']==23 and c['failed']==7","c['passed']==17 and c['failed']==13")
src=src.replace('V8.3.216 DEVELOPMENT regression of frozen V8.3.215 sealed-A first run','V8.3.217 DEVELOPMENT regression of frozen V8.3.216 sealed-A first run')
src=src.replace('QCSemanticCoreV96','QCSemanticCoreV97')
src=src.replace('V8.3.216 V96 immutable regression','V8.3.217 V97 immutable regression')
src=src.replace('V8_3_216_V96_REGRESSION_RESULTS','V8_3_217_V97_REGRESSION_RESULTS')
src=src.replace("'candidate':'V8.3.216'","'candidate':'V8.3.217'")
src=src.replace("'phase':'v96-regression-v1'","'phase':'v97-regression-v1'")
src=src.replace("'semantic_authority':'QCSemanticCoreV97'","'semantic_authority':'QCSemanticCoreV97'")
src=src.replace("'v215_frozen_a_regression_total'","'v216_frozen_a_regression_total'")
src=src.replace("'v215_frozen_a_regression_passed'","'v216_frozen_a_regression_passed'")
src=src.replace("'v215_sealed_rerun':False","'v216_sealed_rerun':False")
src=src.replace('V8_3_216_V96_REGRESSION_V1_RECEIPT','V8_3_217_V97_REGRESSION_V1_RECEIPT')
exec(compile(src,'v83217-v97-regression-orchestrator.py','exec'))
