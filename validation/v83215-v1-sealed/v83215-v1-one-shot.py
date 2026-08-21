import pathlib,subprocess
# Mechanical adaptation of frozen V8.3.214 one-shot; this file does not execute unless CI calls it.
V214_FROZEN='4b8d903aff5597864f75f08e646a74ca0c7085b8'
subprocess.run(['git','fetch','--depth=1','origin',V214_FROZEN],check=True)
src=subprocess.check_output(['git','show',f'{V214_FROZEN}:validation/v83214-v1-sealed/v83214-v1-one-shot.py'],text=True)
src=src.replace("TARGET='4725f8a613048e755fef6c10398d83305abd136f'","TARGET='e0ee7b03ad0dcdc616b242f6df810f4211e08baa'")
src=src.replace('v214-v1-authority','v215-v1-authority').replace('v83214-v1-sealed','v83215-v1-sealed').replace('V8_3_214','V8_3_215').replace('V8.3.214','V8.3.215').replace('QCSemanticCoreV94R','QCSemanticCoreV95').replace("'v213_sealed_rerun':False","'v214_sealed_rerun':False")
old="'qc-evidence-extractor-v5u2-v214-clarification-containment.js','psc-v83214-v213-v94r-clarification-containment.js']"
new="'qc-evidence-extractor-v5u2-v214-clarification-containment.js','psc-v83214-v213-v94r-clarification-containment.js','qc-evidence-extractor-v5v-v215-compositional-recall.js','psc-v83215-v214-v95-compositional-recall.js']"
assert old in src;src=src.replace(old,new,1)
assert "TARGET='e0ee7b03ad0dcdc616b242f6df810f4211e08baa'" in src
assert 'QCSemanticCoreV95.analyze' in src
assert "auth['semantic_authority']=='QCSemanticCoreV95'" in src
assert "if rca==0 and a and a.get('failed')==0 and a.get('passed')==30" in src
assert "success=bool(a and a.get('failed')==0 and a.get('passed')==30 and b and b.get('failed')==0 and b.get('passed')==30)" in src
assert 'V8_3_215_V1_SEMANTIC_FIRST_RUN_EXECUTED.json' in src
# Only the current-candidate guard is required here. Historical source text may legitimately retain v213 audit literals.
assert 'v214_sealed_rerun' in src
exec(compile(src,'v83215-v1-one-shot-adapted.py','exec'))
