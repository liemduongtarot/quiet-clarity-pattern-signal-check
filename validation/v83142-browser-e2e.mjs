import fs from 'node:fs';
import { chromium } from '../.e2e/node_modules/playwright/index.mjs';
const base=process.env.PSC_E2E_URL;if(!base)throw new Error('PSC_E2E_URL missing');
const forensic=JSON.parse(fs.readFileSync('validation/V8_3_141_BATCH_A_FAILURE_FORENSIC_IMMUTABLE.json','utf8'));
const controls=[
 {case_id:'CONTROL-TIMING',surface:'Khi nào tôi mới có tiền?',expected:{route:'input:prediction',families:[],sequence:false}},
 {case_id:'CONTROL-DECISION',surface:'Should I quit my job tomorrow?',expected:{route:'input:decision-request',families:[],sequence:false}},
 {case_id:'CONTROL-HYPOTHETICAL',surface:'Suppose someone avoided replying to an email.',expected:{route:'input:hypothetical-or-example',families:[],sequence:false}}
];
const cases=[...forensic.failures,...controls];
const browser=await chromium.launch({headless:true});const results=[];let appErrors=[];let preflight=[];let ready=false;
try{
 for(let i=1;i<=12&&!ready;i++){
  const p=await browser.newPage();let status=null,globals={},fails=[];
  p.on('requestfailed',r=>fails.push({url:r.url(),error:r.failure()?.errorText||'unknown'}));
  try{const res=await p.goto(base+'/candidate.html?preflight='+i,{waitUntil:'networkidle',timeout:20000});status=res?.status()??null;globals=await p.evaluate(()=>({v4:globalThis.QCSemanticCoreV4?.version||null,v11:globalThis.QCSemanticCoreV11?.version||null,browser:globalThis.PSC_V83142_BROWSER?.version||null,ui137:globalThis.PSCUIAuthorityV83137?.version||null,same:!!globalThis.QCSemanticCoreV11&&globalThis.QCSemanticCoreV4===globalThis.QCSemanticCoreV11}));ready=status===200&&globals.same&&!!globals.browser&&!!globals.ui137;}catch(e){fails.push({error:String(e?.message||e)})}preflight.push({attempt:i,status,globals,requestFailures:fails});await p.close();if(!ready)await new Promise(r=>setTimeout(r,1500));
 }
 fs.writeFileSync('V8_3_142_BROWSER_TRANSPORT_PREFLIGHT.json',JSON.stringify({pass:ready,attempts:preflight,case_execution_count:0},null,2));
 if(!ready)throw new Error('V8.3.142 browser authority preflight failed');
 for(const tc of cases){
  const page=await browser.newPage();const errs=[];page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('chrome-extension://'))errs.push(m.text())});page.on('pageerror',e=>errs.push(String(e?.message||e)));
  const res=await page.goto(base+'/candidate.html',{waitUntil:'networkidle',timeout:30000});if(!res||res.status()!==200)throw new Error(`${tc.case_id}: HTTP ${res?.status()}`);
  await page.waitForFunction(()=>!!globalThis.QCSemanticCoreV11&&globalThis.QCSemanticCoreV4===globalThis.QCSemanticCoreV11&&!!globalThis.PSC_V83142_BROWSER&&!!globalThis.PSCUIAuthorityV83137,null,{timeout:10000});
  const runtime=await page.evaluate(input=>{const a=globalThis.QCSemanticCoreV4.analyze(input,'other',null);const legacy=typeof globalThis.bad==='function'?globalThis.bad(input):null;const g=globalThis.PSCUIAuthorityV83137.resolveSituationGate(globalThis.QCSemanticCoreV4,input,legacy);return{route:a.input_route?.id||null,families:[...(a.families||[])].sort(),sequence:!!a.sequence,gate:g.gate,ui_route:g.route?.id||null,authority:globalThis.QCSemanticCoreV4.version}},tc.surface);
  const expectedFamilies=[...(tc.expected.families||[])].sort();const semanticPass=runtime.route===tc.expected.route&&JSON.stringify(runtime.families)===JSON.stringify(expectedFamilies)&&runtime.sequence===!!tc.expected.sequence;
  await page.getByRole('button',{name:'BẮT ĐẦU'}).click();await page.locator('input[name=x]').first().check();await page.locator('#n').click();await page.locator('#t').fill(tc.surface);await page.locator('#n').click();await page.waitForTimeout(120);const text=await page.locator('body').innerText();
  let uiPass;if(tc.expected.route==='input:self-lived')uiPass=text.includes('TRONG CHUYỆN NÀY, BẠN ĐANG VƯỚNG MẮC NHẤT Ở ĐÂU?');else if(tc.expected.route==='input:clarification-required')uiPass=text.includes('HÃY VIẾT LẠI TÌNH HUỐNG')||text.includes('TRONG CHUYỆN NÀY, BẠN ĐANG VƯỚNG MẮC NHẤT Ở ĐÂU?');else uiPass=text.includes('HÃY VIẾT LẠI TÌNH HUỐNG');
  const pass=semanticPass&&uiPass&&errs.length===0;results.push({case_id:tc.case_id,expected_route:tc.expected.route,expected_families:expectedFamilies,expected_sequence:!!tc.expected.sequence,observed:runtime,semanticPass,uiPass,consoleErrors:errs,pass});appErrors.push(...errs.map(error=>({case_id:tc.case_id,error})));await page.close();
 }
}finally{await browser.close()}
const out={candidate:'V8.3.142',execution_count:1,total:results.length,passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,application_origin_console_errors:appErrors.length,results};fs.writeFileSync('V8_3_142_BROWSER_E2E_RESULTS.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));if(out.failed||out.application_origin_console_errors)process.exit(1);
