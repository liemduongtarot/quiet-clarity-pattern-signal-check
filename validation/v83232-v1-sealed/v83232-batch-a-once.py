import subprocess
# Bounded mechanical adaptation of the proven V8.3.231 one-shot runner with explicit anti-inheritance assertions.
subprocess.run(['git','fetch','--depth=1','origin','refs/heads/v83231-v1-sealed-validation:refs/remotes/origin/v83231-v1-sealed-validation'],check=True)
src=subprocess.check_output(['git','show','origin/v83231-v1-sealed-validation:validation/v83231-v1-sealed/v83231-batch-a-once.py'],text=True)
repls=[
("TARGET='8be235fe1d00396dc43de3ac82990f4255bb73a7'","TARGET='7731574dd6db5d4c257dc088f5e791b1e980d5be'"),
("SEM='QCEvidenceExtractorV5AH -> QCSemanticCoreV107'","SEM='QCEvidenceExtractorV5AI -> QCSemanticCoreV108'"),
("SEALED=REPO/'validation/v83231-v1-sealed'","SEALED=REPO/'validation/v83232-v1-sealed'"),
("WORK=pathlib.Path('/tmp/v83231-batch-a-authority')","WORK=pathlib.Path('/tmp/v83232-batch-a-authority')"),
("ROOT='validation/v83231-v1-sealed-runtime'","ROOT='validation/v83232-v1-sealed-runtime'"),
("'candidate':'V8.3.231'","'candidate':'V8.3.232'"),
("'v231_batch_a_rerun':False","'v231_sealed_rerun':False,'v232_batch_a_rerun':False"),
("PSC_V8_3_231_V1_BATCH_A_CHECKPOINT","PSC_V8_3_232_V1_BATCH_A_CHECKPOINT"),
("V8_3_231_","V8_3_232_"),
("V8.3.231 V1 SEALED BATCH A FIRST RUN","V8.3.232 V1 SEALED BATCH A FIRST RUN"),
("runtime/'run-v83231-batch-a.cjs'","runtime/'run-v83232-batch-a.cjs'"),
("if(!s.QCEvidenceExtractorV5AH)throw Error('V5AH missing');if(!s.QCSemanticCoreV107)throw Error('V107 missing');","if(!s.QCEvidenceExtractorV5AI)throw Error('V5AI missing');if(!s.QCSemanticCoreV108)throw Error('V108 missing');"),
("s.QCSemanticCoreV107.analyze","s.QCSemanticCoreV108.analyze"),
("validated_development_head_sha:'8be235fe1d00396dc43de3ac82990f4255bb73a7'","validated_development_head_sha:'7731574dd6db5d4c257dc088f5e791b1e980d5be'"),
("semantic_authority:'QCEvidenceExtractorV5AH -> QCSemanticCoreV107'","semantic_authority:'QCEvidenceExtractorV5AI -> QCSemanticCoreV108'"),
("console.log('V231 A'","console.log('V232 A'")]
for old,new in repls:
 assert old in src,(old[:80])
 src=src.replace(old,new)
oldext="EXT += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js','qc-evidence-extractor-v5ac-v225-residual-composition.js','psc-v83225-v224-v102-residual-composition.js','qc-evidence-extractor-v5ad-v226-full-input-witness.js','psc-v83226-v225-v103-full-input-witness.js','qc-evidence-extractor-v5ae-v227-residual-witness.js','psc-v83227-v226-v104-residual-witness.js','qc-evidence-extractor-v5af-v228-witness-completion.js','psc-v83228-v227-v105-witness-completion.js','qc-evidence-extractor-v5ag-v230-concept-generalization.js','psc-v83230-v229-v106-concept-generalization.js','qc-evidence-extractor-v5ah-v231-isolated-concepts.js','psc-v83231-v230-v107-isolated-concepts.js']"
newext=oldext[:-1]+",'qc-evidence-extractor-v5ai-v232-residual-isolated-generalization.js','psc-v83232-v231-v108-residual-isolated-generalization.js']"
assert oldext in src;src=src.replace(oldext,newext,1)
# Fix the JS runtime-root literal after generic V8_3 file replacements.
src=src.replace("const root='validation/v83231-v1-sealed-runtime'","const root='validation/v83232-v1-sealed-runtime'")
# Anti-inheritance proof: the generated executable cannot reference the V231 sealed runtime/root or V107 analyze path.
for forbidden in ["validation/v83231-v1-sealed-runtime","QCSemanticCoreV107.analyze","V8_3_231_SEALED_FIXTURE_V1.json","V8_3_231_SEALED_SELECTION_V1.json","V8_3_231_INDEPENDENT_GOLD_V1.json"]:
 assert forbidden not in src,forbidden
for required in ["validation/v83232-v1-sealed-runtime","QCSemanticCoreV108.analyze","qc-evidence-extractor-v5ai-v232-residual-isolated-generalization.js","V8_3_232_BATCH_A_RESULT_V1.json"]:
 assert required in src,required
exec(compile(src,'v83232-batch-a-once-adapted.py','exec'))
