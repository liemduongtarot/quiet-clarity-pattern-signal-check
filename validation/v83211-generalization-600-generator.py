import json,random,hashlib,re
from pathlib import Path
SEED=8321101
rng=random.Random(SEED)
MECHS=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral']
DOMAINS=['money','relationship','career','family','workplace','other']
ROUTES={'clarification':'input:clarification-required','decision':'input:decision-request','hypothetical':'input:hypothetical-or-example','third':'input:third-party-only','prediction':'input:prediction','freeze':'input:self-lived','ignore':'input:self-lived','slow':'input:self-lived','sequence':'input:self-lived','neutral':'input:self-lived'}
FAMILIES={'freeze':['freeze'],'ignore':['ignore'],'slow':['slow'],'sequence':['slow'],'neutral':[]}
SLOTS={'clarification':['self_owned_action','action_missing','endpoint_present'],'decision':['delegated_decision','agency_transfer_explicit'],'hypothetical':['constructed_input','non_lived_explicit'],'third':['third_party_subject','hidden_internal_state','observable_evidence_absent'],'prediction':['future_outcome_request','future_horizon_present'],'freeze':['reversible_action_available','option_expansion','non_start'],'ignore':['central_responsibility','attention_diverted','response_omitted'],'slow':['bounded_delay','single_review','closure_present'],'sequence':['approach_action','retreat_action','repeated_cycle','no_new_information'],'neutral':['self_ownership_retained','execution_completed','closure_present']}
EN={
'clarification':['All external facts are accounted for, yet the response attributable to me at the closing point is omitted.','The episode can be reconstructed except for what I myself did when it ended.','Everything around the event is known; my own final move is the only unstated part.','The chronology reaches its endpoint but leaves out the action that came from me.'],
'decision':['Take the final choice out of my hands and select the next action for me.','Make the decision on my behalf instead of helping me compare options.','Choose my course for me; I do not want to retain the final call.','Replace my decision with yours and tell me which path to use.'],
'hypothetical':['I wrote this scenario solely to test the classifier; it is not part of my lived history.','This is fabricated validation prose, not an event that occurred to me.','The example is synthetic practice material and should not be read as autobiographical.','I created this case for testing rather than to describe my life.'],
'third':['Infer my manager’s concealed judgement although nothing observable supports it.','Tell me the private conclusion my colleague holds without any outward evidence.','Work out what the other person secretly thinks when their words and actions give no basis.','Determine the client’s unspoken intention despite no observable sign.'],
'prediction':['Over the next few weeks, will the final result favour me?','By next month, is this going to end in the outcome I want?','Before the deadline, will this resolve positively for me?','In the near future, does the eventual outcome go my way?'],
'freeze':['A reversible low-risk step was available, but I kept expanding options instead of starting.','I could undo the trial easily, yet I continued comparing alternatives and never began.','The first move would not lock me in; I researched more possibilities rather than trying it.','There was a clear way back, but I broadened the option set and left the step untouched.'],
'ignore':['A central item needed my answer, but I occupied myself with minor tasks and did not respond.','The main responsibility stayed open while I shifted attention to peripheral work.','A consequential request required action from me, yet I diverted effort into lower-priority details.','The core matter still needed a response; I turned to side work instead.'],
'slow':['I answered later than usual, checked one point, then closed the matter without returning.','My response was delayed; one verification was enough and I moved on.','I paused longer than normal, reviewed it once, and did not reopen it.','I replied slowly, made a single check, then treated the issue as finished.'],
'sequence':['I moved toward execution, pulled back, and returned to the same judgement while the facts stayed unchanged.','I nearly acted, retreated, then repeated the same review with no new evidence.','I approached the step and withdrew more than once, revisiting identical reasoning without fresh input.','I kept getting close to action and backing away, cycling through the same assessment despite nothing new.'],
'neutral':['I kept the decision with myself, completed the action, and then left the matter closed.','The judgement remained mine; I followed through and did not revisit it.','I made my own choice, executed it, and moved on after completion.','I retained ownership, finished the practical step, and stopped reconsidering it.']}
VI={
'clarification':['Mọi dữ kiện bên ngoài đã đủ, nhưng phản ứng xuất phát từ chính tôi ở điểm kết vẫn bị bỏ thiếu.','Có thể dựng lại toàn bộ sự việc ngoại trừ việc chính tôi đã làm gì khi nó kết thúc.','Bối cảnh xung quanh đều rõ; chỉ nước đi cuối của tôi chưa được nêu.','Diễn biến tới điểm kết nhưng bỏ mất hành động đến từ phía tôi.'],
'decision':['Hãy lấy quyền lựa chọn cuối khỏi tôi và chọn hành động tiếp theo thay tôi.','Quyết định thay tôi thay vì chỉ giúp tôi so các phương án.','Chọn hướng đi cho tôi; tôi không muốn giữ phần chốt cuối.','Dùng quyết định của bạn thay cho quyết định của tôi và nói tôi nên theo đường nào.'],
'hypothetical':['Tôi viết scenario này chỉ để test classifier; nó không thuộc lịch sử sống của tôi.','Đây là đoạn validation bịa ra, không phải sự việc từng xảy ra với tôi.','Ví dụ này là dữ liệu thực hành tổng hợp và không nên hiểu là tự truyện.','Tôi tạo case này để kiểm thử chứ không mô tả đời sống của mình.'],
'third':['Suy ra đánh giá kín của quản lý dù không có gì quan sát được làm căn cứ.','Cho tôi biết kết luận riêng của đồng nghiệp khi bên ngoài không có bằng chứng.','Xác định người kia đang nghĩ thầm gì dù lời nói và hành động không cho căn cứ.','Hãy đoán ý định chưa nói của khách hàng dù không có dấu hiệu quan sát được.'],
'prediction':['Trong vài tuần tới kết quả cuối cùng có nghiêng về phía có lợi cho tôi không?','Tới tháng sau chuyện này có kết thúc đúng kết quả tôi muốn không?','Trước hạn chót, chuyện này có giải quyết theo hướng tích cực cho tôi không?','Trong tương lai gần kết cục cuối có đi theo hướng tôi mong không?'],
'freeze':['Có một bước rủi ro thấp dễ quay lại, nhưng tôi cứ mở rộng lựa chọn thay vì bắt đầu.','Tôi có thể hoàn tác thử nghiệm dễ dàng, vậy mà vẫn so thêm phương án và chưa làm.','Bước đầu không khóa tôi vào đâu; tôi nghiên cứu thêm khả năng thay vì thử nó.','Có đường lui rõ, nhưng tôi tăng lựa chọn rồi để nguyên bước đầu chưa động tới.'],
'ignore':['Một việc trung tâm cần câu trả lời của tôi, nhưng tôi làm mình bận với việc nhỏ và không phản hồi.','Trách nhiệm chính vẫn mở trong khi tôi chuyển chú ý sang công việc bên lề.','Một yêu cầu có hệ quả cần hành động từ tôi, vậy mà tôi dồn sức vào chi tiết ưu tiên thấp.','Việc cốt lõi vẫn cần phản hồi; tôi quay sang việc phụ thay vào đó.'],
'slow':['Tôi trả lời muộn hơn thường lệ, kiểm một điểm rồi khép chuyện và không quay lại.','Phản hồi của tôi đến chậm; một lần xác minh là đủ rồi tôi đi tiếp.','Tôi dừng lâu hơn bình thường, xem lại một lần rồi không mở lại nữa.','Tôi trả lời chậm, kiểm duy nhất một lượt rồi xem việc đã xong.'],
'sequence':['Tôi tiến tới thực hiện rồi rút lui, quay lại cùng một phán đoán trong khi dữ kiện giữ nguyên.','Tôi gần như hành động rồi lùi lại, sau đó lặp cùng lượt xem xét dù không có evidence mới.','Tôi tiến về bước làm rồi rút ra hơn một lần, xem lại cùng reasoning mà không có input mới.','Tôi cứ đến sát hành động rồi lùi, quay vòng cùng một đánh giá dù chẳng có gì mới.'],
'neutral':['Tôi giữ quyết định ở mình, hoàn thành hành động rồi để chuyện khép lại.','Phán đoán vẫn là của tôi; tôi làm tới nơi rồi không xem lại nữa.','Tôi tự chọn, thực hiện xong và đi tiếp sau khi hoàn tất.','Tôi giữ quyền chốt, làm xong bước thực tế rồi ngừng cân nhắc lại.']}
NEUTRAL_EN=['The background is routine administration and adds no behavioural signal.','A separate scheduling note exists but contributes no mechanism evidence.','The surrounding record is ordinary context and does not identify the response mechanism.']
NEUTRAL_VI=['Bối cảnh chỉ là hành chính thông thường và không thêm cue hành vi.','Có một ghi chú lịch riêng nhưng không bổ sung bằng chứng cơ chế.','Record xung quanh chỉ là context và không xác định response mechanism.']
VAR=['base','context_after','context_before','reordered','compact','morph','contrast','high_functioning','two_context','punctuation']
def vary(s,lang,v):
    n=(NEUTRAL_EN if lang=='EN' else NEUTRAL_VI)
    if v=='context_after': return s+' '+rng.choice(n)
    if v=='context_before': return rng.choice(n)+' '+s
    if v=='reordered':
        ps=[x.strip() for x in re.split(r'[,;]',s) if x.strip()]; return '; '.join(ps[1:]+ps[:1])+'.' if len(ps)>1 else s
    if v=='compact': return s.replace(' and ','; ').replace(' but ','; ')
    if v=='morph': return s.replace('respond','reply').replace('response','reply').replace('hành động','bước làm').replace('phản hồi','trả lời')
    if v=='contrast': return ('I stayed fully functional, yet '+s[0].lower()+s[1:]) if lang=='EN' else ('Tôi vẫn vận hành bình thường, nhưng '+s[0].lower()+s[1:])
    if v=='high_functioning': return ('I handled everything else normally. '+s) if lang=='EN' else ('Các phần khác tôi vẫn xử lý bình thường. '+s)
    if v=='two_context': return rng.choice(n)+' '+s+' '+rng.choice(n)
    if v=='punctuation': return s.replace(',',' —').replace(';',' —')
    return s
cases=[]
for mi,m in enumerate(MECHS):
    for i in range(60):
        lang='EN' if i<24 else ('VI' if i<48 else ('EN' if i%2==0 else 'VI'))
        base=rng.choice(EN[m] if lang=='EN' else VI[m])
        surface=vary(base,lang,VAR[i%len(VAR)])
        domain=DOMAINS[(mi*60+i)%6]
        cases.append({'case_id':f'V211-G{mi:02d}-{i:02d}','mechanism':m,'language':lang,'domain':domain,'variant':VAR[i%len(VAR)],'surface':surface,'expected':{'route':ROUTES[m],'families':FAMILIES.get(m,[]),'sequence':m=='sequence'},'expected_slots':SLOTS[m],'sealed_eligible':False})
# Natural uniqueness suffix only for actual duplicate surfaces.
seen={}
for i,c in enumerate(cases):
    s=c['surface']; n=seen.get(s,0); seen[s]=n+1
    if n:
        tail=(' Earlier that day, an unrelated calendar note was also present.' if c['language']=='EN' else ' Trước đó trong ngày cũng có một ghi chú lịch không liên quan.')
        c['surface']=s+tail+('' if n==1 else ' The same note remained irrelevant.' if c['language']=='EN' else ' Ghi chú đó vẫn không liên quan.')
assert len(cases)==600 and len({c['surface'] for c in cases})==600
obj={'authority':'V8.3.211 DEVELOPMENT-ONLY GENERALIZATION 600 V1','seed':SEED,'count':600,'mechanisms':{m:60 for m in MECHS},'sealed_eligible':False,'semantic_runtime_used_for_construction':False,'cases':cases}
raw=json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode();obj['sha256_without_self']=hashlib.sha256(raw).hexdigest()
Path('validation/V8_3_211_DEVELOPMENT_GENERALIZATION_600_V1.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
print('cases',len(cases),'sha',obj['sha256_without_self'])
