import subprocess
# Mechanical adaptation of the proven V8.3.219 one-shot runner architecture.
subprocess.run(['git','fetch','--depth=1','origin','refs/heads/v83219-v1-sealed-validation:refs/remotes/origin/v83219-v1-sealed-validation'],check=True)
src=subprocess.check_output(['git','show','origin/v83219-v1-sealed-validation:validation/v83219-v1-sealed/v83219-batch-a-once.py'],text=True)
src=src.replace("TARGET='27a338cb88b054a05f61daa6c902ed8537574eba'","TARGET='06ac0e51c958f5c64dcb97f91d66b122d3048bf8'")
src=src.replace('v83219','v83220').replace('V8_3_219','V8_3_220').replace('V8.3.219','V8.3.220')
src=src.replace('QCEvidenceExtractorV5X -> QCSemanticCoreV97','QCEvidenceExtractorV5Y -> QCSemanticCoreV98')
src=src.replace('QCSemanticCoreV97','QCSemanticCoreV98').replace('QCEvidenceExtractorV5X','QCEvidenceExtractorV5Y')
old="'qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js']"
new="'qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js','qc-evidence-extractor-v5y-v220-bounded-recall.js','psc-v83220-v219-v98-bounded-recall.js']"
assert old in src
src=src.replace(old,new,1)
src=src.replace("'v217_sealed_rerun':False,'v218_sealed_rerun':False","'v217_sealed_rerun':False,'v218_sealed_rerun':False,'v219_sealed_rerun':False")
assert "TARGET='06ac0e51c958f5c64dcb97f91d66b122d3048bf8'" in src
assert 'QCSemanticCoreV98.analyze' in src
assert "'qc-evidence-extractor-v5y-v220-bounded-recall.js','psc-v83220-v219-v98-bounded-recall.js']" in src
assert 'V8_3_220_BATCH_A_RESULT_V1.json' in src
assert 'v219_sealed_rerun' in src
exec(compile(src,'v83220-batch-a-once-adapted.py','exec'))
