import json, pathlib
DEV='0172ceb310c45a9666dcc2b66b989eace59f176f'
groups=[
('input:clarification-required',[],[
('I gave the whole story, yet there is still no concrete action I can point to as mine.','work','EN'),
('Tôi kể đầy đủ diễn biến nhưng chưa nói mình đã phản ứng bằng hành động nào.','family','VI'),
('The description mixes my conduct with theirs, so my own behaviour cannot be isolated.','romantic','EN'),
('Toi noi ve ket qua va cam xuc, nhung chua co own action cu the.','daily','MIXED_VI_EN'),
('There are many details about everyone else, but my observable step is still missing.','home','EN'),
('Hành động của tôi và của người kia đang bị lẫn nên chưa xác định được phần của tôi.','business','VI'),
('Chua co chi tiet nao cho thay toi da lam gi sau su viec do.','money','VI_NO_DIACRITICS'),
('My personal response is not attributable from this account because the actors are blended.','direction','EN')]),
('input:decision-request',[],[
('Make the choice for me; I want the decision removed from my responsibility.','direction','EN'),
('Hãy chọn thay tôi phương án phải làm tiếp theo.','business','VI'),
('I do not want a comparison; give me the command I should follow.','work','EN'),
('Quyet dum toi luon, toi khong muon tu chon.','money','VI_NO_DIACRITICS'),
('Replace my judgement with your answer and tell me what to do.','romantic','EN'),
('Bo tradeoff di va chon giup toi mot lua chon cu the.','family','MIXED_VI_EN'),
('Take over the decision and tell me which path I must take.','daily','EN')]),
('input:hypothetical-or-example',[],[
('Classify an imaginary employee in this example; the character is not me.','work','EN'),
('Giả định có một người bịa ra gặp tình huống này, không phải chuyện của tôi.','daily','VI'),
('Day la fictional scenario de test, khong lien quan den trai nghiem that cua toi.','direction','MIXED_VI_EN'),
('Use an invented couple for the exercise rather than my own relationship.','romantic','EN'),
('Tinh huong nay chi la role play, toi khong tham gia.','family','VI_NO_DIACRITICS'),
('Suppose a made-up person receives this message; evaluate the hypothetical only.','business','EN'),
('Đây là ví dụ tưởng tượng để minh hoạ chứ không phải điều tôi đã sống qua.','money','VI')]),
('input:third-party-only',[],[
('What is she secretly feeling about me beneath what she shows?','romantic','EN'),
('Anh ấy bên trong đang nghĩ gì về tôi mà chưa thể hiện ra?','family','VI'),
("Tell me my manager's private thoughts about me right now.",'work','EN'),
('Co ay co cam xuc kin nao ve toi ma toi khong quan sat duoc?','daily','VI_NO_DIACRITICS'),
('What hidden intention does that person currently hold toward me?','business','EN'),
('Private feeling của người kia về tôi lúc này là gì?','direction','MIXED_VI_EN'),
('Tôi muốn biết động cơ bí mật của họ đối với tôi hiện giờ.','home','VI'),
('What is my colleague thinking about me behind the behaviour I can see?','wellbeing','EN')]),
('input:prediction',[],[
('Will the result go my way before the next month is over?','money','EN'),
('Kết cục sắp tới có theo đúng điều tôi đang mong không?','direction','VI'),
('Chuyen nay sau cung co nghieng ve phia toi khong?','business','VI_NO_DIACRITICS'),
('Is the outcome likely to end the way I want?','romantic','EN'),
('Rồi chuyện này có kết thúc thuận theo mong muốn của tôi không?','family','VI'),
('Will the coming outcome be favourable to me?','work','EN'),
('Ket cuc gan toi co nhu toi ky vong khong?','daily','VI_NO_DIACRITICS'),
('Is this likely to resolve in my favour soon?','wellbeing','EN')]),
('input:self-lived',['freeze'],[
('I had a small reversible move available, but I kept weighing alternatives instead of beginning.','work','EN'),
('Tôi có một bước thử có thể quay lại nhưng vẫn mở thêm phương án nên chưa bắt đầu.','romantic','VI'),
('Co mot buoc nho co the undo, nhung toi cu tim them lua chon va chua lam.','family','VI_NO_DIACRITICS'),
('A low-risk pilot was ready, yet I delayed to preserve every option.','business','EN'),
('Tôi có thể thử rồi đổi lại, nhưng cứ cân nhắc thêm nên vẫn đứng yên.','direction','VI'),
('The first test was reversible; I postponed it while comparing more paths.','wellbeing','EN'),
('Có một test nhỏ đủ an toàn, nhưng tôi giữ option mở và chưa thử.','home','MIXED_VI_EN'),
('Buoc thu nho co the quay lai, nhung toi van so sanh them thay vi bat dau.','money','VI_NO_DIACRITICS')]),
('input:self-lived',['ignore'],[
('I diverted into minor admin to avoid addressing the main issue.','work','EN'),
('Tôi quay sang việc phụ để tránh xử lý việc chính.','business','VI'),
('Toi lam viec vun vat de ne nhiem vu quan trong hon.','money','VI_NO_DIACRITICS'),
('I focused on easy chores because I did not want to deal with the core task.','home','EN'),
('Tôi biết việc chính cần làm nhưng lại chọn việc nhỏ để né nó.','daily','VI')]),
('input:self-lived',['slow'],[
('I reviewed the same draft repeatedly even though nothing had changed.','business','EN'),
('Tôi xem lại cùng một nội dung nhiều lần dù không có thông tin mới.','work','VI'),
('Toi lap lai viec kiem tra cung mot thu ma khong co du lieu moi.','daily','VI_NO_DIACRITICS'),
('I kept checking the same conversation with no new message arriving.','romantic','EN')]),
('input:self-lived',[],[
('I chose a concrete step myself and completed it.','direction','EN'),
('Tôi đã thử một bước nhỏ rồi kết thúc, không tiếp tục mở thêm phương án.','money','VI'),
('Toi tu chon buoc tiep theo va da thuc hien no.','family','VI_NO_DIACRITICS'),
('I made my own decision and acted on it without handing the choice away.','work','EN'),
('Tôi xử lý thẳng việc chính bằng một hành động cụ thể của mình.','daily','VI')])]
cases=[]; gold_groups=[]
for route,fams,items in groups:
    ids=[]
    for surface,domain,language in items:
        cid=f'V180-S{len(cases)+1:03d}';ids.append(cid)
        cases.append({'case_id':cid,'surface':surface,'domain':domain,'language':language,'expected':{'route':route,'families':fams,'sequence':False}})
    gold_groups.append({'case_ids':ids,'expected':{'route':route,'families':fams,'sequence':False}})
a=[c['case_id'] for c in cases if int(c['case_id'].split('S')[1])%2==1];b=[c['case_id'] for c in cases if int(c['case_id'].split('S')[1])%2==0]
fixture={'authority':'V8.3.180 V1 SEALED EXECUTION FIXTURE','development_authority_commit':DEV,'cases':cases,'batch_a':a,'batch_b':b}
selection={'authority':'V8.3.180 V1 SEALED STRATIFIED SELECTION','method':'deterministic odd/even case-id split after independent case construction; 30/30; no runtime consultation','batch_a':a,'batch_b':b}
membership={'authority':'V8.3.180 V1 SEALED MEMBERSHIP','all_case_ids':sorted(a+b),'batch_a':a,'batch_b':b}
gold={'authority':'V8.3.180 V1 INDEPENDENT GOLD','source':'manual contract assignment by case groups during pre-seal construction; not derived from V49 runtime','groups':gold_groups}
out=pathlib.Path('validation/v83180-v1-sealed/generated');out.mkdir(parents=True,exist_ok=True)
for n,o in [('V8_3_180_SEALED_EXECUTION_FIXTURE_V1.json',fixture),('V8_3_180_SEALED_SELECTION_V1.json',selection),('V8_3_180_SEALED_MEMBERSHIP_V1.json',membership),('V8_3_180_INDEPENDENT_GOLD_V1.json',gold)]:
    (out/n).write_text(json.dumps(o,ensure_ascii=False,indent=2))
