from pathlib import Path
src=Path('validation/v83214-v94-regression-orchestrator.py').read_text()
old="'psc-v83214-v213-v94-sealed-recall.js']"
new="'psc-v83214-v213-v94-sealed-recall.js','qc-evidence-extractor-v5u2-v214-clarification-containment.js','psc-v83214-v213-v94r-clarification-containment.js']"
if old not in src: raise SystemExit('V94 chain tail marker missing')
src=src.replace(old,new,1)
src=src.replace('QCSemanticCoreV94','QCSemanticCoreV94R')
src=src.replace('V8.3.214 V94 immutable regression','V8.3.214 V94R immutable regression')
src=src.replace('V8_3_214_V94_REGRESSION_RESULTS.json','V8_3_214_V94R_REGRESSION_RESULTS.json')
src=src.replace("'semantic_authority':'QCSemanticCoreV94R'","'semantic_authority':'QCSemanticCoreV94R'")
src=src.replace("'phase':'v94-regression-v1'","'phase':'v94r-regression-v2'")
src=src.replace("V8_3_214_V94_REGRESSION_V1_RECEIPT.json","V8_3_214_V94R_REGRESSION_V2_RECEIPT.json")
exec(compile(src,'v83214-v94r-regression-orchestrator.py','exec'))
