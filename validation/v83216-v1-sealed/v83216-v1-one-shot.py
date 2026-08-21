import pathlib,subprocess
# Mechanical adaptation of frozen V8.3.215 one-shot; executes only when CI calls it.
V215_FROZEN='146afea9914ef23a28943178f6ab8f7b6c319057'
subprocess.run(['git','fetch','--depth=1','origin',V215_FROZEN],check=True)
src=subprocess.check_output(['git','show',f'{V215_FROZEN}:validation/v83215-v1-sealed/v83215-v1-one-shot.py'],text=True)
src=src.replace("TARGET='e0ee7b03ad0dcdc616b242f6df810f4211e08baa'","TARGET='8f69213bda48583d94f5c9128ecb5cd6f6832d63'")
src=src.replace('v215-v1-authority','v216-v1-authority').replace('v83215-v1-sealed','v83216-v1-sealed').replace('V8_3_215','V8_3_216').replace('V8.3.215','V8.3.216').replace('QCSemanticCoreV95','QCSemanticCoreV96').replace("'v214_sealed_rerun':False","'v215_sealed_rerun':False")
# Keep inherited nested wrapper audits aligned to promoted previous-sealed field.
src=src.replace('assert "v214_sealed_rerun" in src','assert "v215_sealed_rerun" in src')
src=src.replace("assert 'v214_sealed_rerun' in src","assert 'v215_sealed_rerun' in src")
old="'qc-evidence-extractor-v5v-v215-compositional-recall.js','psc-v83215-v214-v95-compositional-recall.js']"
new="'qc-evidence-extractor-v5v-v215-compositional-recall.js','psc-v83215-v214-v95-compositional-recall.js','qc-evidence-extractor-v5w-v216-sealed-recall.js','psc-v83216-v215-v96-sealed-recall.js']"
assert old in src
src=src.replace(old,new,1)
assert "TARGET='8f69213bda48583d94f5c9128ecb5cd6f6832d63'" in src
assert 'QCSemanticCoreV96.analyze' in src
assert "auth['semantic_authority']=='QCSemanticCoreV96'" in src
assert "if rca==0 and a and a.get('failed')==0 and a.get('passed')==30" in src
assert "success=bool(a and a.get('failed')==0 and a.get('passed')==30 and b and b.get('failed')==0 and b.get('passed')==30)" in src
assert 'V8_3_216_V1_SEMANTIC_FIRST_RUN_EXECUTED.json' in src
assert 'v215_sealed_rerun' in src
exec(compile(src,'v83216-v1-one-shot-adapted.py','exec'))
