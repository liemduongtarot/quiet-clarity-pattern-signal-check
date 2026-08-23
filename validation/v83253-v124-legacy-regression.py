from pathlib import Path
src=Path('validation/v83252-v123-legacy-regression.py').read_text()
old_chain="'qc-evidence-extractor-v5ax-v252-v251-residuals.js','psc-v83252-v251-v123-residuals.js']"
new_chain="'qc-evidence-extractor-v5ax-v252-v251-residuals.js','psc-v83252-v251-v123-residuals.js','qc-evidence-extractor-v5ay-v253-v252-residual.js','psc-v83253-v252-v124-residual.js']"
assert old_chain in src
src=src.replace(old_chain,new_chain,1)
src=src.replace('QCEvidenceExtractorV5AX','QCEvidenceExtractorV5AY')
src=src.replace('QCSemanticCoreV123','QCSemanticCoreV124')
src=src.replace('V8.3.252','V8.3.253')
src=src.replace('V8_3_252','V8_3_253')
src=src.replace('V8_3_253_V123_BASE_REGRESSION_RESULTS','V8_3_253_V124_BASE_REGRESSION_RESULTS')
src=src.replace('V8_3_253_V123_BASE_REGRESSION_RECEIPT','V8_3_253_V124_BASE_REGRESSION_RECEIPT')
src=src.replace('V8_3_253_V123_LEGACY_REGRESSION_RECEIPT','V8_3_253_V124_LEGACY_REGRESSION_RECEIPT')
src=src.replace("'phase':'v123-bounded-regression-legacy'","'phase':'v124-bounded-regression-legacy'",1)
exec(compile(src,'v83253-v124-legacy-adapted.py','exec'))
