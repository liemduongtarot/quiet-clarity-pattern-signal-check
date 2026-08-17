(function(global){
'use strict';
const VERSION='V8.3.151-BROWSER-AUTHORITY-LOCK';
if(!global.QCSemanticCoreV20)throw new Error('V8.3.151 browser lock requires QCSemanticCoreV20');
global.PSC_V83151_BROWSER=Object.freeze({version:VERSION,semantic:'QCSemanticCoreV20'});
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscBrowserAuthority=VERSION;
})(typeof globalThis!=='undefined'?globalThis:this);
