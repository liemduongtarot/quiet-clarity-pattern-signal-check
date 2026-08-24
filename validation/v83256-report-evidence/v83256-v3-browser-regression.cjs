const {chromium}=require('/tmp/node_modules/playwright');
const fs=require('fs');
const URL='http://127.0.0.1:4173/candidate.html';
async function next(p){await p.locator('#n').click()}
async function choose(p,v){const x=p.locator(`input[value="${v}"]`).first();await x.check();await next(p)}
async function enter(p,area='work',sit='Trong ba tháng gần đây, mỗi khi dự án chậm tôi thường cố chốt thật nhanh và mở thêm nhiều việc cùng lúc vì áp lực.'){
  await p.goto(URL,{waitUntil:'domcontentloaded'});await next(p);await p.locator(`input[value="${area}"]`).check();await next(p);await p.locator('#t').fill(sit);await next(p);const r=p.locator('input[name=x]');if(await r.count()){await r.first().check();await next(p)}
}
async function flow(p,answers,area='work',sit){await enter(p,area,sit);for(const v of answers)await choose(p,v);return{title:(await p.locator('h2').textContent()).trim(),text:(await p.locator('#c').innerText()).trim()}}
(async()=>{
 const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:1440,height:900}});const o={cases:[]};
 const cases=[
 ['strong','PATTERN ĐANG HOẠT ĐỘNG RÕ',['A3','3','3','0','E5','3','3','3','2','progress']],
 ['mild','PATTERN ĐÃ YẾU ĐI NHƯNG VẪN QUAY LẠI',['A3','2','2','1','E5','1','1','1','1','progress']],
 ['no_pattern_adaptive','CHƯA THẤY PATTERN BẤT LỢI RÕ',['A9','3','3','0','E9','3','0','0','0','none']],
 ['situational_only','PHẢN ỨNG THEO TÌNH HUỐNG',['A3','0','0','0','E5','1','1','1','2','progress']],
 ['inconsistent','CHƯA ĐỦ BẰNG CHỨNG',['A3','3','1','2','E5','2','2','2','2','progress']],
 ['competing_exception','PATTERN ĐÃ YẾU ĐI NHƯNG VẪN QUAY LẠI',['A3','3','3','2','E5','2','2','2','2','progress']],
 ['weakened','PATTERN ĐÃ YẾU ĐI NHƯNG VẪN QUAY LẠI',['A3','3','3','1','E5','2','2','1','1','progress']],
 ['residual_old','DẤU VẾT CŨ / KHÔNG CÒN ẢNH HƯỞNG RÕ',['A3','3','3','1','E5','0','0','0','0','none']],
 ['contradictory_status','CHƯA ĐỦ BẰNG CHỨNG',['A3','3','3','0','E5','0','3','3','3','progress']],
 ['high_functioning_subtle','PATTERN ĐÃ YẾU ĐI NHƯNG VẪN QUAY LẠI',['A3','3','2','1','E5','2','1','1','2','progress']],
 ['insufficient','CHƯA ĐỦ BẰNG CHỨNG',['A3','-1','-1','-1','E5','-1','-1','-1','-1','unknown']],
 ['no_material_influence','CHƯA THẤY ẢNH HƯỞNG THỰC TẾ ĐÁNG KỂ',['A3','3','3','0','E5','1','0','0','2','none']],
 ['impact_conflict','CHƯA ĐỦ BẰNG CHỨNG',['A3','3','3','0','E5','3','3','3','2','none']]
 ];
 for(const [name,expect,a] of cases){const r=await flow(p,a);const pass=r.title===expect;o.cases.push({name,expect,actual:r.title,pass});if(!pass)throw new Error(`${name}: expected ${expect}, got ${r.title}`)}
 const money=await flow(p,['A3','3','2','1','E2','3','2','2','2','security'],'money','Trong vài tháng gần đây, mỗi khi lo về tiền tôi thường chốt một khoản chi hoặc cam kết sớm để cảm thấy mình đang xử lý được tình hình.');o.money_consequence=/Nguồn tiền sẵn có/.test(money.text)&&/biên an toàn/.test(money.text);
 const rel=await flow(p,['A3','3','3','1','E2','3','3','3','2','boundary'],'romantic','Trong nhiều lần gần đây, khi mối quan hệ căng tôi thường nhận thêm phần của người kia để giữ mọi thứ ổn và sau đó thấy mình quá tải.');o.relationship_consequence=/ranh giới/i.test(rel.text)&&/mối quan hệ/i.test(rel.text);
 const career=await flow(p,['A3','3','3','0','E5','3','3','3','2','fragment'],'work');o.career_consequence=/nguồn lực/i.test(career.text)&&/ưu tiên/i.test(career.text);o.no_internal_copy=!/classify|situation\/response|unknown\/insufficient|liên quan đến fixer|liên quan đến carer|liên quan đến peacekeeper/i.test(career.text);o.facebook_cta=(await p.locator('#contactFacebook').getAttribute('href'))==='https://www.facebook.com/quietclarity.uklondon';o.copy_visible=await p.locator('#copyResult').isVisible();o.save_visible=await p.locator('#saveResult').isVisible();o.donation_hidden=(await p.locator('.donation-note').count())===0;
 await p.goto(URL);await next(p);await p.locator('input[value="money"]').check();await next(p);await p.locator('#t').fill('Khi nào tôi mới có tiền?');await next(p);o.timing_invalid=/không dự đoán khi nào/i.test(await p.locator('#c').innerText());
 await p.goto(URL);await next(p);await p.locator('input[value="work"]').check();await next(p);await p.locator('#t').fill('Tôi lo.');await next(p);o.vague_invalid=/viết rõ|chưa đủ|cụ thể/i.test(await p.locator('#c').innerText());
 await enter(p,'work');await choose(p,'A10');const ta=p.locator('#q256OtherResponse');await ta.fill('Tôi phản ứng theo một cách rất riêng mà hệ thống chưa thể xác định.');await next(p);for(const v of ['3','3','0','E5','3','3','3','2','progress'])await choose(p,v);o.other_response_not_forced=(await p.locator('h2').textContent()).trim()==='CHƯA RÕ CÁCH PHẢN ỨNG';
 await enter(p,'work');await choose(p,'A3');await p.locator('#b').click();for(let i=0;i<5;i++){if(await p.locator('input[value="money"]').count())break;if(await p.locator('#b').count())await p.locator('#b').click()}if(await p.locator('input[value="money"]').count()){await p.locator('input[value="money"]').check();await next(p);await p.locator('#t').fill('Trong hai tháng gần đây, mỗi khi có khoản chi bất ngờ tôi thường trì hoãn xem lại ngân sách vì thấy áp lực.');await next(p);const r=p.locator('input[name=x]');if(await r.count()){await r.first().check();await next(p)}o.topic_switch_reset=(await p.locator('input[name=q256]:checked').count())===0}else{o.topic_switch_reset=false}
 const dims=await p.evaluate(()=>({body:document.body.scrollHeight,view:innerHeight,before:getComputedStyle(document.body,'::before').position,after:getComputedStyle(document.body,'::after').position}));o.ui_background_contract=dims.before==='absolute'&&dims.after==='absolute';o.ui_dimensions=dims;
 o.pass=o.cases.every(x=>x.pass)&&o.money_consequence&&o.relationship_consequence&&o.career_consequence&&o.no_internal_copy&&o.facebook_cta&&o.copy_visible&&o.save_visible&&o.donation_hidden&&o.timing_invalid&&o.vague_invalid&&o.other_response_not_forced&&o.topic_switch_reset&&o.ui_background_contract;
 fs.writeFileSync('evidence/V8_3_256_BROWSER_REGRESSION_V3.json',JSON.stringify(o,null,2));await p.screenshot({path:'evidence/V8_3_256_DESKTOP_FULLPAGE_V3.png',fullPage:true});await b.close();if(!o.pass)process.exit(1)
})().catch(e=>{console.error(e);process.exit(1)});
