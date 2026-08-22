from pathlib import Path
src=Path('validation/v83241-v115-regression-orchestrator.py').read_text()
old_chain="'qc-evidence-extractor-v5ap-v241-v240-residuals.js','psc-v83241-v240-v115-residuals.js']"
new_chain="'qc-evidence-extractor-v5ap-v241-v240-residuals.js','psc-v83241-v240-v115-residuals.js','qc-evidence-extractor-v5aq-v242-v241-residuals.js','psc-v83242-v241-v116-residuals.js']"
assert old_chain in src
src=src.replace(old_chain,new_chain)
old_expected="240:(20,10)}"
new_expected="240:(20,10),241:(17,13)}"
assert old_expected in src
src=src.replace(old_expected,new_expected,1)
old_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238,240])run(v);"
new_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238,240,241])run(v);"
assert old_loop in src
src=src.replace(old_loop,new_loop,1)
src=src.replace('QCEvidenceExtractorV5AP','QCEvidenceExtractorV5AQ')
src=src.replace('QCSemanticCoreV115','QCSemanticCoreV116')
src=src.replace('V8.3.241','V8.3.242')
src=src.replace('V8_3_241','V8_3_242')
src=src.replace('V8_3_242_V115_BASE_REGRESSION_RESULTS','V8_3_242_V116_BASE_REGRESSION_RESULTS')
src=src.replace('V8_3_242_V115_BASE_REGRESSION_RECEIPT','V8_3_242_V116_BASE_REGRESSION_RECEIPT')
src=src.replace('V8_3_242_V115_REGRESSION_RECEIPT','V8_3_242_V116_REGRESSION_RECEIPT')
src=src.replace("r=json.loads(Path('V8_3_242_V240_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==10 and preserved==20","r=json.loads(Path('V8_3_242_V241_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==13 and preserved==17")
src=src.replace("'v240_previous_failures_repaired':10,'v240_previous_passes_preserved':20","'v241_previous_failures_repaired':13,'v241_previous_passes_preserved':17")
src=src.replace("'phase':'v115-bounded-regression'","'phase':'v116-bounded-regression'")
exec(compile(src,'v83242-v116-full-regression-adapted.py','exec'))
