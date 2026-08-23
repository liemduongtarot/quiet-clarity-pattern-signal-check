from pathlib import Path
src=Path('validation/v83251-v122-regression-orchestrator.py').read_text()
old_chain="'qc-evidence-extractor-v5aw-v251-v250-b-residuals.js','psc-v83251-v250-v122-b-residuals.js']"
new_chain="'qc-evidence-extractor-v5aw-v251-v250-b-residuals.js','psc-v83251-v250-v122-b-residuals.js','qc-evidence-extractor-v5ax-v252-v251-residuals.js','psc-v83252-v251-v123-residuals.js']"
assert old_chain in src
src=src.replace(old_chain,new_chain,1)
src=src.replace('QCEvidenceExtractorV5AW','QCEvidenceExtractorV5AX')
src=src.replace('QCSemanticCoreV122','QCSemanticCoreV123')
src=src.replace('V8.3.251','V8.3.252')
src=src.replace('V8_3_251','V8_3_252')
src=src.replace('V8_3_252_V122_BASE_REGRESSION_RESULTS','V8_3_252_V123_BASE_REGRESSION_RESULTS')
src=src.replace('V8_3_252_V122_BASE_REGRESSION_RECEIPT','V8_3_252_V123_BASE_REGRESSION_RECEIPT')
src=src.replace('V8_3_252_V122_LEGACY_REGRESSION_RECEIPT','V8_3_252_V123_LEGACY_REGRESSION_RECEIPT')
src=src.replace("'phase':'v122-bounded-regression-legacy'","'phase':'v123-bounded-regression-legacy'",1)
exec(compile(src,'v83252-v123-legacy-adapted.py','exec'))
