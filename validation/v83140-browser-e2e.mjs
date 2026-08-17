import fs from 'node:fs';
import { chromium } from '../.e2e/node_modules/playwright/index.mjs';

const base = process.env.PSC_E2E_URL;
if (!base) throw new Error('PSC_E2E_URL missing');
const matrix = JSON.parse(fs.readFileSync('PSC_V8_3_138_DEV/tests/V8_3_139_BROWSER_E2E_PREP_MATRIX.json','utf8'));
const browser = await chromium.launch({headless:true});
const results=[];
let appConsoleErrors=[];
let preflight={pass:false,attempts:[],execution_count:0};
try {
  // Transport-only browser preflight. No matrix case is executed until the exact browser authority is reachable.
  for (let attempt=1; attempt<=30 && !preflight.pass; attempt++) {
    const page=await browser.newPage();
    const reqFailures=[];
    page.on('requestfailed', req=>reqFailures.push({url:req.url(),error:req.failure()?.errorText||'unknown'}));
    let status=null,title='',body='',ready=false;
    try {
      const res=await page.goto(base + '/candidate.html?transport_preflight=' + attempt,{waitUntil:'domcontentloaded',timeout:15000});
      status=res?.status()??null;
      title=await page.title().catch(()=> '');
      body=(await page.locator('body').innerText().catch(()=> '')).slice(0,500);
      ready=await page.evaluate(() => !!globalThis.QCSemanticCoreV10 && !!globalThis.PSC_V83140 && globalThis.QCSemanticCoreV4===globalThis.QCSemanticCoreV10 && !!globalThis.PSCUIAuthorityV83137).catch(()=>false);
    } catch (e) {
      body=String(e?.message||e).slice(0,500);
    }
    preflight.attempts.push({attempt,status,title,ready,requestFailures:reqFailures,body});
    await page.close();
    if (status===200 && ready) preflight.pass=true;
    else await new Promise(r=>setTimeout(r,2000));
  }
  fs.writeFileSync('V8_3_140_BROWSER_TRANSPORT_PREFLIGHT.json',JSON.stringify(preflight,null,2));
  if(!preflight.pass){
    console.error(JSON.stringify(preflight,null,2));
    process.exitCode=2;
  } else {
    preflight.execution_count=1;
    for (const tc of matrix.cases) {
      const page = await browser.newPage();
      const errs=[];
      page.on('console', msg => { if (msg.type()==='error' && !msg.text().includes('chrome-extension://')) errs.push(msg.text()); });
      const res=await page.goto(base + '/candidate.html', {waitUntil:'domcontentloaded', timeout:30000});
      if(!res || res.status()!==200) throw new Error(`case ${tc.case_id}: candidate HTTP ${res?.status()}`);
      await page.waitForFunction(() => !!globalThis.QCSemanticCoreV10 && !!globalThis.PSC_V83140 && globalThis.QCSemanticCoreV4===globalThis.QCSemanticCoreV10 && !!globalThis.PSCUIAuthorityV83137, null, {timeout:15000});
      const runtime = await page.evaluate((input) => {
        const a = globalThis.QCSemanticCoreV4.analyze(input,'other',null);
        const legacy = typeof globalThis.bad === 'function' ? globalThis.bad(input) : null;
        const gate = globalThis.PSCUIAuthorityV83137.resolveSituationGate(globalThis.QCSemanticCoreV4,input,legacy);
        return {route:a.input_route?.id||null,families:[...(a.families||[])].sort(),sequence:!!a.sequence,gate:gate.gate,ui_route:gate.route?.id||null,authority:globalThis.QCSemanticCoreV4.version,bridge:globalThis.PSC_V83140.version};
      }, tc.input);
      const expFamilies=[...(tc.expected_families||[])].sort();
      const semanticPass = runtime.route===tc.expected_route && JSON.stringify(runtime.families)===JSON.stringify(expFamilies) && (tc.expected_sequence===undefined || !!tc.expected_sequence===runtime.sequence);
      await page.getByRole('button',{name:'BẮT ĐẦU'}).click();
      await page.locator('input[name=x]').first().check();
      await page.locator('#n').click();
      await page.locator('#t').fill(tc.input);
      await page.locator('#n').click();
      await page.waitForTimeout(100);
      const bodyText = await page.locator('body').innerText();
      let uiPass;
      if(tc.expected_route==='input:self-lived') uiPass=bodyText.includes('TRONG CHUYỆN NÀY, BẠN ĐANG VƯỚNG MẮC NHẤT Ở ĐÂU?');
      else if(tc.expected_route==='input:clarification-required') uiPass=bodyText.includes('HÃY VIẾT LẠI TÌNH HUỐNG') || bodyText.includes('TRONG CHUYỆN NÀY, BẠN ĐANG VƯỚNG MẮC NHẤT Ở ĐÂU?');
      else uiPass=bodyText.includes('HÃY VIẾT LẠI TÌNH HUỐNG');
      const pass = semanticPass && uiPass && errs.length===0;
      results.push({case_id:tc.case_id,expected_route:tc.expected_route,expected_families:expFamilies,expected_sequence:tc.expected_sequence,observed:runtime,semanticPass,uiPass,consoleErrors:errs,pass});
      appConsoleErrors.push(...errs.map(e=>({case_id:tc.case_id,error:e})));
      await page.close();
    }
  }
} finally { await browser.close(); }
if(preflight.pass){
  const out={candidate:'V8.3.140',base_url:base,execution_count:preflight.execution_count,total:results.length,passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,application_origin_console_errors:appConsoleErrors.length,results};
  fs.writeFileSync('V8_3_140_BROWSER_E2E_RESULTS.json', JSON.stringify(out,null,2));
  console.log(JSON.stringify(out,null,2));
  if (out.failed || out.application_origin_console_errors) process.exitCode=1;
}
