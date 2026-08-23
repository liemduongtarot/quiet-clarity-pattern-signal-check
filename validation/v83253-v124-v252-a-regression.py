from pathlib import Path
src=Path('validation/v83252-v123-v251-a-regression.py').read_text()
repls=[
("V8_3_251_A_FROZEN_CARRIER","V8_3_252_A_FROZEN_CARRIER"),
("source_passed']==27","source_passed']==29"),("source_failed']==3","source_failed']==1"),
("'qc-evidence-extractor-v5ax-v252-v251-residuals.js','psc-v83252-v251-v123-residuals.js']","'qc-evidence-extractor-v5ax-v252-v251-residuals.js','psc-v83252-v251-v123-residuals.js','qc-evidence-extractor-v5ay-v253-v252-residual.js','psc-v83253-v252-v124-residual.js']"),
('QCEvidenceExtractorV5AX','QCEvidenceExtractorV5AY'),('QCSemanticCoreV123','QCSemanticCoreV124'),
('V8_3_252_V251_A_REGRESSION_RESULTS','V8_3_253_V252_A_REGRESSION_RESULTS'),
('V251 A regression','V252 A regression'),('run-v83252-v251-a-regression.cjs','run-v83253-v252-a-regression.cjs'),
("repaired==3 and preserved==27","repaired==1 and preserved==29"),
('V8_3_252_V251_A_REGRESSION_RECEIPT','V8_3_253_V252_A_REGRESSION_RECEIPT'),
("'candidate':'V8.3.252'","'candidate':'V8.3.253'"),
("QCEvidenceExtractorV5AX -> QCSemanticCoreV123","QCEvidenceExtractorV5AY -> QCSemanticCoreV124"),
("'v251_batch_a_total':30,'v251_batch_a_passed':30,'v251_batch_a_previous_failures_repaired':3,'v251_batch_a_previous_passes_preserved':27","'v252_batch_a_total':30,'v252_batch_a_passed':30,'v252_batch_a_previous_failures_repaired':1,'v252_batch_a_previous_passes_preserved':29")]
for a,b in repls:
 if a not in src: raise SystemExit('missing transform anchor '+a)
 src=src.replace(a,b)
exec(compile(src,'v83253-v124-v252-a-adapted.py','exec'))
