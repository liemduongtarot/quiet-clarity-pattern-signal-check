const fs=require('fs'),vm=require('vm');
let src=fs.readFileSync('validation/run-v83196-full-regression-sweep-v2.cjs','utf8');
src=src.replace("'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];","'psc-v83196-v195-v1-hypothetical-preservation-repair.js','psc-v83197-v196-sealed-a-bounded-repair.js'];");
src=src.replace(/QCSemanticCoreV65R/g,'QCSemanticCoreV66').replace('V8.3.196 V65R full immutable regression sweep V2','V8.3.197 V66 full immutable regression sweep').replace('V8_3_196_V2_FULL_REGRESSION_SWEEP_RESULTS.json','V8_3_197_FULL_REGRESSION_SWEEP_RESULTS.json');
vm.runInThisContext(src,{filename:'V8.3.197-derived-sweep'});
