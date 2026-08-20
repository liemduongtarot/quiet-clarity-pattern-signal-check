const fs=require('fs'),path=require('path');
let src=fs.readFileSync('validation/run-v83210-development-generalization-v1.cjs','utf8');
const anchor="vm.runInContext(fs.readFileSync('validation/psc-v83210-v209-v1-relational-preservation.js','utf8'),s,{filename:'psc-v83210-v209-v1-relational-preservation.js'});";
const inject=anchor+"\n"+
"vm.runInContext(fs.readFileSync('validation/qc-evidence-extractor-v2-v210-relational-semantics.js','utf8'),s,{filename:'qc-evidence-extractor-v2-v210-relational-semantics.js'});\n"+
"vm.runInContext(fs.readFileSync('validation/psc-v83210-v210-semantic-rule-table-v5.js','utf8'),s,{filename:'psc-v83210-v210-semantic-rule-table-v5.js'});";
if(!src.includes(anchor))throw new Error('V210 V1 runner V82 anchor missing');
src=src.replace(anchor,inject);
src=src.replaceAll('QCSemanticCoreV82','QCSemanticCoreV83');
src=src.replaceAll('QCEvidenceExtractorV1R4','QCEvidenceExtractorV2');
src=src.replaceAll('QCEvidenceExtractorV1R4-V210-RELATIONAL-PRESERVATION','QCEvidenceExtractorV2-V210-RELATIONAL-SEMANTICS');
src=src.replaceAll('V8.3.210 DEVELOPMENT-ONLY FRESH GENERALIZATION AUDIT V1','V8.3.210 DEVELOPMENT-ONLY FRESH GENERALIZATION AUDIT V2');
src=src.replaceAll('V8_3_210_DEVELOPMENT_GENERALIZATION_RESULTS_V1.json','V8_3_210_DEVELOPMENT_GENERALIZATION_RESULTS_V2.json');
const mod={exports:{}};const fn=new Function('require','module','exports','__filename','__dirname',src);fn(require,mod,mod.exports,path.resolve('generated-v83210-generalization-v2.cjs'),process.cwd());
