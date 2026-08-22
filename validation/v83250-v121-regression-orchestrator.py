from pathlib import Path
src=Path('validation/v83249-v120-regression-orchestrator.py').read_text()
old_chain="'qc-evidence-extractor-v5au-v249-v248-residuals.js','psc-v83249-v248-v120-residuals.js']"
new_chain="'qc-evidence-extractor-v5au-v249-v248-residuals.js','psc-v83249-v248-v120-residuals.js','qc-evidence-extractor-v5av-v250-v249-residuals.js','psc-v83250-v249-v121-residuals.js']"
assert old_chain in src
src=src.replace(old_chain,new_chain,1)
old_expected="241:(17,13),242:(16,14),244:(16,14),245:(27,3),248:(22,8)}"
new_expected="241:(17,13),242:(16,14),244:(16,14),245:(27,3),248:(22,8),249:(23,7)}"
assert old_expected in src
src=src.replace(old_expected,new_expected,1)
old_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238,240,241,242,244,245,248])run(v);"
new_loop="for(const v of [219,221,222,223,224,225,226,227,229,230,231,233,234,235,236,237,238,240,241,242,244,245,248,249])run(v);"
assert old_loop in src
src=src.replace(old_loop,new_loop,1)
src=src.replace('QCEvidenceExtractorV5AU','QCEvidenceExtractorV5AV')
src=src.replace('QCSemanticCoreV120','QCSemanticCoreV121')
src=src.replace('V8.3.249','V8.3.250')
src=src.replace('V8_3_249','V8_3_250')
src=src.replace('V8_3_250_V120_BASE_REGRESSION_RESULTS','V8_3_250_V121_BASE_REGRESSION_RESULTS')
src=src.replace('V8_3_250_V120_BASE_REGRESSION_RECEIPT','V8_3_250_V121_BASE_REGRESSION_RECEIPT')
src=src.replace('V8_3_250_V120_REGRESSION_RECEIPT','V8_3_250_V121_REGRESSION_RECEIPT')
old_final="r=json.loads(Path('V8_3_250_V248_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==8 and preserved==22"
new_final="r=json.loads(Path('V8_3_250_V249_A_REGRESSION_RESULTS.json').read_text());repaired=sum(1 for x in r['results'] if not x['source_first_run_pass'] and x['pass']);preserved=sum(1 for x in r['results'] if x['source_first_run_pass'] and x['pass']);assert repaired==7 and preserved==23"
assert old_final in src
src=src.replace(old_final,new_final,1)
src=src.replace("'v248_previous_failures_repaired':8,'v248_previous_passes_preserved':22","'v249_previous_failures_repaired':7,'v249_previous_passes_preserved':23",1)
src=src.replace("'phase':'v120-bounded-regression'","'phase':'v121-bounded-regression'",1)
exec(compile(src,'v83250-v121-full-regression-adapted.py','exec'))
