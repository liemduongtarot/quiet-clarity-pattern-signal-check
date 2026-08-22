from pathlib import Path
src=Path('validation/v83246-v119-regression-orchestrator.py').read_text()
old_chain="'qc-evidence-extractor-v5at-v246-v245-residuals.js','psc-v83246-v245-v119-residuals.js']"
new_chain="'qc-evidence-extractor-v5at-v246-v245-residuals.js','psc-v83246-v245-v119-residuals.js','qc-evidence-extractor-v5au-v249-v248-residuals.js','psc-v83249-v248-v120-residuals.js']"
assert old_chain in src
src=src.replace(old_chain,new_chain,1)
old_expected="241:(17,13),242:(16,14),244:(16,14),245:(27,3)}"
new_expected="241:(17,13),242:(16,14),244:(16,14),245:(27,3),248:(22,8)}"
assert old_expected in src
src=src.replace(old_expected,new_expected,1)
old_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238,240,241,242,244,245])run(v);"
new_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238,240,241,242,244,245,248])run(v);"
assert old_loop in src
src=src.replace(old_loop,new_loop,1)
src=src.replace('QCEvidenceExtractorV5AT','QCEvidenceExtractorV5AU')
src=src.replace('QCSemanticCoreV119','QCSemanticCoreV120')
src=src.replace('V8.3.246','V8.3.249')
src=src.replace('V8_3_246','V8_3_249')
src=src.replace('V8_3_249_V119_BASE_REGRESSION_RESULTS','V8_3_249_V120_BASE_REGRESSION_RESULTS')
src=src.replace('V8_3_249_V119_BASE_REGRESSION_RECEIPT','V8_3_249_V120_BASE_REGRESSION_RECEIPT')
src=src.replace('V8_3_249_V119_REGRESSION_RECEIPT','V8_3_249_V120_REGRESSION_RECEIPT')
old_final="r=json.loads(Path('V8_3_249_V245_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==3 and preserved==27"
new_final="r=json.loads(Path('V8_3_249_V248_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==8 and preserved==22"
assert old_final in src
src=src.replace(old_final,new_final,1)
src=src.replace("'v245_previous_failures_repaired':3,'v245_previous_passes_preserved':27","'v248_previous_failures_repaired':8,'v248_previous_passes_preserved':22",1)
src=src.replace("'phase':'v119-bounded-regression'","'phase':'v120-bounded-regression'",1)
exec(compile(src,'v83249-v120-full-regression-adapted.py','exec'))
