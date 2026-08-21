from pathlib import Path
src=Path('validation/v83215-v95-final-development-orchestrator.py').read_text()
# Extend exact validated V95 chain/build identity with bounded V96 repair.
tail="'qc-evidence-extractor-v5v-v215-compositional-recall.js','psc-v83215-v214-v95-compositional-recall.js']"
added="'qc-evidence-extractor-v5v-v215-compositional-recall.js','psc-v83215-v214-v95-compositional-recall.js','qc-evidence-extractor-v5w-v216-sealed-recall.js','psc-v83216-v215-v96-sealed-recall.js']"
assert src.count(tail)>=2
src=src.replace(tail,added)
src=src.replace('V8_3_215_V95_REGRESSION_EVIDENCE_RECEIPT','V8_3_216_V96_REGRESSION_V1_RECEIPT')
src=src.replace("reg['v214_frozen_a_regression_passed']==30","reg['v215_frozen_a_regression_passed']==30")
src=src.replace('QCSemanticCoreV95','QCSemanticCoreV96')
src=src.replace('QCEvidenceExtractorV5V','QCEvidenceExtractorV5W')
src=src.replace('run-v83215-generalization-800.cjs','run-v83216-generalization-800.cjs')
src=src.replace('V8_3_215_V95_FINAL_BROWSER_E2E_RESULTS','V8_3_216_V96_FINAL_BROWSER_E2E_RESULTS')
src=src.replace('run-v83215-v95-final-browser-e2e.cjs','run-v83216-v96-final-browser-e2e.cjs')
src=src.replace("if(pf.version!=='V8.3.215-V95-COMPOSITIONAL-RECALL')","if(pf.version!=='V8.3.216-V96-SEALED-RECALL')")
src=src.replace('built_v95_identity','built_v96_identity')
src=src.replace('V8_3_215_V95_FINAL_DEVELOPMENT_CHECKPOINT','V8_3_216_V96_FINAL_DEVELOPMENT_CHECKPOINT')
src=src.replace('V8_3_215_V214_A_REGRESSION_RESULTS','V8_3_216_V215_A_REGRESSION_RESULTS')
src=src.replace('V8_3_215_V95_REGRESSION_RESULTS','V8_3_216_V96_REGRESSION_RESULTS')
src=src.replace('V8_3_215_V214_V1_FAILURE_FORENSIC_IMMUTABLE','V8_3_216_V215_V1_FAILURE_FORENSIC_IMMUTABLE')
src=src.replace("VAL/'qc-evidence-extractor-v5v-v215-compositional-recall.js',VAL/'psc-v83215-v214-v95-compositional-recall.js'","VAL/'qc-evidence-extractor-v5v-v215-compositional-recall.js',VAL/'psc-v83215-v214-v95-compositional-recall.js',VAL/'qc-evidence-extractor-v5w-v216-sealed-recall.js',VAL/'psc-v83216-v215-v96-sealed-recall.js'")
src=src.replace("'candidate':'V8.3.215'","'candidate':'V8.3.216'")
src=src.replace("'phase':'v95-final-development'","'phase':'v96-final-development'")
src=src.replace("'semantic_authority':'QCSemanticCoreV96'","'semantic_authority':'QCSemanticCoreV96'")
src=src.replace("'v214_frozen_a_total':30,'v214_frozen_a_passed':30","'v215_frozen_a_total':30,'v215_frozen_a_passed':30")
src=src.replace("'v214_sealed_rerun':False","'v215_sealed_rerun':False")
src=src.replace('PSC_V8_3_215_V95_DEVELOPMENT_VALIDATION_CHECKPOINT','PSC_V8_3_216_V96_DEVELOPMENT_VALIDATION_CHECKPOINT')
src=src.replace('V8_3_215_V95_FINAL_DEVELOPMENT_RUN_RECEIPT','V8_3_216_V96_FINAL_DEVELOPMENT_RUN_RECEIPT')
exec(compile(src,'v83216-v96-final-development-orchestrator.py','exec'))
