import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('../.e2e/node_modules/playwright');
const base=process.env.PSC_E2E_URL;
if(!base)throw new Error('PSC_E2E_URL missing');
const forensic=JSON.parse(fs.readFileSync('validation/V8_3_143_BATCH_A_FAILURE_FORENSIC_IMMUTABLE.json','utf8'));
const controls=[
 {case_id:'CONTROL-TIMING',surface:'What time will they reply tomorrow?',expected:{route:'input:prediction',families:[],sequence:false}},
 {case_id:'CONTROL-DECISION',surface:'Should I accept this offer or decline it?',expected:{route:'input:decision-request',families:[],sequence:false}},
 {case_id:'CONTROL-HYPOTHETICAL',surface:'For example, someone might delay replying even when nothing is wrong.',expected:{route:'input:hypothetical-or-example',families:[],sequence:false}}
];
const cases=[...forensic.failures,...controls];
const browser=await chromium.launch({headless:true});
let execution_count=0;const results=[];let application_origin_console_errors=0;
try{
 const page=await browser.newPage();
 page.on('console',m=>{if(m.type()==='error')application_origin_console_errors++;});
 page.on('pageerror',()=>{application_origin_console_errors++;});
 await page.goto(base+'/candidate.html',{waitUntil:'networkidle',timeout:30000});
 const preflight=await page.evaluate(()=>({v13:globalThis.QCSemanticCoreV13?.version||null,v4:globalThis.QCSemanticCoreV4?.version||null,same:globalThis.QCSemanticCoreV4===globalThis.QCSemanticCoreV13,browser:globalThis.PSC_V83144_BROWSER?.version||null,semanticDataset:document.documentElement.dataset.pscSemanticAuthority||null,browserDataset:document.documentElement.dataset.pscBrowserAuthority||null}));
 fs.writeFileSync('V8_3_144_BROWSER_TRANSPORT_PREFLIGHT.json',JSON.stringify(preflight,null,2));
 if(preflight.v13!=='V8.3.144-SEALED-A-FAILURE-CONVERGENCE'||!preflight.same||preflight.browser!=='V8.3.144-BROWSER-AUTHORITY-LOCK')throw new Error('V8.3.144 browser authority preflight failed '+JSON.stringify(preflight));
 execution_count++;
 for(const c of cases){
  const observed=await page.evaluate(surface=>{const r=globalThis.QCSemanticCoreV4.analyze(surface);let ui=null;try{ui=globalThis.PSCUIAuthorityV83137?.resolveSituationGate?.(globalThis.QCSemanticCoreV4,surface,null)||null;}catch{}return{route:r.input_route?.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence,ui_route:ui?.route?.id||ui?.input_route?.id||r.input_route?.id,authority:r.version};},c.surface);
  const expected={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence};
  const semanticPass=observed.route===expected.route&&JSON.stringify(observed.families)===JSON.stringify(expected.families)&&observed.sequence===expected.sequence;
  const uiPass=observed.ui_route===expected.route;
  results.push({case_id:c.case_id,expected_route:expected.route,expected_families:expected.families,expected_sequence:expected.sequence,observed,semanticPass,uiPass,pass:semanticPass&&uiPass});
 }
 const out={candidate:'V8.3.144',execution_count,total:results.length,passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,application_origin_console_errors,results};
 fs.writeFileSync('V8_3_144_BROWSER_E2E_RESULTS.json',JSON.stringify(out,null,2));
 console.log(JSON.stringify(out,null,2));
 if(out.failed||application_origin_console_errors)process.exitCode=1;
}finally{await browser.close();}
