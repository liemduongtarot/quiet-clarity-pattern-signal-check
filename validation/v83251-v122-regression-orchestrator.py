from pathlib import Path
src=Path('validation/v83250-v121-regression-orchestrator.py').read_text()
old_chain="'qc-evidence-extractor-v5av-v250-v249-residuals.js','psc-v83250-v249-v121-residuals.js']"
new_chain="'qc-evidence-extractor-v5av-v250-v249-residuals.js','psc-v83250-v249-v121-residuals.js','qc-evidence-extractor-v5aw-v251-v250-b-residuals.js','psc-v83251-v250-v122-b-residuals.js']"
assert old_chain in src
src=src.replace(old_chain,new_chain,1)
old_expected="241:(17,13),242:(16,14),244:(16,14),245:(27,3),248:(22,8),249:(23,7)}"
new_expected="241:(17,13),242:(16,14),244:(16,14),245:(27,3),248:(22,8),249:(23,7),250:(30,0)}"
assert old_expected in src
src=src.replace(old_expected,new_expected,1)
old_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238,240,241,242,244,245,248,249])run(v);"
new_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238,240,241,242,244,245,248,249,250])run(v);"
assert old_loop in src
src=src.replace(old_loop,new_loop,1)
src=src.replace('QCEvidenceExtractorV5AV','QCEvidenceExtractorV5AW')
src=src.replace('QCSemanticCoreV121','QCSemanticCoreV122')
src=src.replace('V8.3.250','V8.3.251')
src=src.replace('V8_3_250','V8_3_251')
src=src.replace('V8_3_251_V121_BASE_REGRESSION_RESULTS','V8_3_251_V122_BASE_REGRESSION_RESULTS')
src=src.replace('V8_3_251_V121_BASE_REGRESSION_RECEIPT','V8_3_251_V122_BASE_REGRESSION_RECEIPT')
src=src.replace('V8_3_251_V121_REGRESSION_RECEIPT','V8_3_251_V122_LEGACY_REGRESSION_RECEIPT')
src=src.replace("'phase':'v121-bounded-regression'","'phase':'v122-bounded-regression-legacy'",1)
exec(compile(src,'v83251-v122-full-regression-adapted.py','exec'))
