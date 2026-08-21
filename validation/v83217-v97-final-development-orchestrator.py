from pathlib import Path
src=Path('validation/v83216-v96-final-development-orchestrator.py').read_text()
# Extend exact validated V96 chain/build identity with bounded V97 repair.
tail="'qc-evidence-extractor-v5w-v216-sealed-recall.js','psc-v83216-v215-v96-sealed-recall.js']"
added="'qc-evidence-extractor-v5w-v216-sealed-recall.js','psc-v83216-v215-v96-sealed-recall.js','qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js']"
assert src.count(tail)>=1
src=src.replace(tail,added)
src=src.replace('V8_3_216_V96_REGRESSION_V1_RECEIPT','V8_3_217_V97_REGRESSION_V1_RECEIPT')
src=src.replace("reg['v215_frozen_a_regression_passed']==30","reg['v216_frozen_a_regression_passed']==30")
src=src.replace('QCSemanticCoreV96','QCSemanticCoreV97')
src=src.replace('QCEvidenceExtractorV5W','QCEvidenceExtractorV5X')
src=src.replace('run-v83216-generalization-800.cjs','run-v83217-generalization-800.cjs')
src=src.replace('V8_3_216_V96_FINAL_BROWSER_E2E_RESULTS','V8_3_217_V97_FINAL_BROWSER_E2E_RESULTS')
src=src.replace('run-v83216-v96-final-browser-e2e.cjs','run-v83217-v97-final-browser-e2e.cjs')
src=src.replace("if(pf.version!=='V8.3.216-V96-SEALED-RECALL')","if(pf.version!=='V8.3.217-V97-RELATIONAL-RECALL')")
src=src.replace('built_v96_identity','built_v97_identity')
src=src.replace('V8_3_216_V96_FINAL_DEVELOPMENT_CHECKPOINT','V8_3_217_V97_FINAL_DEVELOPMENT_CHECKPOINT')
src=src.replace('V8_3_216_V215_A_REGRESSION_RESULTS','V8_3_217_V216_A_REGRESSION_RESULTS')
src=src.replace('V8_3_216_V96_REGRESSION_RESULTS','V8_3_217_V97_REGRESSION_RESULTS')
src=src.replace('V8_3_216_V215_V1_FAILURE_FORENSIC_IMMUTABLE','V8_3_217_V216_V1_FAILURE_FORENSIC_IMMUTABLE')
src=src.replace("VAL/'qc-evidence-extractor-v5w-v216-sealed-recall.js',VAL/'psc-v83216-v215-v96-sealed-recall.js'","VAL/'qc-evidence-extractor-v5w-v216-sealed-recall.js',VAL/'psc-v83216-v215-v96-sealed-recall.js',VAL/'qc-evidence-extractor-v5x-v217-relational-recall.js',VAL/'psc-v83217-v216-v97-relational-recall.js'")
src=src.replace("'candidate':'V8.3.216'","'candidate':'V8.3.217'")
src=src.replace("'phase':'v96-final-development'","'phase':'v97-final-development'")
src=src.replace("'semantic_authority':'QCSemanticCoreV97'","'semantic_authority':'QCSemanticCoreV97'")
src=src.replace("'v215_frozen_a_total':30,'v215_frozen_a_passed':30","'v216_frozen_a_total':30,'v216_frozen_a_passed':30")
src=src.replace("'v215_sealed_rerun':False","'v216_sealed_rerun':False")
src=src.replace('PSC_V8_3_216_V96_DEVELOPMENT_VALIDATION_CHECKPOINT','PSC_V8_3_217_V97_DEVELOPMENT_VALIDATION_CHECKPOINT')
src=src.replace('V8_3_216_V96_FINAL_DEVELOPMENT_RUN_RECEIPT','V8_3_217_V97_FINAL_DEVELOPMENT_RUN_RECEIPT')
exec(compile(src,'v83217-v97-final-development-orchestrator.py','exec'))
