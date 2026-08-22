from pathlib import Path
src=Path('validation/v83239-v114-regression-orchestrator.py').read_text()
old_chain="'qc-evidence-extractor-v5ao-v239-v238-residuals.js','psc-v83239-v238-v114-v238-residuals.js']"
new_chain="'qc-evidence-extractor-v5ao-v239-v238-residuals.js','psc-v83239-v238-v114-v238-residuals.js','qc-evidence-extractor-v5ap-v241-v240-residuals.js','psc-v83241-v240-v115-residuals.js']"
assert old_chain in src
src=src.replace(old_chain,new_chain)
old_expected="238:(18,12)}"
new_expected="238:(18,12),240:(20,10)}"
assert old_expected in src
src=src.replace(old_expected,new_expected,1)
old_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238])run(v);"
new_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238,240])run(v);"
assert old_loop in src
src=src.replace(old_loop,new_loop,1)
src=src.replace('QCEvidenceExtractorV5AO','QCEvidenceExtractorV5AP')
src=src.replace('QCSemanticCoreV114','QCSemanticCoreV115')
src=src.replace('V8.3.239','V8.3.241')
src=src.replace('V8_3_239','V8_3_241')
src=src.replace('V8_3_241_V114_BASE_REGRESSION_RESULTS','V8_3_241_V115_BASE_REGRESSION_RESULTS')
src=src.replace('V8_3_241_V114_BASE_REGRESSION_RECEIPT','V8_3_241_V115_BASE_REGRESSION_RECEIPT')
src=src.replace('V8_3_241_V114_REGRESSION_RECEIPT','V8_3_241_V115_REGRESSION_RECEIPT')
src=src.replace("r=json.loads(Path('V8_3_241_V238_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==12 and preserved==18","r=json.loads(Path('V8_3_241_V240_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==10 and preserved==20")
src=src.replace("'v238_previous_failures_repaired':12,'v238_previous_passes_preserved':18","'v240_previous_failures_repaired':10,'v240_previous_passes_preserved':20")
src=src.replace("'phase':'v114-bounded-regression'","'phase':'v115-bounded-regression'")
exec(compile(src,'v83241-v115-full-regression-adapted.py','exec'))
