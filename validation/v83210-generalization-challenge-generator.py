import json,random,hashlib,re
from pathlib import Path

SEED=8321001
rng=random.Random(SEED)
MECHS=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral']
DOMAINS=['money','relationship','career','family','workplace','other']
ROUTES={
 'clarification':'input:clarification-required','decision':'input:decision-request','hypothetical':'input:hypothetical-or-example','third':'input:third-party-only','prediction':'input:prediction',
 'freeze':'input:self-lived','ignore':'input:self-lived','slow':'input:self-lived','sequence':'input:self-lived','neutral':'input:self-lived'}
FAMILIES={'freeze':['freeze'],'ignore':['ignore'],'slow':['slow'],'sequence':['slow'],'neutral':[]}
SEQ={'sequence':True}
SLOTS={
 'clarification':['self_owned_action','action_missing','endpoint_present'],
 'decision':['delegated_decision','agency_transfer_explicit'],
 'hypothetical':['constructed_input','non_lived_explicit'],
 'third':['third_party_subject','hidden_internal_state','observable_evidence_absent'],
 'prediction':['future_outcome_request','future_horizon_present'],
 'freeze':['reversible_action_available','option_expansion','non_start'],
 'ignore':['central_responsibility','attention_diverted','response_omitted'],
 'slow':['bounded_delay','single_review','closure_present'],
 'sequence':['approach_action','retreat_action','repeated_cycle','no_new_information'],
 'neutral':['self_ownership_retained','execution_completed','closure_present']}

EN={
'clarification':[
 'The surrounding facts are settled, but the action that came from me at the final point has never been supplied.',
 'The account gets all the way to closure without identifying what I personally did there.',
 'Nothing external is missing; the absent detail is my own concrete move when the episode finished.',
 'The sequence is understandable through the endpoint, yet my response at that endpoint is still unstated.',
 'We know what happened around me, but the record omits the behaviour I myself contributed at the end.'
],
'decision':[
 'Take the choice out of my hands and give me the option you want me to follow.',
 'Make this call on my behalf rather than helping me weigh the alternatives.',
 'I am asking you to substitute your decision for mine and name the route I should take.',
 'Do the selecting for me; I want your chosen course to become my answer.',
 'Please own the final choice here and tell me which path to adopt instead of leaving the decision with me.'
],
'hypothetical':[
 'I fabricated this example for a robustness check; it is not an event from my life.',
 'This scenario exists only as synthetic test material and should not be read as autobiographical.',
 'I constructed the episode to exercise the classifier, not to describe something I experienced.',
 'None of this happened to me; I wrote it solely as a practice case for the tool.',
 'Treat the text as an invented validation sample rather than a lived situation.'
],
'third':[
 'Tell me what private conclusion my supervisor holds even though their outward conduct gives me no evidence.',
 'Infer the customer’s unspoken internal judgement where nothing observable reveals it.',
 'Work out the intention the other person keeps to themselves despite there being no behavioural basis for knowing.',
 'I want their concealed opinion, not an interpretation of anything they have actually said or done.',
 'Determine what my colleague secretly thinks when the available record contains no outward sign of it.'
],
'prediction':[
 'By next month, will this resolve in the way I am hoping for?',
 'Over the coming few weeks, is the final outcome going to favour me?',
 'Will the result I want happen before the deadline passes?',
 'Looking ahead to the next several weeks, does this end positively for me?',
 'Within the near future, will this situation produce the outcome I am waiting for?'
],
'freeze':[
 'I had a low-cost step I could reverse, but I kept adding alternatives and never started it.',
 'Nothing about the trial would have locked me in, yet I stayed in research mode and postponed beginning.',
 'A reversible experiment was available; instead of testing it, I broadened the option list and remained unstarted.',
 'The move had a clear way back, but I kept comparing more possibilities rather than initiating it.',
 'I could undo the small trial easily, still I expanded choices and left the first step untouched.'
],
'ignore':[
 'The consequential request still required my answer, while I redirected myself into secondary work.',
 'A central responsibility was waiting on me, but I occupied my attention with peripheral details instead of replying.',
 'The main issue remained unanswered as I spent my effort on lower-priority tasks around it.',
 'Something materially important still needed action from me, yet I turned toward side activity and left it open.',
 'The core matter required a response, but I kept doing less important surrounding work rather than addressing it.'
],
'slow':[
 'I responded later than I normally do, verified one point, then closed the matter and did not return to it.',
 'My answer came after a delay; I checked it once and afterwards treated the issue as finished.',
 'I was slower to reply than usual, made one review, and then left the decision alone.',
 'It took extra time before I answered, but after a single verification I moved on without reopening it.',
 'I did not respond quickly; one check was enough, and once I replied I stopped revisiting the issue.'
],
'sequence':[
 'I prepared to act, withdrew, then came back through the same reasoning repeatedly even though no new facts arrived.',
 'I got close to execution, backed away, and cycled through the same assessment several times without fresh input.',
 'I moved toward the step and retreated more than once, re-running the same logic while the evidence stayed unchanged.',
 'I repeatedly approached action and pulled out, returning to the same review with nothing new to consider.',
 'I was nearly ready to do it, stepped back, and kept re-entering the same evaluation despite no additional information.'
],
'neutral':[
 'I kept the decision with myself, carried out the chosen action, and then regarded the matter as complete.',
 'The judgement remained mine; I followed through and did not reopen the issue after finishing.',
 'I made my own choice, executed it, and moved on once the action was complete.',
 'I retained ownership of the call, finished the practical step, and stopped considering it afterwards.',
 'I chose independently, completed what I chose, and left the matter closed rather than revisiting it.'
]}

VI={
'clarification':[
 'Các dữ kiện xung quanh đã đủ, nhưng hành động xuất phát từ chính tôi ở điểm kết vẫn chưa được nêu.',
 'Mô tả đi tới lúc chuyện khép lại mà không nói cụ thể tôi đã làm gì ở đó.',
 'Không thiếu thông tin bên ngoài; phần còn trống là nước đi thực tế của riêng tôi khi sự việc kết thúc.',
 'Diễn biến đã rõ tới hồi cuối, nhưng phản ứng của tôi tại hồi cuối ấy vẫn chưa xuất hiện.',
 'Ta biết chuyện quanh tôi diễn ra thế nào, riêng hành vi tôi trực tiếp thực hiện lúc chốt vẫn bị bỏ thiếu.'
],
'decision':[
 'Hãy lấy quyền lựa chọn khỏi tôi và đưa ra phương án bạn muốn tôi làm theo.',
 'Quyết định thay tôi chuyện này, đừng chỉ giúp tôi cân các lựa chọn.',
 'Tôi muốn quyết định của bạn thay cho quyết định của tôi và chỉ rõ hướng tôi phải theo.',
 'Bạn hãy chọn hộ; tôi muốn phương án bạn chốt trở thành câu trả lời của tôi.',
 'Hãy nắm phần quyết định cuối và nói tôi nên chọn đường nào thay vì để tôi tự chốt.'
],
'hypothetical':[
 'Tôi bịa ví dụ này để kiểm độ bền của hệ thống; đây không phải chuyện từng xảy ra với tôi.',
 'Tình huống này chỉ là dữ liệu test tổng hợp, không nên hiểu là tự truyện của tôi.',
 'Tôi dựng đoạn này để thử classifier chứ không mô tả trải nghiệm thật của mình.',
 'Không có phần nào ở đây xảy ra với tôi; tôi chỉ viết nó làm case thực hành cho công cụ.',
 'Hãy coi nội dung này là mẫu validation được tạo ra, không phải tình huống tôi đã sống qua.'
],
'third':[
 'Cho tôi biết kết luận kín mà quản lý đang giữ dù hành vi bên ngoài không cho tôi bằng chứng nào.',
 'Suy ra đánh giá nội tâm chưa nói của khách hàng trong khi chẳng có dấu hiệu quan sát được.',
 'Xác định ý định người kia giữ riêng dù không có căn cứ hành vi để biết.',
 'Tôi muốn biết quan điểm họ giấu bên trong, không phải diễn giải từ điều họ đã nói hay làm.',
 'Hãy nói đồng nghiệp thật sự nghĩ gì khi record hiện có không chứa biểu hiện bên ngoài nào.'
],
'prediction':[
 'Từ nay tới tháng sau chuyện này có kết thúc theo điều tôi mong không?',
 'Trong vài tuần tới kết quả cuối cùng có nghiêng về phía có lợi cho tôi không?',
 'Trước khi deadline tới, kết quả tôi muốn có xảy ra không?',
 'Nhìn sang vài tuần tiếp theo, chuyện này có kết thúc tích cực cho tôi không?',
 'Trong tương lai gần, tình huống này có cho ra kết quả tôi đang chờ không?'
],
'freeze':[
 'Tôi có một bước ít tốn kém và dễ quay lại, nhưng cứ thêm phương án rồi vẫn chưa bắt đầu.',
 'Thử nghiệm đó không khóa tôi vào đâu, vậy mà tôi tiếp tục nghiên cứu thêm và trì hoãn việc khởi động.',
 'Có một phép thử có thể đảo ngược; thay vì thử, tôi mở rộng danh sách lựa chọn và vẫn chưa làm.',
 'Bước đi có đường lui rõ, nhưng tôi cứ so thêm khả năng thay vì bắt tay vào.',
 'Tôi có thể hoàn tác thử nghiệm nhỏ rất dễ, nhưng vẫn tăng lựa chọn và bỏ nguyên bước đầu chưa động tới.'
],
'ignore':[
 'Yêu cầu có hệ quả vẫn cần tôi trả lời, trong khi tôi chuyển mình sang làm việc thứ yếu.',
 'Một trách nhiệm trung tâm đang chờ tôi, nhưng tôi dồn chú ý vào chi tiết phụ thay vì phản hồi.',
 'Vấn đề chính vẫn chưa được trả lời vì tôi dành sức cho những việc ưu tiên thấp hơn xung quanh nó.',
 'Có chuyện quan trọng thực sự cần hành động từ tôi, nhưng tôi quay sang việc bên lề và để nó mở.',
 'Việc cốt lõi cần phản hồi, còn tôi cứ làm những việc xung quanh ít quan trọng hơn thay vì xử lý nó.'
],
'slow':[
 'Tôi trả lời muộn hơn bình thường, xác minh một điểm rồi khép chuyện và không quay lại nữa.',
 'Câu trả lời của tôi đến sau một khoảng chậm; tôi kiểm một lần rồi xem việc đó đã xong.',
 'Tôi phản hồi chậm hơn thường lệ, review đúng một lượt rồi để quyết định yên.',
 'Tôi mất thêm thời gian mới trả lời, nhưng sau một lần xác minh thì đi tiếp và không mở lại.',
 'Tôi không phản hồi nhanh; một lần kiểm là đủ và sau khi trả lời tôi ngừng xem xét lại.'
],
'sequence':[
 'Tôi chuẩn bị hành động rồi rút lại, sau đó quay vào cùng một lý luận nhiều lần dù không có dữ kiện mới.',
 'Tôi tiến gần tới lúc thực hiện rồi lùi ra, lặp lại cùng đánh giá vài lần mà không nhận thêm input.',
 'Tôi tiến về bước làm rồi rút lui hơn một lần, chạy lại cùng logic trong khi evidence không đổi.',
 'Tôi nhiều lần đến sát hành động rồi thôi, cứ quay lại cùng lượt xem xét dù chẳng có gì mới.',
 'Tôi gần như sẵn sàng làm, bước lùi lại rồi liên tục trở vào cùng một đánh giá dù không có thêm thông tin.'
],
'neutral':[
 'Tôi giữ quyết định ở mình, thực hiện lựa chọn đó rồi xem việc đã hoàn tất.',
 'Phán đoán vẫn là của tôi; tôi làm tới nơi và không mở lại vấn đề sau khi xong.',
 'Tôi tự chọn, thực hiện xong rồi đi tiếp khi hành động đã hoàn thành.',
 'Tôi giữ quyền chốt, hoàn tất bước thực tế và sau đó ngừng cân nhắc.',
 'Tôi độc lập lựa chọn, làm xong điều đã chọn rồi để chuyện khép lại thay vì quay lại xem tiếp.'
]}

MIX={
'clarification':['Context ngoài đã complete, nhưng my own action tại endpoint vẫn missing.','Diễn biến đã rõ tới closure, yet what I personally did there chưa được stated.'],
'decision':['Take over quyết định này cho tôi; pick the path thay vì để tôi tự choose.','Tôi muốn you make the final call on my behalf và cho tôi option phải theo.'],
'hypothetical':['Tôi constructed case này chỉ để stress-test; it did not happen to me.','This is synthetic validation material, không phải lived episode của tôi.'],
'third':['Infer hidden judgement của manager dù outward record không có evidence.','Tôi muốn private intention của người kia dù observable behaviour gives no basis.'],
'prediction':['Trong next month, will the outcome resolve the way tôi muốn?','Looking ahead vài tuần, kết quả cuối có favour me không?'],
'freeze':['Có reversible step và clear way back, nhưng tôi kept expanding options mà chưa start.','Low-risk trial có thể undo, yet tôi comparison thêm và không begin.'],
'ignore':['Core request đang waiting on me, nhưng I shifted attention sang peripheral tasks.','Main responsibility cần response, yet tôi bận với lower-priority work instead.'],
'slow':['Tôi answered later than normal, checked one thing rồi closed it without reopening.','Response đến chậm; one verification thôi rồi tôi moved on.'],
'sequence':['Tôi moved toward action rồi retreated repeatedly, same reasoning và no new input.','Nearly acted, tôi pulled back nhiều lần và re-ran same logic dù evidence unchanged.'],
'neutral':['I kept ownership, tự execute lựa chọn rồi closed the matter.','Decision vẫn của tôi; I followed through rồi không reopen nữa.']}

DIST_EN=['An unrelated calendar item was also present, but it did not change the mechanism.','There was ordinary admin in the background that was not material to this question.','A separate message arrived that day, though it did not alter the evidence described.']
DIST_VI=['Ngoài ra có vài việc lịch bình thường nhưng không thay đổi cơ chế đang nói tới.','Có một tin nhắn phụ trong ngày nhưng nó không làm thay đổi evidence chính.','Một chi tiết admin khác cũng tồn tại nhưng không liên quan tới cơ chế này.']

def variant(base,lang,i):
    mode=i%8
    if mode==0:return base
    if mode==1:return (rng.choice(DIST_EN) if lang=='EN' else rng.choice(DIST_VI) if lang=='VI' else rng.choice(DIST_EN+DIST_VI))+' '+base
    if mode==2:return base+' '+(rng.choice(DIST_EN) if lang=='EN' else rng.choice(DIST_VI) if lang=='VI' else rng.choice(DIST_EN+DIST_VI))
    if mode==3:
        parts=[x.strip() for x in re.split(r'[;,]',base) if x.strip()]
        return '; '.join(parts[1:]+parts[:1])+'.' if len(parts)>1 else base
    if mode==4:
        p='I stayed functional in the rest of the day, but ' if lang=='EN' else ('Tôi vẫn xử lý các việc khác bình thường, nhưng ' if lang=='VI' else 'I vẫn functioning normally, nhưng ')
        return p+base[0].lower()+base[1:]
    if mode==5:return base+' The wording may sound calm, but the behavioural evidence above is the relevant part.' if lang=='EN' else base+' Câu chữ có thể nghe bình tĩnh, nhưng evidence hành vi ở trên mới là phần cần phân loại.'
    if mode==6:return base+' This is about the described mechanism, not a request to predict or diagnose me.' if lang=='EN' else base+' Đây là mô tả cơ chế vừa nêu, không phải yêu cầu dự đoán hay chẩn đoán tôi.'
    return base+' '+('No extra conclusion should be inferred beyond those facts.' if lang=='EN' else 'Không cần suy thêm kết luận nào ngoài các dữ kiện đó.')

cases=[]
langs=['EN']*16+['VI']*16+['MIX']*8
for mi,mech in enumerate(MECHS):
    for i,lang in enumerate(langs):
        if lang=='EN':base=EN[mech][i%len(EN[mech])]
        elif lang=='VI':base=VI[mech][i%len(VI[mech])]
        else:base=MIX[mech][i%len(MIX[mech])]
        surface=variant(base,lang,i+mi)
        domain=DOMAINS[(mi*40+i)%len(DOMAINS)]
        exp={'route':ROUTES[mech],'families':FAMILIES.get(mech,[]),'sequence':SEQ.get(mech,False)}
        cases.append({'case_id':f'V210-G{mi+1:02d}-{i+1:02d}','mechanism':mech,'language':lang,'domain':domain,'surface':surface,'expected':exp,'expected_slots':SLOTS[mech]})

# Natural uniqueness tail only when needed; never identifiers.
seen={}
TAILS_EN=['Earlier in the week this was the only relevant behaviour.','Later that day no additional evidence changed it.','In the surrounding context nothing else altered this pattern.','The rest of the situation remained ordinary.']
TAILS_VI=['Trước đó trong tuần không có hành vi nào khác liên quan hơn.','Sau đó trong ngày cũng không xuất hiện evidence mới làm thay đổi nó.','Bối cảnh xung quanh không có gì khác làm đổi cơ chế này.','Các phần còn lại của tình huống vẫn bình thường.']
for idx,c in enumerate(cases):
    n=seen.get(c['surface'],0)
    if n:
        tail=(TAILS_EN if c['language']=='EN' else TAILS_VI if c['language']=='VI' else TAILS_EN+TAILS_VI)[idx%(4 if c['language']!='MIX' else 8)]
        c['surface']=c['surface']+' '+tail
    seen[c['surface']]=n+1
assert len(cases)==400
assert len({c['surface'] for c in cases})==400
from collections import Counter
assert Counter(c['mechanism'] for c in cases)==Counter({m:40 for m in MECHS})
assert Counter(c['language'] for c in cases)==Counter({'EN':160,'VI':160,'MIX':80})
obj={'authority':'V8.3.210 DEVELOPMENT-ONLY FRESH GENERALIZATION CHALLENGE V1','candidate':'V8.3.210','seed':SEED,'sealed_eligible':False,'runtime_output_used':False,'semantic_authority_loaded_during_construction':False,'construction':'400 fresh cases; 40/mechanism; 160 EN + 160 VI + 80 MIX; six domains; not reusable as sealed cases','cases':cases}
canon=json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
obj['sha256_without_self']=hashlib.sha256(canon).hexdigest()
p=Path('validation/V8_3_210_DEVELOPMENT_GENERALIZATION_CHALLENGE_V1.json');p.write_text(json.dumps(obj,ensure_ascii=False,indent=2))
print('cases',len(cases),'sha256_without_self',obj['sha256_without_self'])
