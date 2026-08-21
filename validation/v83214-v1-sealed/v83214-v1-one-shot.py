import pathlib,subprocess

# Adapt the already-proven V8.3.213 sealed one-shot architecture mechanically.
# This wrapper only rewrites version/source identities and appends the validated V8.3.214 V94R chain.
REPO=pathlib.Path.cwd()
V213_FROZEN='3d38673a8d074f72af9b05b7ad2733c182d47505'
BASE=pathlib.Path('/tmp/v83213-v1-one-shot.py')
subprocess.run(['git','fetch','--depth=1','origin',V213_FROZEN],check=True)
src=subprocess.check_output(['git','show',f'{V213_FROZEN}:validation/v83213-v1-sealed/v83213-v1-one-shot.py'],text=True)

# Identity/base substitutions.
src=src.replace("TARGET='70808836f6cfb09a5428685e0bfdc336afe4181f'","TARGET='4725f8a613048e755fef6c10398d83305abd136f'")
src=src.replace('v213-v1-authority','v214-v1-authority')
src=src.replace('v83213-v1-sealed','v83214-v1-sealed')
src=src.replace('V8_3_213','V8_3_214')
src=src.replace('V8.3.213','V8.3.214')
src=src.replace('QCSemanticCoreV93','QCSemanticCoreV94R')
src=src.replace("'semantic_authority':'QCSemanticCoreV94R'","'semantic_authority':'QCSemanticCoreV94R'")
src=src.replace("auth['semantic_authority']=='QCSemanticCoreV94R'","auth['semantic_authority']=='QCSemanticCoreV94R'")
src=src.replace("'v212_sealed_rerun':False","'v213_sealed_rerun':False")

# Append exact validated V8.3.214 semantic chain after V93.
old="'qc-evidence-extractor-v5t-v213-relational-paraphrase-recall.js','psc-v83213-v212-v93-relational-paraphrase-recall.js']"
new="'qc-evidence-extractor-v5t-v213-relational-paraphrase-recall.js','psc-v83213-v212-v93-relational-paraphrase-recall.js','qc-evidence-extractor-v5u-v214-sealed-recall.js','psc-v83214-v213-v94-sealed-recall.js','qc-evidence-extractor-v5u2-v214-clarification-containment.js','psc-v83214-v213-v94r-clarification-containment.js']"
assert old in src, 'V93 chain tail not found in proven V213 runner'
src=src.replace(old,new,1)

# Assert protected invariants before executing the adapted source.
assert "TARGET='4725f8a613048e755fef6c10398d83305abd136f'" in src
assert "QCSemanticCoreV94R.analyze" in src
assert "auth['semantic_authority']=='QCSemanticCoreV94R'" in src
assert "if rca==0 and a and a.get('failed')==0 and a.get('passed')==30" in src
assert "success=bool(a and a.get('failed')==0 and a.get('passed')==30 and b and b.get('failed')==0 and b.get('passed')==30)" in src
assert "V8_3_214_V1_SEMANTIC_FIRST_RUN_EXECUTED.json" in src
assert "v213_sealed_rerun" in src
assert "v212_sealed_rerun" not in src

exec(compile(src,'v83214-v1-one-shot-adapted.py','exec'))
