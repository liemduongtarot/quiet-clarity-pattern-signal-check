import subprocess
src=subprocess.check_output(['git','show','origin/v83227-v1-sealed-validation:validation/v83227-v1-sealed/v83227-batch-a-once.py'],text=True)
src=src.replace("TARGET='a610a249639cb2a0e5fae5a8f69fed05cc3fe509'","TARGET='2d5725e4b12f532ca9b710083e55e21efdb6c686'",1)
src=src.replace("SEM='QCEvidenceExtractorV5AE -> QCSemanticCoreV104'","SEM='QCEvidenceExtractorV5AF -> QCSemanticCoreV105'",1)
src=src.replace("SEALED=REPO/'validation/v83227-v1-sealed'","SEALED=REPO/'validation/v83228-v1-sealed'",1).replace("WORK=pathlib.Path('/tmp/v83227-batch-a-authority')","WORK=pathlib.Path('/tmp/v83228-batch-a-authority')",1)
src=src.replace('V8_3_227_','V8_3_228_').replace('PSC_V8_3_227_','PSC_V8_3_228_').replace("'candidate':'V8.3.227'","'candidate':'V8.3.228'").replace("'v227_batch_a_rerun':False","'v228_batch_a_rerun':False")
src=src.replace("'v226_sealed_rerun':False,'v228_batch_a_rerun'","'v226_sealed_rerun':False,'v227_sealed_rerun':False,'v228_batch_a_rerun'",1)
src=src.replace("VAL/'v83227-v1-sealed-runtime'","VAL/'v83228-v1-sealed-runtime'",1).replace("runtime/'run-v83227-batch-a.cjs'","runtime/'run-v83228-batch-a.cjs'",1)
needle="'qc-evidence-extractor-v5ae-v227-residual-witness.js','psc-v83227-v226-v104-residual-witness.js']"
repl="'qc-evidence-extractor-v5ae-v227-residual-witness.js','psc-v83227-v226-v104-residual-witness.js','qc-evidence-extractor-v5af-v228-witness-completion.js','psc-v83228-v227-v105-witness-completion.js']"
assert needle in src;src=src.replace(needle,repl,1)
src=src.replace('QCEvidenceExtractorV5AE','QCEvidenceExtractorV5AF').replace('QCSemanticCoreV104','QCSemanticCoreV105')
src=src.replace('V8.3.227 V1 SEALED BATCH A FIRST RUN','V8.3.228 V1 SEALED BATCH A FIRST RUN').replace("'a610a249639cb2a0e5fae5a8f69fed05cc3fe509'","'2d5725e4b12f532ca9b710083e55e21efdb6c686'").replace("'QCEvidenceExtractorV5AE -> QCSemanticCoreV104'","'QCEvidenceExtractorV5AF -> QCSemanticCoreV105'").replace("console.log('V227 A'","console.log('V228 A'")
exec(compile(src,'v83228-batch-a-once-adapted.py','exec'))
