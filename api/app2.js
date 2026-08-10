import app from './app.js';
import { getVercelOidcToken } from '@vercel/oidc';

const VERSION='v8.3.11-primary-pattern-resolution';
const ELIGIBLE=['A','B','C','D','F','G','H'];
const FAMILY_MEANING={
  A:'discomfort avoidance, over-tolerance, resignation, or smoothing things over before reality is clear',
  B:'self-pressure, over-accommodation, or giving understanding more weight than impact, accountability, or boundaries',
  C:'attention moving away from present evidence toward the past, prediction, urgency, or immediate detail',
  D:'a gap between knowing and acting, over-preparation, sunk commitment, or staying too rigid with a plan',
  F:'a familiar viewpoint or role carrying too much weight, including responsibility confusion or perspective over-analysis',
  G:'repeated checking, rigid thought rules, feared possibilities, or over-vigilance about whether one can trust a judgement',
  H:'misalignment between values and actual choices/resources, or applying a value too rigidly in real life'
};
const FALLBACK={
  vi:{
    A:['Điều đang nổi bật hơn cả lúc này là xu hướng trì hoãn, chịu đựng hoặc làm nhẹ việc phải đối diện với sự khó chịu, ngay cả khi tình huống đã cần một phản ứng rõ hơn.','Nếu pattern này tiếp tục, những việc cần được xử lý đúng lúc có thể tiếp tục bị dời đến khi phạm vi lựa chọn thực tế hẹp hơn.','Đồng thời, bạn vẫn cho thấy khả năng ở lại với cảm giác khó chịu mà không hoàn toàn mất đi khả năng nhìn thực tế.'],
    B:['Điều đang nổi bật hơn cả lúc này là xu hướng dành nhiều độ rộng cho tiêu chuẩn của mình hoặc cho người khác hơn là cho tác động thực tế đang rơi lên chính bạn.','Nếu pattern này tiếp tục, phần tác động lên chính bạn có thể tiếp tục bị đặt sau nhu cầu giữ mọi thứ hợp lý hoặc dễ chấp nhận.','Đồng thời, bạn vẫn cho thấy khả năng giữ sự tử tế mà không hoàn toàn đánh mất trách nhiệm và ranh giới.'],
    C:['Điều đang nổi bật hơn cả lúc này là sự chú ý dễ rời khỏi dữ kiện hiện tại, khiến quá khứ, dự đoán hoặc điều cấp bách nhất thời nhận nhiều trọng lượng hơn mức cần thiết.','Nếu pattern này tiếp tục, những lựa chọn cần dựa trên dữ kiện hiện tại có thể tiếp tục bị làm chậm hoặc lệch bởi thông tin không còn cùng trọng lượng.','Đồng thời, bạn vẫn có khả năng phân biệt dữ kiện hiện tại với điều thuộc về quá khứ hoặc dự đoán.'],
    D:['Điều đang nổi bật hơn cả lúc này là khoảng cách giữa điều bạn đã biết đủ để bắt đầu và việc thực sự đưa lựa chọn đó thành hành động hoặc điều chỉnh đúng lúc.','Nếu pattern này tiếp tục, những cơ hội phụ thuộc vào thời điểm có thể đi qua trước khi một lựa chọn được chốt hoặc điều chỉnh.','Đồng thời, bạn vẫn cho thấy khả năng bắt đầu khi bằng chứng đã đủ và điều chỉnh khi thực tế thay đổi.'],
    F:['Điều đang nổi bật hơn cả lúc này là một góc nhìn hoặc vai trò quen thuộc đang giữ quá nhiều trọng lượng, làm những giới hạn và dữ kiện khác khó được đặt ngang hàng.','Nếu pattern này tiếp tục, các quyết định có thể tiếp tục được hình thành từ một phần của bức tranh trong khi những giới hạn quan trọng khác chưa được đặt ngang hàng.','Đồng thời, bạn vẫn có khả năng đổi góc nhìn mà không hoàn toàn đánh mất trách nhiệm, giới hạn và dữ kiện.'],
    G:['Điều đang nổi bật hơn cả lúc này là việc kiểm tra và xem xét lại suy nghĩ đang giữ tình huống mở lâu hơn, ngay cả khi đã có đủ dữ kiện để hình thành một nhận định tạm thời.','Nếu pattern này tiếp tục, các quyết định có thể tiếp tục bị giữ mở đủ lâu để làm mất đi tính kịp thời của chúng.','Đồng thời, bạn vẫn có khả năng xem suy nghĩ như một giả thuyết và tin vào nhận định khi bằng chứng đã đủ.'],
    H:['Điều đang nổi bật hơn cả lúc này là khoảng cách giữa điều bạn coi trọng và cách thời gian, năng lượng hoặc lựa chọn gần đây đang thực sự được phân bổ.','Nếu pattern này tiếp tục, nguồn lực có thể tiếp tục đi theo một hướng khác với điều bạn đang muốn ưu tiên trong thực tế.','Đồng thời, bạn vẫn cho thấy khả năng giữ điều cốt lõi quan trọng với mình trong khi linh hoạt cách sống nó.']
  },
  en:{
    A:['What stands out most right now is a tendency to delay, tolerate, or soften contact with discomfort even when the situation is already asking for a clearer response.','If this pattern continues, matters that need timely handling may keep being deferred until the practical range of options becomes narrower.','At the same time, you still show some capacity to stay with discomfort without completely losing sight of reality.'],
    B:['What stands out most right now is a tendency to give more room to your own standards or to other people than to the practical effect the situation is having on you.','If this pattern continues, the effect on you may keep being placed behind the need to keep things understandable or acceptable.','At the same time, you still show some capacity to remain kind without completely losing accountability and boundaries.'],
    C:['What stands out most right now is attention moving away from present evidence, allowing the past, prediction, or immediate urgency to carry more weight than it needs to.','If this pattern continues, choices that need to rest on current evidence may keep being delayed or distorted by information that no longer carries the same weight.','At the same time, you still show some capacity to distinguish present evidence from the past or from prediction.'],
    D:['What stands out most right now is the gap between already knowing enough to begin and actually turning that choice into action or adjusting it in time.','If this pattern continues, time-sensitive opportunities may pass before a choice is settled or adjusted.','At the same time, you still show some capacity to begin when the evidence is sufficient and adjust when reality changes.'],
    F:['What stands out most right now is a familiar viewpoint or role carrying too much weight, making other limits and evidence harder to hold alongside it.','If this pattern continues, decisions may keep being formed from only part of the picture while other important limits remain underweighted.','At the same time, you still show some capacity to shift perspective without completely losing responsibility, limits, and evidence.'],
    G:['What stands out most right now is repeated checking of your thinking keeping the situation open longer even when there is already enough evidence for a provisional judgement.','If this pattern continues, decisions may remain open long enough to lose some of their timeliness.','At the same time, you still show some capacity to treat thoughts as hypotheses and trust a judgement when the evidence is sufficient.'],
    H:['What stands out most right now is a gap between what matters to you and how time, energy, or recent choices are actually being allocated.','If this pattern continues, resources may keep moving in a different direction from what you are trying to prioritise in practice.','At the same time, you still show some capacity to keep hold of what matters while adapting how you live it in practice.']
  }
};
const banned=[/bạn nên/iu,/bạn cần phải/iu,/hãy thử/iu,/nguyên nhân là/iu,/bắt nguồn từ/iu,/you should/iu,/you need to/iu,/the reason is/iu,/this comes from/iu];

function parsedBody(req){try{return typeof req.body==='string'?JSON.parse(req.body):req.body||{}}catch{return {}}}
function evidence(body){
  const responses=body.responses||{};
  const scores={};
  for(const f of ELIGIBLE){const a=Array.isArray(responses[f])?responses[f]:[];scores[f]={shadow:a.filter(id=>new RegExp(`^${f}[1-8]$`).test(String(id))).length,adaptive:a.includes(`${f}9`)};}
  const ranked=ELIGIBLE.map(f=>({f,n:scores[f].shadow})).sort((a,b)=>b.n-a.n);
  const top=ranked[0]?.n||0;
  const candidates=top>0?ranked.filter(x=>x.n>=Math.max(1,top-1)).map(x=>x.f):[];
  return {scores,ranked,top,candidates};
}
function captureRes(){
  const out={statusCode:200,body:null,headers:{}};
  return {out,res:{status(c){out.statusCode=c;return this},json(v){out.body=v;return this},send(v){out.body=v;return this},end(v){out.body=v;return this},setHeader(k,v){out.headers[String(k).toLowerCase()]=v},getHeader(k){return out.headers[String(k).toLowerCase()]}}};
}
async function oldAnalyse(req){const c=captureRes();await app(req,c.res);return c.out;}
async function gatewayToken(){if(process.env.AI_GATEWAY_API_KEY)return process.env.AI_GATEWAY_API_KEY;try{return await getVercelOidcToken()}catch{}return process.env.VERCEL_OIDC_TOKEN||null;}
function safeText(x,max=700){return typeof x==='string'&&x.trim()&&x.length<=max&&!/[<>\r\n]/.test(x)&&!banned.some(r=>r.test(x));}
async function resolvePrimary(body,e,level){
  if(e.candidates.length===1){const f=e.candidates[0],lang=body.language==='en'?'en':'vi',copy=FALLBACK[lang][f];return {family:f,statement:copy[0],future_consequence:copy[1],confidence:e.top>=3?'high':e.top>=2?'moderate':'limited'};}
  const token=await gatewayToken();if(!token)throw new Error('resolver_auth_unavailable');
  const schema={name:'primary_pattern_resolution',schema:{type:'object',additionalProperties:false,properties:{family:{type:'string',enum:ELIGIBLE},statement:{type:'string'},future_consequence:{type:'string'},confidence:{type:'string',enum:['high','moderate','limited']}},required:['family','statement','future_consequence','confidence']}};
  const candidateDetail=Object.fromEntries(e.candidates.map(f=>[f,{shadow_count:e.scores[f].shadow,adaptive_present:e.scores[f].adaptive,meaning:FAMILY_MEANING[f]}]));
  const lang=body.language==='en'?'UK English':'natural Vietnamese';
  const prompt=`Resolve exactly ONE primary current pattern from the candidate families. Shadow evidence and adaptive capacity are independent: adaptive capacity NEVER cancels, subtracts, or disqualifies a shadow pattern. A high-functioning person can still have a real shadow pattern that is well managed. Use the client's current situation and the relative evidence to decide which candidate best explains what is active now. Do not infer childhood, trauma, motives, hidden causes, or another person's inner state. Do not give advice or solutions. The statement must name only the current pattern in warm everyday ${lang}. The future_consequence must be one broad conditional downstream consequence if that pattern continues. Return JSON only.`;
  const user=`CANDIDATES: ${JSON.stringify(candidateDetail)}\nMAIN_AREA: ${String(body.intake?.main_area||'').slice(0,300)}\nCURRENT_SITUATION: ${String(body.intake?.current_situation||'').slice(0,1600)}\nCLARITY_NEED: ${String(body.intake?.clarity_need||'').slice(0,300)}\nOTHER_CLARITY_NEED: ${String(body.intake?.other_clarity_need||'').slice(0,600)}\nOTHER_TEXT: ${JSON.stringify(body.other_text||{})}\nIMPACT_LEVEL: ${level}`;
  const models=['inclusionai/ling-3.0-flash','openai/gpt-5.6-sol'];
  let last;
  for(const model of models){
    try{
      const r=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{method:'POST',signal:AbortSignal.timeout(9000),headers:{'content-type':'application/json','authorization':`Bearer ${token}`},body:JSON.stringify({model,messages:[{role:'system',content:prompt},{role:'user',content:user}],temperature:0.1,max_tokens:500,response_format:{type:'json_schema',json_schema:schema}})});
      if(!r.ok)throw new Error(`resolver_${model}_${r.status}`);
      const data=await r.json();const obj=JSON.parse(data.choices?.[0]?.message?.content||'{}');
      if(!e.candidates.includes(obj.family)||!safeText(obj.statement)||!safeText(obj.future_consequence)||!['high','moderate','limited'].includes(obj.confidence))throw new Error('resolver_validation_failed');
      return obj;
    }catch(err){last=err;}
  }
  throw last||new Error('resolver_failed');
}
function versioned(res){const set=res.setHeader.bind(res);res.setHeader=(k,v)=>set(k,String(k).toLowerCase()==='x-qc-version'?VERSION:v);}

export default async function handler(req,res){
  versioned(res);
  const op=String(req.query?.op||'');
  if(op!=='analyse')return app(req,res);
  try{
    const body=parsedBody(req);const e=evidence(body);
    const prior=await oldAnalyse(req);
    if(prior.statusCode!==200||!prior.body)return res.status(prior.statusCode||500).json(prior.body||{error:'analysis_unavailable'});
    if(prior.body.status==='dominant_pattern'||e.top===0)return res.status(200).json(prior.body);
    const level=prior.body.impact?.level||'light';
    const picked=await resolvePrimary(body,e,level);
    const adaptive=e.scores[picked.family]?.adaptive;
    const lang=body.language==='en'?'en':'vi';
    const adaptiveText=FALLBACK[lang][picked.family][2];
    return res.status(200).json({status:'dominant_pattern',primary_pattern:{family:picked.family,statement:picked.statement},impact:{level},adaptive_capacity:adaptive?{show:true,statement:adaptiveText}:{show:false,statement:null},future_consequence:{statement:picked.future_consequence},confidence:picked.confidence});
  }catch(err){console.error('v8311_pattern_resolution_error',String(err?.message||err));return res.status(503).json({error:'analysis_unavailable'});}
}
