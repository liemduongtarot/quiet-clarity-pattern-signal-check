import subprocess
src=subprocess.check_output(['git','show','origin/v83227-v1-sealed-validation:validation/v83227-v1-sealed/v83227-transport-preflight.py'],text=True)
src=src.replace("O=R/'validation/v83227-v1-sealed'","O=R/'validation/v83228-v1-sealed'",1)
src=src.replace("DEV='a610a249639cb2a0e5fae5a8f69fed05cc3fe509'","DEV='2d5725e4b12f532ca9b710083e55e21efdb6c686'",1)
src=src.replace("SEM='QCEvidenceExtractorV5AE -> QCSemanticCoreV104'","SEM='QCEvidenceExtractorV5AF -> QCSemanticCoreV105'",1)
src=src.replace('V8_3_227_','V8_3_228_').replace('v83227-transport-','v83228-transport-').replace('v227_dev','v228_dev')
src=src.replace("'candidate':'V8.3.227'","'candidate':'V8.3.228'")
src=src.replace('V8_3_228_V104_REGRESSION_RECEIPT.json','V8_3_228_V105_REGRESSION_RECEIPT.json')
src=src.replace("'v226_frozen_a_passed'","'v226_frozen_a_passed','v227_frozen_a_passed'",1)
src=src.replace("reg['v226_previous_failures_repaired']==13 and reg['v226_previous_passes_preserved']==17 and reg['hypothetical_preserved']==3 and reg['prediction_preserved']==3 and reg['expected_gold_changed'] is False","reg['v227_previous_failures_repaired']==13 and reg['v227_previous_passes_preserved']==17 and reg['expected_gold_changed'] is False",1)
needle="'validation/qc-evidence-extractor-v5ae-v227-residual-witness.js','validation/psc-v83227-v226-v104-residual-witness.js']"
repl="'validation/qc-evidence-extractor-v5ae-v227-residual-witness.js','validation/psc-v83227-v226-v104-residual-witness.js','validation/qc-evidence-extractor-v5af-v228-witness-completion.js','validation/psc-v83228-v227-v105-witness-completion.js']"
assert needle in src;src=src.replace(needle,repl,1)
src=src.replace("'v226_sealed_rerun':False,'pass'","'v226_sealed_rerun':False,'v227_sealed_rerun':False,'pass'",1)
exec(compile(src,'v83228-transport-preflight-adapted.py','exec'))
