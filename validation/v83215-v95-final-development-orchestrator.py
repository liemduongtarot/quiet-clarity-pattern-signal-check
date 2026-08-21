from pathlib import Path
src=Path('validation/v83214-v94r-final-development-orchestrator.py').read_text()
# Extend exact V94R chain/build identity with V95 repair.
tail="'qc-evidence-extractor-v5u2-v214-clarification-containment.js','psc-v83214-v213-v94r-clarification-containment.js']"
added="'qc-evidence-extractor-v5u2-v214-clarification-containment.js','psc-v83214-v213-v94r-clarification-containment.js','qc-evidence-extractor-v5v-v215-compositional-recall.js','psc-v83215-v214-v95-compositional-recall.js']"
assert src.count(tail)>=2
src=src.replace(tail,added)
src=src.replace('V8_3_214_V94R_REGRESSION_EVIDENCE_RECEIPT','V8_3_215_V95_REGRESSION_EVIDENCE_RECEIPT')
src=src.replace("reg['v213_frozen_a_regression_passed']==30","reg['v214_frozen_a_regression_passed']==30")
src=src.replace('QCSemanticCoreV94R','QCSemanticCoreV95')
src=src.replace('QCEvidenceExtractorV5U2','QCEvidenceExtractorV5V')
src=src.replace('run-v83214-generalization-800.cjs','run-v83215-generalization-800.cjs')
src=src.replace('V8_3_214_V94R_FINAL_BROWSER_E2E_RESULTS','V8_3_215_V95_FINAL_BROWSER_E2E_RESULTS')
src=src.replace('run-v83214-v94r-final-browser-e2e.cjs','run-v83215-v95-final-browser-e2e.cjs')
src=src.replace("if(pf.version!=='V8.3.214-V94R-CLARIFICATION-CONTAINMENT')","if(pf.version!=='V8.3.215-V95-COMPOSITIONAL-RECALL')")
src=src.replace('built_v94r_identity','built_v95_identity')
src=src.replace('V8_3_214_V94R_FINAL_DEVELOPMENT_CHECKPOINT','V8_3_215_V95_FINAL_DEVELOPMENT_CHECKPOINT')
src=src.replace('V8_3_214_V213_A_REGRESSION_RESULTS','V8_3_215_V214_A_REGRESSION_RESULTS')
src=src.replace('V8_3_214_V94R_REGRESSION_RESULTS','V8_3_215_V95_REGRESSION_RESULTS')
src=src.replace('V8_3_214_V213_V1_FAILURE_FORENSIC_IMMUTABLE','V8_3_215_V214_V1_FAILURE_FORENSIC_IMMUTABLE')
src=src.replace("VAL/'qc-evidence-extractor-v5u-v214-sealed-recall.js',VAL/'psc-v83214-v213-v94-sealed-recall.js',VAL/'qc-evidence-extractor-v5u2-v214-clarification-containment.js',VAL/'psc-v83214-v213-v94r-clarification-containment.js'","VAL/'qc-evidence-extractor-v5u-v214-sealed-recall.js',VAL/'psc-v83214-v213-v94-sealed-recall.js',VAL/'qc-evidence-extractor-v5u2-v214-clarification-containment.js',VAL/'psc-v83214-v213-v94r-clarification-containment.js',VAL/'qc-evidence-extractor-v5v-v215-compositional-recall.js',VAL/'psc-v83215-v214-v95-compositional-recall.js'")
src=src.replace("'candidate':'V8.3.214'","'candidate':'V8.3.215'")
src=src.replace("'phase':'v94r-final-development'","'phase':'v95-final-development'")
src=src.replace("'semantic_authority':'QCSemanticCoreV95'","'semantic_authority':'QCSemanticCoreV95'")
src=src.replace("'v213_frozen_a_total':30,'v213_frozen_a_passed':30","'v214_frozen_a_total':30,'v214_frozen_a_passed':30")
src=src.replace("'v213_sealed_rerun':False","'v214_sealed_rerun':False")
src=src.replace('PSC_V8_3_214_V94R_DEVELOPMENT_VALIDATION_CHECKPOINT','PSC_V8_3_215_V95_DEVELOPMENT_VALIDATION_CHECKPOINT')
src=src.replace('V8_3_214_V94R_FINAL_DEVELOPMENT_RUN_RECEIPT','V8_3_215_V95_FINAL_DEVELOPMENT_RUN_RECEIPT')
exec(compile(src,'v83215-v95-final-development-orchestrator.py','exec'))
