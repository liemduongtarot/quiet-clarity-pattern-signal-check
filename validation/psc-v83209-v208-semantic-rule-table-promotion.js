(function(global){
'use strict';
const parent=global.QCSemanticCoreV79RC3;if(!parent)throw new Error('V8.3.209 V80 promotion requires validated RC3');
const VERSION='V8.3.209-V80-SEMANTIC-RULE-TABLE-PROMOTED';
const core={...parent,version:VERSION,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.209-v80-promoted-semantic-rule-table'})};
global.QCSemanticCoreV80=core;global.PSC_V83209_PROMOTED=core;
})(typeof globalThis!=='undefined'?globalThis:this);
