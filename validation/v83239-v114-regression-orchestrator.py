from pathlib import Path
src=Path('validation/v83238-v113-regression-orchestrator.py').read_text()
# Promote the proven V238 full-regression harness to V239/V114 while preserving all frozen contracts.
old_chain="'qc-evidence-extractor-v5an-v238-frozen-residuals.js','psc-v83238-v237-v113-frozen-residuals.js']"
new_chain="'qc-evidence-extractor-v5an-v238-frozen-residuals.js','psc-v83238-v237-v113-frozen-residuals.js','qc-evidence-extractor-v5ao-v239-v238-residuals.js','psc-v83239-v238-v114-v238-residuals.js']"
assert old_chain in src
src=src.replace(old_chain,new_chain)
old_expected="237:(20,10)}"
new_expected="237:(20,10),238:(18,12)}"
assert old_expected in src
src=src.replace(old_expected,new_expected,1)
old_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237])run(v);"
new_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238])run(v);"
assert old_loop in src
src=src.replace(old_loop,new_loop,1)
src=src.replace('QCEvidenceExtractorV5AN','QCEvidenceExtractorV5AO')
src=src.replace('QCSemanticCoreV113','QCSemanticCoreV114')
src=src.replace('V8.3.238','V8.3.239')
src=src.replace('V8_3_238','V8_3_239')
src=src.replace('V8_3_239_V113_BASE_REGRESSION_RESULTS','V8_3_239_V114_BASE_REGRESSION_RESULTS')
src=src.replace('V8_3_239_V113_BASE_REGRESSION_RECEIPT','V8_3_239_V114_BASE_REGRESSION_RECEIPT')
src=src.replace('V8_3_239_V113_REGRESSION_RECEIPT','V8_3_239_V114_REGRESSION_RECEIPT')
src=src.replace("r=json.loads(Path('V8_3_239_V237_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==10 and preserved==20","r=json.loads(Path('V8_3_239_V238_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==12 and preserved==18")
src=src.replace("'v237_previous_failures_repaired':10,'v237_previous_passes_preserved':20","'v238_previous_failures_repaired':12,'v238_previous_passes_preserved':18")
src=src.replace("'phase':'v113-bounded-regression'","'phase':'v114-bounded-regression'")
exec(compile(src,'v83239-v114-full-regression-adapted.py','exec'))
