const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'OWNER_SMOKE_PREVIEW_V8_3_269_NON_PRODUCTION.html');
const evidenceDir = path.join(root, 'evidence', 'browser-v83269');
const baseUrl = process.env.PSC_BASE_URL || pathToFileURL(htmlPath).href;
fs.mkdirSync(evidenceDir, { recursive: true });

const cases = [
  { id:'implemented_idea_no_income', area:'work', vi:'toi thuong co nhieu y tuong cho cong viec nhung khi thuc hien cac y tuong do thi cong viec van khong tao ra thu nhap', en:'I often have many ideas for work, but when I implement those ideas the work still generates no income', viGroups:['phần đã làm|công việc|ý tưởng','thu nhập|trả tiền'], enGroups:['completed work|work|idea','income|pay'] },
  { id:'ideas_income_gap', area:'work', vi:'toi co nhieu y tuong cho cong viec nhung van chua chon y tuong nao de bat dau nen chua co thu nhap', en:'I have many ideas for work but have not chosen one to begin, so there is still no income', viGroups:['ý tưởng','thu nhập'], enGroups:['idea','income'] },
  { id:'workload_boundary_gap', area:'work', vi:'toi nhan them viec khi nguoi khac nho nen viec chinh bi tre va toi phai lam khuya', en:'I take on more work when others ask, so my main work is late and I work at night', viGroups:['lịch|sức|chỗ','nhận thêm|việc'], enGroups:['schedule|capacity','more work|request'] },
  { id:'offer_market_test_gap', area:'business', vi:'toi sua goi dich vu nhieu lan nhung chua gui cho khach hang that de xem ho co tra tien khong', en:'I revise the offer repeatedly but it has not been sent to a real customer to see if they will pay', viGroups:['gói dịch vụ|lời chào','gửi|khách hàng|thử'], enGroups:['offer|service','send|test|customer'] },
  { id:'budget_spending_gap', area:'money', vi:'toi giu tien nha nhung khi cang thang lai mua do nho va cuoi thang dung the tin dung', en:'I protect rent money but when stressed I buy small items and use a credit card at month end', viGroups:['tiền nhà','mua|chi|thẻ'], enGroups:['rent','buy|spend|card'] },
  { id:'contact_reciprocity_gap', area:'romantic', vi:'toi thuong nhan truoc va sap xep gap nhung nguoi kia phan hoi that thuong va toi van giu ket noi', en:'I usually message first and arrange meetings, but the other person is inconsistent and I keep the connection going', viGroups:['chủ động|nhắn|sắp xếp','phản hồi|kết nối'], enGroups:['initiat|message|arrange','response|connection'] },
  { id:'family_help_capacity_gap', area:'family', vi:'gia dinh can toi giup khi lich da kin nen toi bo thoi gian nghi de dap ung', en:'My family needs help when my schedule is full, so I give up rest to respond', viGroups:['gia đình','giúp|sức lực|nghỉ'], enGroups:['family','help|capacity|rest'] },
  { id:'friendship_initiation_gap', area:'friends', vi:'toi luon chu dong ru va giu lien lac nhung neu toi dung thi khong ai chu dong', en:'I always initiate and keep contact, but if I stop no one reaches out', viGroups:['chủ động|liên lạc','dừng|tìm tới|liên lạc'], enGroups:['initiative|initiat|contact','reach out|stepping back|contact'] },
  { id:'home_search_action_gap', area:'home', vi:'toi muon chuyen nha vi chi phi qua cao nhung chi xem them khu vuc va chua chot lich viewing', en:'I want to move because the cost is too expensive, but I keep looking at more areas and have not booked a viewing', viGroups:['căn|nhà','đặt lịch|lịch xem'], enGroups:['property|home|viewing','book|choose|viewing'] },
  { id:'daily_priority_gap', area:'daily', vi:'toi lap danh sach chi tiet nhung lam nhieu viec nho nen toi viec quan trong van chua xong', en:'I make a detailed list but do many small tasks, so the important task is still unfinished', viGroups:['quan trọng','việc nhỏ|thời gian'], enGroups:['important','small task|time'] },
  { id:'rest_recovery_gap', area:'wellbeing', vi:'toi thay met nhung van lam toi khuya va ngay sau ngu nhieu van chua hoi phuc', en:'I feel tired but work late, and after long sleep I still do not recover', viGroups:['hồi phục|mệt|ngủ','dừng|công việc|mệt'], enGroups:['recover|tired|sleep','stopping|work|tired'] },
  { id:'direction_commitment_gap', area:'direction', vi:'toi co ba huong nghe nghiep va tiep tuc nghien cuu nhung chua chon mot huong de thu trong thuc te', en:'I have three career directions and keep researching but have not chosen one to test in practice', viGroups:['hướng','chọn|thử|nghiên cứu'], enGroups:['direction','choose|test|research'] },
  { id:'deadline_reprioritisation', area:'work', vi:'deadline doi dot ngot nen toi doi thu tu uu tien mot lan de xu ly viec khan cap trong tuan nay', en:'The deadline changed suddenly, so I reprioritised once to handle the urgent work this week', viGroups:['deadline|khẩn cấp','ưu tiên|đổi'], enGroups:['deadline|urgent','priorit|change'] },
  { id:'adaptive_budget_adjustment', area:'money', vi:'thu nhap thang nay giam nen toi cat hai khoan khong can thiet va van giu du tien nha', en:'My income fell this month, so I cut two non-essential costs and still kept enough money for rent', viGroups:['nguồn tiền|thu nhập|tiền nhà','điều chỉnh|cắt|giữ'], enGroups:['money|income|rent','adjust|cut|keep'] }
];

const banned = [
  /undefined|null|\[object Object\]/i,
  /quanh việc|trong việc đưa|xử lý việc đưa/i,
  /đưa[^.!?]{0,100}tới một bước/i,
  /the task of|the step of/i,
  /mỗi khi[^?]{0,180}thường xuyên đến đâu/i,
  /each time[^?]{0,180}how often/i,
  /database|semantic id|profile_id/i
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function slug(value) {
  return value.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
}

async function visibleText(locator) {
  return (await locator.innerText()).replace(/\s+/g, ' ').trim();
}

function inspectSurface(text, label, maxLength = 1200) {
  assert(text.length > 0, `${label}: empty visible surface`);
  assert(text.length <= maxLength, `${label}: implausibly long visible surface (${text.length})`);
  for (const marker of banned) assert(!marker.test(text), `${label}: banned carrier ${marker} in ${text.slice(0, 220)}`);
}

function assertSemanticGroups(text, groups, label) {
  for (const group of groups) {
    assert(new RegExp(group, 'iu').test(text), `${label}: missing semantic group /${group}/`);
  }
}

async function assertLanguageSwitch(page, lang, label) {
  await page.locator('#langVi').waitFor({ state:'visible' });
  await page.locator('#langEn').waitFor({ state:'visible' });
  const active = await page.locator(lang === 'vi' ? '#langVi' : '#langEn').getAttribute('aria-pressed');
  assert(active === 'true', `${label}: ${lang} language control not visibly active`);
}

async function runPath(browser, fixture, lang) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: lang === 'vi' ? 'vi-VN' : 'en-GB' });
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  let maxOverflow = 0;
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText || 'failed'}`));

  async function recordLayout(step) {
    const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
    maxOverflow = Math.max(maxOverflow, overflow);
    assert(overflow <= 1, `${fixture.id}/${lang}/${step}: horizontal overflow ${overflow}px`);
    await assertLanguageSwitch(page, lang, `${fixture.id}/${lang}/${step}`);
  }

  await page.goto(baseUrl, { waitUntil:'load', timeout:60000 });
  if (lang === 'en') await page.locator('#langEn').click();
  await recordLayout('landing');
  const landingText = await visibleText(page.locator('body'));
  const expectedLanding = lang === 'vi' ? 'Có những lúc chúng ta tự hỏi' : 'There are times when we ask ourselves';
  assert(landingText.includes(expectedLanding), `${fixture.id}/${lang}: landing copy missing`);
  assert(landingText.includes(lang === 'vi' ? 'TRƯỚC KHI BẮT ĐẦU' : 'BEFORE YOU BEGIN'), `${fixture.id}/${lang}: scope preflight missing`);

  await page.locator('#n').click();
  await recordLayout('area');
  await page.locator(`input[name="area264"][value="${fixture.area}"]`).check();
  await page.locator('#n').click();
  await recordLayout('situation');
  await page.locator('#t').fill(fixture[lang]);
  await page.locator('#n').click();
  await recordLayout('tension');
  const tension = await visibleText(page.locator('.tension-proposal'));
  inspectSurface(tension, `${fixture.id}/${lang}/tension`);
  await page.locator('input[name="tension264"][value="confirm"]').check();
  await page.locator('#n').click();

  const questions = [];
  for (let index = 0; index < 10; index += 1) {
    await recordLayout(`q${index + 1}`);
    const eyebrow = await visibleText(page.locator('.e'));
    assert(eyebrow.includes(`${index + 1}/10`), `${fixture.id}/${lang}: wrong question number at ${index + 1}`);
    const title = await visibleText(page.locator('h2'));
    const guide = await visibleText(page.locator('h2 + p'));
    const options = await page.locator('input[name="q264"]').evaluateAll(nodes => nodes.map(node => ({ id:node.value, label:node.parentElement?.innerText?.replace(/\s+/g, ' ').trim() || '' })));
    inspectSurface(title, `${fixture.id}/${lang}/q${index + 1}/title`);
    inspectSurface(guide, `${fixture.id}/${lang}/q${index + 1}/guide`);
    assert(options.length >= 4, `${fixture.id}/${lang}/q${index + 1}: too few options (${options.length})`);
    assert(new Set(options.map(option => option.id)).size === options.length, `${fixture.id}/${lang}/q${index + 1}: duplicate option ids`);
    for (const option of options) inspectSurface(option.label, `${fixture.id}/${lang}/q${index + 1}/${option.id}`);
    questions.push({ number:index + 1, title, guide, options });
    await page.locator('input[name="q264"]').first().check();
    await page.locator('#n').click();
  }

  await page.locator('.report-narrative').waitFor({ timeout:30000 });
  await recordLayout('result');
  const report = page.locator('.report-narrative');
  const classification = await report.getAttribute('data-classification');
  const profile = await report.getAttribute('data-profile');
  const reportText = await visibleText(report);
  const sections = await report.locator('.report-section').evaluateAll(nodes => nodes.map(node => ({ heading:node.querySelector('h3')?.innerText?.replace(/\s+/g, ' ').trim() || '', body:node.querySelector('p')?.innerText?.replace(/\s+/g, ' ').trim() || '' })));
  inspectSurface(reportText, `${fixture.id}/${lang}/report`, 12000);
  assert(profile === fixture.id, `${fixture.id}/${lang}: wrong profile ${profile}`);
  assert(classification && classification !== 'INCOMPLETE', `${fixture.id}/${lang}: incomplete classification`);
  assert(sections.length === 7, `${fixture.id}/${lang}: expected 7 report sections, got ${sections.length}`);
  assertSemanticGroups(reportText, fixture[`${lang}Groups`], `${fixture.id}/${lang}/report`);
  assert(errors.length === 0, `${fixture.id}/${lang}: browser errors: ${errors.join(' | ')}`);
  assert(failedRequests.length === 0, `${fixture.id}/${lang}: failed requests: ${failedRequests.join(' | ')}`);

  await page.screenshot({
    path:path.join(evidenceDir, `${slug(fixture.id)}-${lang}-result.jpg`),
    fullPage:true,
    type:'jpeg',
    quality:72
  });
  await context.close();
  return { fixture:fixture.id, area:fixture.area, lang, profile, classification, tension, questions, sections, report_text:reportText, console_errors:errors, failed_requests:failedRequests, max_horizontal_overflow_px:maxOverflow };
}

async function runMobile(browser, lang) {
  const context = await browser.newContext({ viewport:{ width:390, height:844 }, isMobile:true, locale:lang === 'vi' ? 'vi-VN' : 'en-GB' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(baseUrl, { waitUntil:'load', timeout:60000 });
  if (lang === 'en') await page.locator('#langEn').click();
  await assertLanguageSwitch(page, lang, `mobile/${lang}`);
  const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
  assert(overflow <= 1, `mobile/${lang}: horizontal overflow ${overflow}px`);
  await page.screenshot({ path:path.join(evidenceDir, `mobile-${lang}-landing.jpg`), fullPage:true, type:'jpeg', quality:78 });
  await context.close();
  return { lang, horizontal_overflow_px:overflow, console_errors:errors };
}

(async () => {
  const startedAt = new Date().toISOString();
  const browser = await chromium.launch({ headless:true });
  const results = [];
  const failures = [];
  try {
    for (const fixture of cases) {
      const pair = {};
      for (const lang of ['vi','en']) {
        try {
          pair[lang] = await runPath(browser, fixture, lang);
          results.push(pair[lang]);
          console.log(`PASS ${fixture.id}/${lang} ${pair[lang].classification}`);
        } catch (error) {
          failures.push(`${fixture.id}/${lang}: ${error.stack || error.message}`);
          console.error(`FAIL ${fixture.id}/${lang}: ${error.message}`);
        }
      }
      if (pair.vi && pair.en) {
        if (pair.vi.profile !== pair.en.profile) failures.push(`${fixture.id}: VI/EN profile mismatch`);
        if (pair.vi.classification !== pair.en.classification) failures.push(`${fixture.id}: VI/EN classification mismatch`);
        for (let index = 0; index < 10; index += 1) {
          const viIds = pair.vi.questions[index].options.map(option => option.id).join('|');
          const enIds = pair.en.questions[index].options.map(option => option.id).join('|');
          if (viIds !== enIds) failures.push(`${fixture.id}/q${index + 1}: VI/EN option ID mismatch`);
        }
      }
    }
    let mobile = [];
    for (const lang of ['vi','en']) {
      try { mobile.push(await runMobile(browser, lang)); }
      catch (error) { failures.push(`mobile/${lang}: ${error.stack || error.message}`); }
    }
    const output = {
      version:'V8.3.269-INPUT-STRUCTURE-HUMAN-LANGUAGE-CORE-R1-NON-PRODUCTION',
      test_type:'permitted browser end-to-end development matrix; no sealed, holdout or locked tests executed',
      source_url:baseUrl,
      started_at:startedAt,
      finished_at:new Date().toISOString(),
      real_case_profiles:cases.length,
      bilingual_full_paths_expected:cases.length * 2,
      bilingual_full_paths_completed:results.length,
      question_screens_exercised:results.length * 10,
      report_screens_exercised:results.length,
      mobile,
      failures,
      verdict:failures.length ? 'FAIL' : 'PASS',
      production_promoted:false,
      sealed_or_holdout_executed:false,
      results
    };
    const outputPath = path.join(root, 'evidence', 'V8_3_269_BROWSER_E2E_MATRIX.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(JSON.stringify({ outputPath, verdict:output.verdict, completed:output.bilingual_full_paths_completed, questionScreens:output.question_screens_exercised, reportScreens:output.report_screens_exercised, failures:failures.length }, null, 2));
    if (failures.length) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
