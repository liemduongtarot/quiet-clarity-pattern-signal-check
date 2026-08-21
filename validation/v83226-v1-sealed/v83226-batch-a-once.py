import subprocess
# Mechanical adaptation of proven V8.3.225 one-shot runner; semantic chain append only.
subprocess.run(['git','fetch','--depth=1','origin','refs/heads/v83225-v1-sealed-validation:refs/remotes/origin/v83225-v1-sealed-validation'],check=True)
src=subprocess.check_output(['git','show','origin/v83225-v1-sealed-validation:validation/v83225-v1-sealed/v83225-batch-a-once.py'],text=True)
src=src.replace("TARGET='96955e1cf7538912104700e8dd6307ac4e67cb73'","TARGET='ca32baec5d57886c71b62ad21f938253572d1229'",1)
src=src.replace("SEM='QCEvidenceExtractorV5AC -> QCSemanticCoreV102'","SEM='QCEvidenceExtractorV5AD -> QCSemanticCoreV103'",1)
src=src.replace("SEALED=REPO/'validation/v83225-v1-sealed'","SEALED=REPO/'validation/v83226-v1-sealed'",1).replace("WORK=pathlib.Path('/tmp/v83225-batch-a-authority')","WORK=pathlib.Path('/tmp/v83226-batch-a-authority')",1)
src=src.replace("'V8_3_225_BATCH_A_ATTEMPT_MARKER.json'","'V8_3_226_BATCH_A_ATTEMPT_MARKER.json'").replace("'V8_3_225_SEALED_FIRST_RUN_MARKER.json'","'V8_3_226_SEALED_FIRST_RUN_MARKER.json'").replace("'V8_3_225_BATCH_A_RESULT_V1.json'","'V8_3_226_BATCH_A_RESULT_V1.json'").replace("'V8_3_225_BATCH_A_STATUS_V1.json'","'V8_3_226_BATCH_A_STATUS_V1.json'")
src=src.replace("'candidate':'V8.3.225'","'candidate':'V8.3.226'",1).replace("'v225_batch_a_rerun':False","'v225_sealed_rerun':False,'v226_batch_a_rerun':False",1)
src=src.replace("PSC_V8_3_225_V1_BATCH_A_CHECKPOINT","PSC_V8_3_226_V1_BATCH_A_CHECKPOINT")
src=src.replace("V8_3_225_","V8_3_226_").replace("V8.3.225 V1 SEALED BATCH A FIRST RUN","V8.3.226 V1 SEALED BATCH A FIRST RUN")
old="EXT += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js','qc-evidence-extractor-v5ac-v225-residual-composition.js','psc-v83225-v224-v102-residual-composition.js']"
new=old[:-1]+",'qc-evidence-extractor-v5ad-v226-full-input-witness.js','psc-v83226-v225-v103-full-input-witness.js']"
assert old in src;src=src.replace(old,new,1)
src=src.replace("runtime=VAL/'v83225-v1-sealed-runtime'","runtime=VAL/'v83226-v1-sealed-runtime'",1)
src=src.replace("runner=runtime/'run-v83225-batch-a.cjs'","runner=runtime/'run-v83226-batch-a.cjs'",1)
src=src.replace("if(!s.QCEvidenceExtractorV5AC)throw Error('V5AC missing');if(!s.QCSemanticCoreV102)throw Error('V102 missing');","if(!s.QCEvidenceExtractorV5AD)throw Error('V5AD missing');if(!s.QCSemanticCoreV103)throw Error('V103 missing');",1)
src=src.replace("const root='validation/v83225-v1-sealed-runtime'","const root='validation/v83226-v1-sealed-runtime'",1)
src=src.replace("s.QCSemanticCoreV102.analyze","s.QCSemanticCoreV103.analyze",1)
src=src.replace("validated_development_head_sha:'96955e1cf7538912104700e8dd6307ac4e67cb73'","validated_development_head_sha:'ca32baec5d57886c71b62ad21f938253572d1229'",1)
src=src.replace("semantic_authority:'QCEvidenceExtractorV5AC -> QCSemanticCoreV102'","semantic_authority:'QCEvidenceExtractorV5AD -> QCSemanticCoreV103'",1)
src=src.replace("console.log('V225 A'","console.log('V226 A'",1)
assert "QCSemanticCoreV103.analyze" in src and "qc-evidence-extractor-v5ad-v226-full-input-witness.js" in src and "V8_3_226_BATCH_A_RESULT_V1.json" in src
exec(compile(src,'v83226-batch-a-once-adapted.py','exec'))
