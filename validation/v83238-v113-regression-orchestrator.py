from pathlib import Path
src=Path('validation/v83237-v112-regression-orchestrator.py').read_text()
# Promote the prior proven full-regression harness mechanically to V238/V113 while preserving all prior frozen contracts.
old_chain="'qc-evidence-extractor-v5am-v237-final-compositional.js','psc-v83237-v236-v112-final-compositional.js']"
new_chain="'qc-evidence-extractor-v5am-v237-final-compositional.js','psc-v83237-v236-v112-final-compositional.js','qc-evidence-extractor-v5an-v238-frozen-residuals.js','psc-v83238-v237-v113-frozen-residuals.js']"
assert old_chain in src
src=src.replace(old_chain,new_chain)
old_expected="236:(22,8)}"
new_expected="236:(22,8),237:(20,10)}"
assert old_expected in src
src=src.replace(old_expected,new_expected,1)
# Extend the hard-coded frozen-carrier JS loop through V237.
old_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236])run(v);"
new_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237])run(v);"
assert old_loop in src
src=src.replace(old_loop,new_loop,1)
src=src.replace('QCEvidenceExtractorV5AM','QCEvidenceExtractorV5AN')
src=src.replace('QCSemanticCoreV112','QCSemanticCoreV113')
src=src.replace('V8.3.237','V8.3.238')
src=src.replace('V8_3_237','V8_3_238')
src=src.replace("r=json.loads(Path('V8_3_238_V236_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==8 and preserved==22","r=json.loads(Path('V8_3_238_V237_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==10 and preserved==20")
src=src.replace("'v236_previous_failures_repaired':8,'v236_previous_passes_preserved':22","'v237_previous_failures_repaired':10,'v237_previous_passes_preserved':20")
src=src.replace("'phase':'v112-bounded-regression'","'phase':'v113-bounded-regression'")
exec(compile(src,'v83238-v113-full-regression-adapted.py','exec'))
