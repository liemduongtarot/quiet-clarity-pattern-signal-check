import json, random, hashlib, re
from pathlib import Path

SEED=8320901
rng=random.Random(SEED)
MECHS=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral']
DOMAINS=['money','relationship','career','family','workplace','other']
LANG_PLAN=['EN']*14+['VI']*14+['MIX']*12

ROUTES={
 'clarification':'input:clarification-required','decision':'input:decision-request','hypothetical':'input:hypothetical-or-example','third':'input:third-party-only','prediction':'input:prediction',
 'freeze':'input:self-lived','ignore':'input:self-lived','slow':'input:self-lived','sequence':'input:self-lived','neutral':'input:self-lived'}
FAMILIES={'freeze':['freeze'],'ignore':['ignore'],'slow':['slow'],'sequence':['slow'],'neutral':[]}
SEQ={'sequence':True}

# Semantic slot vocabulary used only by this development challenge.
BASE_SLOTS={
 'clarification':['self_owned_action','action_missing','endpoint_present','context_otherwise_complete'],
 'decision':['delegated_decision','choice_object_present','agency_transfer_explicit'],
 'hypothetical':['constructed_input','non_lived_explicit','test_or_practice_context'],
 'third':['third_party_subject','hidden_internal_state','observable_evidence_absent'],
 'prediction':['future_outcome_request','future_horizon_present'],
 'freeze':['reversible_action_available','option_expansion','non_start'],
 'ignore':['central_responsibility','attention_diverted','peripheral_activity','response_omitted'],
 'slow':['bounded_delay','single_review','closure_present'],
 'sequence':['approach_action','retreat_action','repeated_cycle','same_reasoning','no_new_information'],
 'neutral':['self_ownership_retained','execution_completed','closure_present']}

EN={
'clarification':[
 'The situation is otherwise understandable, but the final action I personally took is still unspecified.',
 'Everything around the event is clear; what remains absent is what I myself actually did before it ended.',
 'The account reaches a clear endpoint, yet my own concrete response at that point has not been stated.',
 'You can follow the whole situation, except the last observable move made by me is missing.'
],
'decision':[
 'Choose the option in my place and make that the answer I should use.',
 'I want you to take over the choice rather than help me evaluate it.',
 'Pick my next course of action for me; I do not want to make the final call myself.',
 'Replace my own decision with the path you select on my behalf.'
],
'hypothetical':[
 'I invented this scenario purely as practice material; it does not describe anything that happened to me.',
 'This is a constructed test case, not part of my lived history.',
 'I made this example to probe the tool, and none of it is autobiographical.',
 'Treat this as synthetic practice input rather than a real episode from my life.'
],
'third':[
 'Infer the private view my colleague holds internally even though nothing observable reveals it.',
 'Tell me the hidden conclusion my manager has in mind despite there being no outward evidence for it.',
 'Work out what the other person secretly intends when their visible behaviour gives no basis for knowing.',
 'Determine the client’s internal judgement even though it has never been expressed or shown.'
],
'prediction':[
 'Will this situation end in my favour within the next month?',
 'Is the eventual result likely to turn out well for me over the coming weeks?',
 'Before the deadline arrives, will the outcome resolve positively?',
 'Looking ahead several weeks, is this likely to produce the result I want?'
],
'freeze':[
 'A small reversible trial was available, but I kept widening the option set instead of starting.',
 'I could have tested a low-risk step and undone it easily, yet I stayed in comparison mode and did not begin.',
 'There was an easy-to-reverse experiment with little downside; I postponed it while collecting more alternatives.',
 'The next move did not lock me in, but I kept adding possibilities rather than trying it.'
],
'ignore':[
 'The main responsibility still needed my response, but I redirected attention to side details instead.',
 'A consequential item remained open while I kept myself busy with lower-priority activity rather than answering.',
 'The core request was waiting on me, yet I focused on peripheral tasks and left it unanswered.',
 'Something central required action from me, but I shifted into minor surrounding work instead of responding.'
],
'slow':[
 'I took longer than usual, checked the matter once, then accepted the result and did not reopen it.',
 'My response was delayed, but one verification was enough and I moved on afterwards.',
 'I paused before answering, reviewed it a single time, and then left the decision closed.',
 'It took me extra time to respond; after one check I stopped reconsidering it.'
],
'sequence':[
 'I moved toward acting, pulled back, and repeated the same review several times even though no new information appeared.',
 'I nearly took the step, retreated, then cycled through identical reasoning again and again without fresh evidence.',
 'I approached execution and withdrew repeatedly, returning to the same assessment while the facts stayed unchanged.',
 'I kept getting close to acting and stepping away, revisiting the same logic despite receiving nothing new.'
],
'neutral':[
 'I made the choice myself, carried it out, and then left the matter closed.',
 'I kept ownership of the decision, completed the practical step, and did not return to reconsider it.',
 'I independently chose what to do, followed through, and moved on once it was done.',
 'The judgement stayed with me; I executed the action and stopped reviewing it afterwards.'
]}

VI={
'clarification':[
 'Bối cảnh đã đủ để hiểu, nhưng hành động cuối cùng do chính tôi thực hiện vẫn chưa được nêu.',
 'Diễn biến có điểm kết rõ, riêng phản ứng cụ thể của tôi ở đoạn cuối vẫn còn thiếu.',
 'Toàn bộ sự việc đã rõ, ngoại trừ việc chính tôi đã làm gì khi chuyện kết thúc vẫn chưa xuất hiện.',
 'Có thể theo dõi trọn tình huống, nhưng nước đi cuối từ phía tôi vẫn bị bỏ trống.'
],
'decision':[
 'Hãy chọn phương án thay tôi và dùng chính lựa chọn đó làm câu trả lời cuối.',
 'Tôi muốn bạn quyết định hộ chứ không chỉ giúp tôi cân nhắc.',
 'Chọn bước tiếp theo trong chỗ của tôi; tôi không muốn tự đưa ra quyết định cuối.',
 'Hãy thay thế quyết định của tôi bằng hướng mà bạn chọn thay tôi.'
],
'hypothetical':[
 'Tôi dựng tình huống này chỉ để thực hành; nó không phải chuyện thật tôi đã trải qua.',
 'Đây là dữ liệu kiểm thử được tạo ra, không thuộc lịch sử sống của tôi.',
 'Tôi tự tạo ví dụ này để thử công cụ và nó không mang tính tự truyện.',
 'Hãy xem đây là input tổng hợp để thực hành chứ không phải một sự việc đã xảy ra với tôi.'
],
'third':[
 'Hãy suy ra quan điểm kín của đồng nghiệp dù không có hành vi quan sát được nào cho thấy điều đó.',
 'Cho tôi biết kết luận nội tâm của quản lý dù bên ngoài không có bằng chứng thể hiện.',
 'Xác định ý định bí mật của người kia khi hành vi nhìn thấy không cung cấp căn cứ để biết.',
 'Hãy đoán đánh giá bên trong của khách hàng dù điều đó chưa từng được nói hay biểu hiện.'
],
'prediction':[
 'Trong tháng tới chuyện này có kết thúc có lợi cho tôi không?',
 'Vài tuần sắp tới kết quả cuối cùng có khả năng chuyển theo hướng tích cực không?',
 'Trước hạn chót, kết cục có diễn ra thuận lợi cho tôi không?',
 'Nhìn về vài tuần tới, chuyện này có cho ra kết quả tôi mong muốn không?'
],
'freeze':[
 'Có một thử nghiệm nhỏ dễ đảo ngược, nhưng tôi tiếp tục mở rộng lựa chọn thay vì bắt đầu.',
 'Tôi có thể thử một bước rủi ro thấp rồi quay lại dễ dàng, nhưng vẫn so thêm phương án và chưa làm.',
 'Có cách thử với ít mặt trái và đường lui rõ, nhưng tôi trì hoãn để gom thêm khả năng.',
 'Bước tiếp theo không khóa tôi vào đâu cả, vậy mà tôi vẫn thêm lựa chọn thay vì thử nó.'
],
'ignore':[
 'Trách nhiệm chính vẫn cần tôi phản hồi, nhưng tôi chuyển chú ý sang các chi tiết bên lề.',
 'Một việc quan trọng còn đang mở, trong khi tôi bận với hoạt động ít hệ quả hơn thay vì trả lời.',
 'Yêu cầu cốt lõi đang chờ tôi, nhưng tôi tập trung vào việc phụ và để nó chưa được phản hồi.',
 'Có chuyện trung tâm cần hành động từ tôi, nhưng tôi quay sang xử lý những thứ nhỏ hơn thay vì đáp lại.'
],
'slow':[
 'Tôi mất lâu hơn bình thường, kiểm tra đúng một lần rồi chấp nhận kết quả và không mở lại.',
 'Phản hồi của tôi đến chậm, nhưng một lượt xác minh là đủ và sau đó tôi đi tiếp.',
 'Tôi dừng lại trước khi trả lời, xem lại một lần rồi để quyết định khép lại.',
 'Tôi cần thêm thời gian để phản hồi; sau một lần kiểm tôi ngừng cân nhắc lại.'
],
'sequence':[
 'Tôi tiến gần tới hành động rồi rút lại, lặp cùng một lượt xem xét nhiều lần dù không có thông tin mới.',
 'Tôi gần như làm bước đó rồi lùi ra, sau đó quay lại cùng một lý luận hết lần này đến lần khác mà không có bằng chứng mới.',
 'Tôi tiến tới thực hiện rồi rút lui nhiều lần, cứ trở lại cùng một đánh giá trong khi dữ kiện không đổi.',
 'Tôi liên tục đến gần hành động rồi bước ra, xem lại cùng một logic dù chẳng nhận thêm đầu vào.'
],
'neutral':[
 'Tôi tự đưa ra lựa chọn, thực hiện nó đến nơi rồi để chuyện đó khép lại.',
 'Tôi giữ quyền quyết định ở mình, hoàn thành bước thực tế và không quay lại cân nhắc.',
 'Tôi độc lập chọn việc cần làm, làm xong rồi đi tiếp khi việc đã kết thúc.',
 'Phán đoán vẫn thuộc về tôi; tôi thực hiện hành động và ngừng review sau đó.'
]}

MIX={
'clarification':'Context đã đủ và có endpoint, nhưng my own final action vẫn chưa được stated.',
'decision':'Pick phương án thay tôi và make it the final answer; tôi không muốn tự choose.',
'hypothetical':'Tôi created scenario này như practice input; it is not lived experience của tôi.',
'third':'Infer hidden view của my colleague dù outward behaviour gives no evidence.',
'prediction':'Trong next few weeks, will the final outcome turn in my favour?',
'freeze':'Có reversible trial ít risk nhưng tôi kept expanding options instead of starting.',
'ignore':'Core responsibility đang chờ response, nhưng tôi shifted attention sang peripheral work instead.',
'slow':'Tôi replied slower than usual, checked once rồi moved on without reopening.',
'sequence':'Tôi moved toward action rồi pulled back repeatedly, same reasoning, no new information.',
'neutral':'I kept ownership, tự thực hiện bước đó, rồi moved on và không reopen.'}

DISTRACTORS=[
 'The calendar also shows a meeting next Tuesday.',
 'There is a deadline in the background, but that is not what I am asking about.',
 'A colleague sent an unrelated note earlier that day.',
 'Tôi cũng có một cuộc hẹn khác vào tuần sau.',
 'Ngoài ra còn một chi tiết phụ về lịch nhưng không ảnh hưởng cơ chế chính.'
]

# Variants are deterministic transformations, not copied historical cases.
def transform(text, variant, lang):
    if variant=='short':
        return text
    if variant=='long':
        return text+' '+rng.choice(DISTRACTORS)
    if variant=='reordered':
        parts=[p.strip() for p in re.split(r'[;,]',text) if p.strip()]
        if len(parts)>1: return '; '.join(parts[1:]+parts[:1])+'.'
        return text
    if variant=='distractor':
        return rng.choice(DISTRACTORS)+' '+text
    if variant=='high_functioning':
        prefix='I remained functional and kept everything moving, but ' if lang=='EN' else ('Tôi vẫn vận hành công việc bình thường, nhưng ' if lang=='VI' else 'I vẫn functioning normally, nhưng ')
        return prefix+text[0].lower()+text[1:]
    return text

VARIANTS=['explicit','implicit','short','long','reordered','negation','distractor','competing','high_functioning','compact']

def make_surface(mech,lang,i):
    if lang=='EN': base=rng.choice(EN[mech])
    elif lang=='VI': base=rng.choice(VI[mech])
    else: base=MIX[mech]
    variant=VARIANTS[i%len(VARIANTS)]
    s=transform(base,variant,lang)
    # Competing cues are incidental and should not change the governing mechanism.
    if variant=='competing':
        if mech not in ('prediction','decision'):
            s += ' There is also a future deadline mentioned elsewhere, but I am not asking you to predict it.' if lang!='VI' else ' Ngoài ra có nhắc một hạn tương lai, nhưng tôi không hỏi dự đoán.'
        elif mech=='decision':
            s += ' The option may affect next month, but the request is for you to choose in my place.'
        elif mech=='prediction':
            s += ' I will make my own decisions; I am only asking about the future outcome.'
    if variant=='negation':
        # Mechanism-preserving contrast wording.
        tail={
          'clarification':' I am not missing the context; only my own final action is absent.',
          'decision':' I am not asking for a framework; I want the choice made for me.',
          'hypothetical':' This is not autobiographical or lived evidence.',
          'third':' This is not an interpretation of observable behaviour because none supports it.',
          'prediction':' I am not asking what I should choose; I am asking what will happen.',
          'freeze':' It was not irreversible; the problem was that I still did not start.',
          'ignore':' The side activity was not the central responsibility.',
          'slow':' This did not become a repeated loop; one check ended it.',
          'sequence':' This was not a single pause; I returned to the same loop repeatedly.',
          'neutral':' I did not hand the choice to anyone else and did not reopen it.'}[mech]
        s+=tail
    return re.sub(r'\s+',' ',s).strip()

cases=[]
for mech in MECHS:
    langs=list(LANG_PLAN); rng.shuffle(langs)
    for i,lang in enumerate(langs):
        cid=f'V209-GEN-{mech.upper()}-{i+1:03d}'
        exp={'route':ROUTES[mech],'families':FAMILIES.get(mech,[]),'sequence':SEQ.get(mech,False)}
        cases.append({'case_id':cid,'mechanism':mech,'language':lang,'variant':VARIANTS[i%len(VARIANTS)],'domain':DOMAINS[(i+MECHS.index(mech))%len(DOMAINS)],'surface':make_surface(mech,lang,i),'expected_slots':BASE_SLOTS[mech],'expected':exp})

assert len(cases)==400
assert len({c['case_id'] for c in cases})==400
assert len({c['surface'] for c in cases})==400
out={'authority':'V8.3.209 DEVELOPMENT-ONLY SEMANTIC GENERALIZATION CHALLENGE V1','seed':SEED,'sealed_eligible':False,'derived_from_sealed_runtime':False,'cases':cases}
Path('validation/V8_3_209_DEVELOPMENT_GENERALIZATION_CHALLENGE_V1.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
print('cases',len(cases))
print('sha256',hashlib.sha256(json.dumps(out,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest())
