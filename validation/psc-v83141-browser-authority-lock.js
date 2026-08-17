(function(global){
'use strict';
const authority=global.QCSemanticCoreV10;
if(!authority)throw new Error('V8.3.141 requires V8.3.139 semantic authority');
const VERSION='V8.3.141-BROWSER-AUTHORITY-LOCK';
const metadata=Object.freeze({version:VERSION,parent:'V8.3.140 PRE-E2E INTEGRATION-DEFECT CANDIDATE',classification:'FINAL BROWSER BOOTSTRAP CANONICAL AUTHORITY SELECTION',semantic_runtime_changed:false,parser_changed:false,schema_changed:false,expected_contracts_changed:false,production_authorized:false,sealed_validation:'not-authorized',step_111:'prohibited'});
global.PSC_V83141=Object.freeze({version:VERSION,metadata,authority_version:authority.version});
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscBrowserAuthority='V8.3.141:v10-final-bootstrap';
})(typeof globalThis!=='undefined'?globalThis:this);
