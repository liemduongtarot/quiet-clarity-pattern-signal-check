from pathlib import Path
src=Path('validation/v83223-v100-regression-orchestrator.py').read_text()
needle="src=src.replace('V8_3_222_V99_REGRESSION_RECEIPT','V8_3_223_V100_PARENT_REGRESSION_RECEIPT')\nexec(compile(src,'v83223-v100-parent-regression-adapted.py','exec'))"
insert="src=src.replace('V8_3_222_V99_REGRESSION_RECEIPT','V8_3_223_V100_PARENT_REGRESSION_RECEIPT')\nsrc=src.replace(\"ext=ext+['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js']\",\"ext=ext+['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js']\",1)\nexec(compile(src,'v83223-v100-parent-regression-adapted.py','exec'))"
assert needle in src
src=src.replace(needle,insert,1)
exec(compile(src,'v83223-v100-regression-orchestrator-r2.py','exec'))
