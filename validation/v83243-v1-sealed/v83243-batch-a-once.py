from pathlib import Path
src=Path('validation/v83242-v1-sealed/v83242-batch-a-once.py').read_text()
src=src.replace("TARGET='79645f8973c9e8288119f79318b39646e2feb00f'","TARGET='885608fce9e70a8818d1ebda23c786a81005a2fe'",1)
src=src.replace("SEM='QCEvidenceExtractorV5AQ -> QCSemanticCoreV116'","SEM='QCEvidenceExtractorV5AR -> QCSemanticCoreV117'",1)
src=src.replace("SEALED=REPO/'validation/v83242-v1-sealed';WORK=pathlib.Path('/tmp/v83242-batch-a-authority');ROOT='validation/v83242-v1-sealed-runtime'","SEALED=REPO/'validation/v83243-v1-sealed';WORK=pathlib.Path('/tmp/v83243-batch-a-authority');ROOT='validation/v83243-v1-sealed-runtime'",1)
src=src.replace('V8_3_242','V8_3_243')
src=src.replace('V8.3.242','V8.3.243')
src=src.replace("v241_sealed_rerun","v242_sealed_rerun")
src=src.replace("v242_batch_a_rerun","v243_batch_a_rerun")
src=src.replace("pf['exact_v5aq_path']=='validation/qc-evidence-extractor-v5aq-v242-v241-residuals.js' and pf['exact_v116_path']=='validation/psc-v83242-v241-v116-residuals.js'","pf['exact_v5ar_path']=='validation/qc-evidence-extractor-v5ar-v243-v242-residuals.js' and pf['exact_v117_path']=='validation/psc-v83243-v242-v117-residuals.js'",1)
old="'qc-evidence-extractor-v5aq-v242-v241-residuals.js','psc-v83242-v241-v116-residuals.js']"
new="'qc-evidence-extractor-v5aq-v242-v241-residuals.js','psc-v83242-v241-v116-residuals.js','qc-evidence-extractor-v5ar-v243-v242-residuals.js','psc-v83243-v242-v117-residuals.js']"
if old not in src: raise SystemExit('semantic-chain anchor missing')
src=src.replace(old,new,1)
src=src.replace('QCEvidenceExtractorV5AQ','QCEvidenceExtractorV5AR')
src=src.replace('QCSemanticCoreV116','QCSemanticCoreV117')
src=src.replace("console.log('V242 A'","console.log('V243 A'")
exec(compile(src,'v83243-batch-a-once-adapted.py','exec'))
