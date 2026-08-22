from pathlib import Path
src=Path('validation/v83243-v117-regression-orchestrator.py').read_text()
old_chain="'qc-evidence-extractor-v5aq-v242-v241-residuals.js','psc-v83242-v241-v116-residuals.js','qc-evidence-extractor-v5ar-v243-v242-residuals.js','psc-v83243-v242-v117-residuals.js']"
new_chain="'qc-evidence-extractor-v5aq-v242-v241-residuals.js','psc-v83242-v241-v116-residuals.js','qc-evidence-extractor-v5ar-v243-v242-residuals.js','psc-v83243-v242-v117-residuals.js','qc-evidence-extractor-v5as-v245-v244-residuals.js','psc-v83245-v244-v118-residuals.js']"
assert old_chain in src
src=src.replace(old_chain,new_chain)
old_expected="241:(17,13),242:(16,14)}"
new_expected="241:(17,13),242:(16,14),244:(16,14)}"
assert old_expected in src
src=src.replace(old_expected,new_expected,1)
old_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238,240,241,242])run(v);"
new_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238,240,241,242,244])run(v);"
assert old_loop in src
src=src.replace(old_loop,new_loop,1)
src=src.replace('QCEvidenceExtractorV5AR','QCEvidenceExtractorV5AS')
src=src.replace('QCSemanticCoreV117','QCSemanticCoreV118')
src=src.replace('V8.3.243','V8.3.245')
src=src.replace('V8_3_243','V8_3_245')
src=src.replace('V8_3_245_V117_BASE_REGRESSION_RESULTS','V8_3_245_V118_BASE_REGRESSION_RESULTS')
src=src.replace('V8_3_245_V117_BASE_REGRESSION_RECEIPT','V8_3_245_V118_BASE_REGRESSION_RECEIPT')
src=src.replace('V8_3_245_V117_REGRESSION_RECEIPT','V8_3_245_V118_REGRESSION_RECEIPT')
old_final="r=json.loads(Path('V8_3_245_V242_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==14 and preserved==16"
new_final="r=json.loads(Path('V8_3_245_V244_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==14 and preserved==16"
assert old_final in src
src=src.replace(old_final,new_final,1)
src=src.replace("'v242_previous_failures_repaired':14,'v242_previous_passes_preserved':16","'v244_previous_failures_repaired':14,'v244_previous_passes_preserved':16",1)
src=src.replace("'phase':'v117-bounded-regression'","'phase':'v118-bounded-regression'",1)
exec(compile(src,'v83245-v118-full-regression-adapted.py','exec'))
