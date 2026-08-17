(function(global){
'use strict';
const authority=global.QCSemanticCoreV10;
if(!authority)throw new Error('V8.3.140 requires V8.3.139 semantic authority');
const VERSION='V8.3.140-BROWSER-AUTHORITY-BRIDGE';
const metadata=Object.freeze({version:VERSION,parent:'V8.3.139 FAILED REVIEW CANDIDATE',classification:'BROWSER/UI CANONICAL AUTHORITY BRIDGE',runtime_semantics_changed:false,parser_changed:false,schema_changed:false,expected_contracts_changed:false,production_authorized:false,sealed_validation:'not-authorized',step_111:'prohibited'});
global.QCSemanticCoreV4=authority;
global.PSC_V83140=Object.freeze({version:VERSION,metadata,authority_version:authority.version});
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscBrowserAuthority='V8.3.140:v10-bridge';
})(typeof globalThis!=='undefined'?globalThis:this);
