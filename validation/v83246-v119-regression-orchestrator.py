from pathlib import Path
src=Path('validation/v83245-v118-regression-orchestrator.py').read_text()
old_chain="'qc-evidence-extractor-v5as-v245-v244-residuals.js','psc-v83245-v244-v118-residuals.js']"
new_chain="'qc-evidence-extractor-v5as-v245-v244-residuals.js','psc-v83245-v244-v118-residuals.js','qc-evidence-extractor-v5at-v246-v245-residuals.js','psc-v83246-v245-v119-residuals.js']"
assert old_chain in src
src=src.replace(old_chain,new_chain)
old_expected="241:(17,13),242:(16,14),244:(16,14)}"
new_expected="241:(17,13),242:(16,14),244:(16,14),245:(27,3)}"
assert old_expected in src
src=src.replace(old_expected,new_expected,1)
old_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238,240,241,242,244])run(v);"
new_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238,240,241,242,244,245])run(v);"
assert old_loop in src
src=src.replace(old_loop,new_loop,1)
src=src.replace('QCEvidenceExtractorV5AS','QCEvidenceExtractorV5AT')
src=src.replace('QCSemanticCoreV118','QCSemanticCoreV119')
src=src.replace('V8.3.245','V8.3.246')
src=src.replace('V8_3_245','V8_3_246')
src=src.replace('V8_3_246_V118_BASE_REGRESSION_RESULTS','V8_3_246_V119_BASE_REGRESSION_RESULTS')
src=src.replace('V8_3_246_V118_BASE_REGRESSION_RECEIPT','V8_3_246_V119_BASE_REGRESSION_RECEIPT')
src=src.replace('V8_3_246_V118_REGRESSION_RECEIPT','V8_3_246_V119_REGRESSION_RECEIPT')
old_final="r=json.loads(Path('V8_3_246_V244_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==14 and preserved==16"
new_final="r=json.loads(Path('V8_3_246_V245_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==3 and preserved==27"
assert old_final in src
src=src.replace(old_final,new_final,1)
src=src.replace("'v244_previous_failures_repaired':14,'v244_previous_passes_preserved':16","'v245_previous_failures_repaired':3,'v245_previous_passes_preserved':27",1)
src=src.replace("'phase':'v118-bounded-regression'","'phase':'v119-bounded-regression'",1)
exec(compile(src,'v83246-v119-full-regression-adapted.py','exec'))
