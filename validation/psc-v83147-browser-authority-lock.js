(function(global){
'use strict';
if(!global.QCSemanticCoreV16)throw new Error('V8.3.147 browser authority lock requires QCSemanticCoreV16');
const VERSION='V8.3.147-BROWSER-AUTHORITY-LOCK';
global.PSC_V83147_BROWSER=Object.freeze({version:VERSION,semanticAuthority:'QCSemanticCoreV16'});
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscBrowserAuthority=VERSION;
})(typeof globalThis!=='undefined'?globalThis:this);
