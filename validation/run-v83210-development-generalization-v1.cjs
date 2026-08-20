const fs=require('fs'),path=require('path');
let src=fs.readFileSync('validation/run-v83209-development-generalization-challenge.cjs','utf8');
const anchor="vm.runInContext(fs.readFileSync('validation/qc-evidence-extractor-v1-review-candidate.js','utf8'),s,{filename:'qc-evidence-extractor-v1-review-candidate.js'});";
const inject=anchor+"\n"+
"vm.runInContext(fs.readFileSync('validation/qc-evidence-extractor-v1r-review-candidate.js','utf8'),s,{filename:'qc-evidence-extractor-v1r-review-candidate.js'});\n"+
"vm.runInContext(fs.readFileSync('validation/qc-evidence-extractor-v1r2-review-candidate.js','utf8'),s,{filename:'qc-evidence-extractor-v1r2-review-candidate.js'});\n"+
"vm.runInContext(fs.readFileSync('validation/psc-v83209-semantic-rule-table-v3-review-candidate.js','utf8'),s,{filename:'psc-v83209-semantic-rule-table-v3-review-candidate.js'});\n"+
"vm.runInContext(fs.readFileSync('validation/psc-v83209-v208-semantic-rule-table-promotion.js','utf8'),s,{filename:'psc-v83209-v208-semantic-rule-table-promotion.js'});\n"+
"vm.runInContext(fs.readFileSync('validation/qc-evidence-extractor-v1r3-v210-concept-coverage.js','utf8'),s,{filename:'qc-evidence-extractor-v1r3-v210-concept-coverage.js'});\n"+
"vm.runInContext(fs.readFileSync('validation/psc-v83210-v209-semantic-rule-table-v4.js','utf8'),s,{filename:'psc-v83210-v209-semantic-rule-table-v4.js'});\n"+
"vm.runInContext(fs.readFileSync('validation/qc-evidence-extractor-v1r4-v210-relational-preservation.js','utf8'),s,{filename:'qc-evidence-extractor-v1r4-v210-relational-preservation.js'});\n"+
"vm.runInContext(fs.readFileSync('validation/psc-v83210-v209-v1-relational-preservation.js','utf8'),s,{filename:'psc-v83210-v209-v1-relational-preservation.js'});";
if(!src.includes(anchor))throw new Error('V209 base generalization anchor missing');
src=src.replace(anchor,inject);
src=src.replaceAll("if(!s.QCSemanticCoreV78R)throw new Error('QCSemanticCoreV78R missing');","if(!s.QCSemanticCoreV82)throw new Error('QCSemanticCoreV82 missing');");
src=src.replaceAll("if(!s.QCEvidenceExtractorV1)throw new Error('QCEvidenceExtractorV1 missing');","if(!s.QCEvidenceExtractorV1R4)throw new Error('QCEvidenceExtractorV1R4 missing');");
src=src.replaceAll('s.QCEvidenceExtractorV1.extract','s.QCEvidenceExtractorV1R4.extract');
src=src.replaceAll('s.QCSemanticCoreV78R.analyze','s.QCSemanticCoreV82.analyze');
src=src.replaceAll('V8_3_209_DEVELOPMENT_GENERALIZATION_CHALLENGE_V1.json','V8_3_210_DEVELOPMENT_GENERALIZATION_CHALLENGE_V1.json');
src=src.replaceAll('V8.3.209 DEVELOPMENT-ONLY GENERALIZATION AUDIT V1','V8.3.210 DEVELOPMENT-ONLY FRESH GENERALIZATION AUDIT V1');
src=src.replaceAll("semantic_authority:'QCSemanticCoreV78R'","semantic_authority:'QCSemanticCoreV82'");
src=src.replaceAll("extractor:'QCEvidenceExtractorV1-REVIEW-CANDIDATE'","extractor:'QCEvidenceExtractorV1R4-V210-RELATIONAL-PRESERVATION'");
src=src.replaceAll('V8_3_209_DEVELOPMENT_GENERALIZATION_RESULTS_V1.json','V8_3_210_DEVELOPMENT_GENERALIZATION_RESULTS_V1.json');
const mod={exports:{}};const fn=new Function('require','module','exports','__filename','__dirname',src);fn(require,mod,mod.exports,path.resolve('generated-v83210-generalization-v1.cjs'),process.cwd());
