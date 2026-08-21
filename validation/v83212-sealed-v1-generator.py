import json,hashlib,pathlib,re
from collections import Counter

SEED=8321217
ROOT=pathlib.Path('validation/v83212-v1-sealed'); ROOT.mkdir(parents=True,exist_ok=True)
REF=pathlib.Path('validation/v83212-preseal-refs')
MECHS=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral']
DOMAINS=['money','relationship','career','family','workplace','other']
ROUTES={'clarification':'input:clarification-required','decision':'input:decision-request','hypothetical':'input:hypothetical-or-example','third':'input:third-party-only','prediction':'input:prediction','freeze':'input:self-lived','ignore':'input:self-lived','slow':'input:self-lived','sequence':'input:self-lived','neutral':'input:self-lived'}
FAMS={'freeze':['freeze'],'ignore':['ignore'],'slow':['slow'],'sequence':['slow'],'neutral':[]}
EN={
'clarification':[
'I can account for everything around the episode, but the record never says what response I personally gave before it ended.',
'The chronology reaches its closing point; the missing fact is the concrete move that actually came from me.',
'Nothing else about the event needs filling in, yet my own observable contribution at closure is not recorded.',
'The surrounding facts are settled, while the final action attributable to me has been left unspecified.',
'The story can be reconstructed from start to finish except for what I myself did at the stopping point.',
'The external account is complete; only my behaviour at the end remains absent from the record.'],
'decision':[
'Do the choosing for me: pick which option I should take and let that choice stand in place of mine.',
'I am asking you to make the final call on my behalf, not simply help me compare the alternatives.',
'Select the course I should follow for me so your judgement replaces the decision I would otherwise make.',
'Take the choice out of my hands and tell me which route I should adopt as the answer.',
'Use your judgement to choose my next step rather than giving me a framework for deciding it myself.',
'I want your selected option to become my decision instead of keeping the final choice with me.'],
'hypothetical':[
'This paragraph is a made-up stress test for the system, not a description of anything I have lived through.',
'I constructed this example only for evaluation; it should not be treated as autobiographical history.',
'The scenario is fictional validation material and did not happen to me in real life.',
'I wrote these details to test classification rather than to report a genuine experience of mine.',
'Treat this as synthetic practice input, not as an event from my own life.',
'This is deliberately fabricated test prose and is unrelated to my lived history.'],
'third':[
'Tell me what my manager privately believes even though nothing observable in what they said or did provides a basis for it.',
'Infer my colleague’s hidden conclusion when their outward behaviour gives no evidence of that internal state.',
'I want to know the client’s unspoken intention despite having no visible action or statement that supports an inference.',
'Work out the other person’s private judgement where the available record contains no observable sign of it.',
'Determine what the customer secretly thinks even though their words and actions provide no external basis.',
'Tell me the supervisor’s concealed view without any behavioural evidence showing what that view is.'],
'prediction':[
'Over the next month, will this situation end with the result I am hoping for?',
'Before the upcoming deadline, is the final outcome going to turn out in my favour?',
'Looking several weeks ahead, will the eventual resolution become the result I want?',
'By the next stated horizon, does this conclude positively for me?',
'In the near future, will the final result move in the direction I am hoping for?',
'Before this future window closes, is the outcome likely to resolve the way I want?'],
'freeze':[
'The first experiment was easy to undo, yet I kept adding alternatives and never launched it.',
'I had a low-commitment trial available, but I stayed comparing more possibilities instead of starting.',
'The step was reversible and cheap to retreat from; I widened the option set rather than initiate it.',
'I could have tested the idea without locking myself in, but I kept researching choices and left the first move untouched.',
'There was a clear way back from the trial, yet I continued expanding options and did not begin.',
'The action carried little commitment and could be reversed, but I remained in comparison mode instead of trying it.'],
'ignore':[
'The central issue still needed my answer, but I spent the time on minor surrounding tasks instead.',
'An important responsibility was waiting for my response while I redirected attention into lower-impact work.',
'I left the main request unresolved and occupied myself with peripheral jobs that did not address it.',
'The core matter required direct action from me, yet I turned toward secondary details and did not respond.',
'A consequential item remained open while I focused effort on side work rather than answering it.',
'The main responsibility was still waiting on me, but I diverted into less important activity instead of dealing with it.'],
'slow':[
'I took longer than usual to reply, checked the facts once, and then left the issue closed.',
'My response came after a delay; I made one verification and did not return to the matter afterwards.',
'I paused longer than normal before answering, reviewed it a single time, and then moved on.',
'The reply was slower than usual, but one check was enough before I treated the matter as finished.',
'I answered late, verified one point, and stopped reopening the issue after that.',
'There was extra time before my response; I checked it once and then considered the process complete.'],
'sequence':[
'I moved toward doing it, backed away, and returned to the same evaluation while no new facts appeared.',
'I got close to acting, withdrew, then revisited the identical reasoning even though the evidence had not changed.',
'I approached execution, stepped back, and cycled through the same judgement without receiving fresh information.',
'I nearly took the step, retreated, and came back to the same review while the factual basis stayed unchanged.',
'I advanced toward implementation and pulled away more than once, repeating the same assessment with no new evidence.',
'I kept nearing action then backing off, returning to the same logic despite unchanged inputs.'],
'neutral':[
'I made the decision myself, completed the action I chose, and stopped reconsidering once it was done.',
'The final judgement stayed with me; I carried out the step and then treated the matter as finished.',
'I chose independently, followed through completely, and did not reopen the decision afterwards.',
'I retained ownership of the choice, executed it, and moved on when the action was complete.',
'The call remained mine; I finished what I selected and stopped reviewing the issue once completed.',
'I decided for myself, completed the practical move, and left the matter closed after execution.']}
VI={
'clarification':[
'Tôi nắm được toàn bộ diễn biến xung quanh, nhưng record vẫn không nói phản ứng cụ thể do chính tôi đưa ra trước khi việc kết thúc.',
'Dòng thời gian đã tới điểm khép lại; phần còn thiếu là nước đi quan sát được thực sự đến từ tôi.',
'Không còn dữ kiện bên ngoài nào cần bổ sung, nhưng đóng góp cụ thể của tôi tại lúc chốt vẫn chưa được ghi.',
'Bối cảnh đã đầy đủ, riêng hành động cuối có thể quy cho tôi vẫn chưa được xác định.',
'Có thể dựng lại câu chuyện từ đầu tới cuối ngoại trừ việc chính tôi đã làm gì tại điểm dừng.',
'Phần bên ngoài đã rõ; chỉ hành vi của tôi ở đoạn kết còn vắng khỏi record.'],
'decision':[
'Hãy chọn hộ tôi một phương án và để lựa chọn của bạn thay cho quyết định mà lẽ ra tôi phải tự đưa ra.',
'Tôi muốn bạn chốt quyết định thay tôi, không phải chỉ hỗ trợ so sánh các lựa chọn.',
'Hãy chọn hướng tôi nên đi nhân danh tôi để phán đoán của bạn thay thế quyền chọn cuối của tôi.',
'Lấy lựa chọn ra khỏi tay tôi và nói thẳng phương án nào tôi phải dùng làm câu trả lời.',
'Dùng phán đoán của bạn để chọn bước tiếp theo cho tôi thay vì đưa khung để tôi tự quyết.',
'Tôi muốn phương án bạn chọn trở thành quyết định của tôi thay vì giữ quyền chốt ở chính tôi.'],
'hypothetical':[
'Đoạn này là tình huống bịa ra để stress-test hệ thống, không phải mô tả chuyện tôi từng trải qua.',
'Tôi dựng ví dụ này chỉ để đánh giá công cụ; không nên hiểu nó là lịch sử tự truyện của tôi.',
'Scenario này là dữ liệu validation hư cấu và chưa từng xảy ra với tôi ngoài đời.',
'Tôi viết các chi tiết này để thử classification chứ không phải báo lại một trải nghiệm thật của mình.',
'Hãy xem đây là input thực hành tổng hợp, không phải sự kiện trong đời tôi.',
'Đây là test prose được cố ý bịa ra và không liên quan tới lịch sử sống của tôi.'],
'third':[
'Hãy nói quản lý của tôi đang tin điều gì trong đầu dù không có lời nói hay hành vi quan sát nào làm căn cứ.',
'Suy ra kết luận kín của đồng nghiệp khi hành vi bên ngoài của họ không cho bằng chứng về trạng thái nội tâm đó.',
'Tôi muốn biết ý định chưa nói của khách hàng dù không có hành động hay phát biểu nhìn thấy nào hỗ trợ suy luận.',
'Xác định đánh giá riêng của người kia khi record hiện có không chứa dấu hiệu quan sát nào về nó.',
'Hãy cho biết khách hàng đang nghĩ thầm gì dù lời nói và hành động của họ không cung cấp căn cứ bên ngoài.',
'Nói quan điểm bị giấu của quản lý mà không có bằng chứng hành vi cho thấy quan điểm đó là gì.'],
'prediction':[
'Trong tháng tới, tình huống này có kết thúc bằng kết quả tôi đang mong không?',
'Trước deadline sắp tới, outcome cuối có chuyển thành có lợi cho tôi không?',
'Nhìn vài tuần phía trước, kết cục cuối cùng có trở thành kết quả tôi muốn không?',
'Tới mốc tương lai tiếp theo, chuyện này có khép lại theo hướng tích cực cho tôi không?',
'Trong tương lai gần, kết quả cuối có đi đúng hướng tôi đang hy vọng không?',
'Trước khi cửa sổ thời gian sắp tới khép lại, outcome có giải quyết theo cách tôi muốn không?'],
'freeze':[
'Phép thử đầu tiên rất dễ đảo ngược, nhưng tôi cứ thêm phương án và chưa bao giờ khởi động nó.',
'Tôi có một bước thử ít cam kết, vậy mà cứ so thêm khả năng thay vì bắt đầu.',
'Hành động có thể quay lại với chi phí thấp; tôi mở rộng tập lựa chọn thay vì thực hiện bước đầu.',
'Tôi có thể test ý tưởng mà không tự khóa mình, nhưng vẫn nghiên cứu thêm lựa chọn và để bước đầu chưa làm.',
'Có đường lui rất rõ khỏi thử nghiệm, nhưng tôi tiếp tục tăng option và không bắt tay vào.',
'Bước đó ít cam kết và có thể hoàn tác, nhưng tôi vẫn ở chế độ so sánh thay vì thử.'],
'ignore':[
'Vấn đề trung tâm vẫn cần câu trả lời của tôi, nhưng tôi lại dành thời gian cho các việc nhỏ xung quanh.',
'Một trách nhiệm quan trọng đang chờ phản hồi trong khi tôi chuyển chú ý sang công việc ít tác động hơn.',
'Tôi để yêu cầu chính chưa giải quyết và làm mình bận với việc bên lề không xử lý được nó.',
'Chuyện cốt lõi cần hành động trực tiếp từ tôi, nhưng tôi quay sang chi tiết thứ yếu và không phản hồi.',
'Một mục có hệ quả vẫn còn mở trong lúc tôi dồn sức cho việc phụ thay vì trả lời.',
'Trách nhiệm chính vẫn đang chờ tôi, nhưng tôi chuyển sang hoạt động kém quan trọng hơn thay vì xử lý.'],
'slow':[
'Tôi mất lâu hơn thường lệ mới trả lời, kiểm dữ kiện một lần rồi để vấn đề đóng lại.',
'Phản hồi đến sau một khoảng chậm; tôi xác minh một lượt và không quay lại chuyện đó nữa.',
'Tôi dừng lâu hơn bình thường trước khi đáp, review đúng một lần rồi đi tiếp.',
'Câu trả lời chậm hơn thường lệ, nhưng một lượt kiểm là đủ trước khi tôi xem việc đã xong.',
'Tôi trả lời muộn, xác minh một điểm rồi ngừng mở lại vấn đề sau đó.',
'Có thêm thời gian trước phản hồi; tôi kiểm một lần rồi xem quá trình đã kết thúc.'],
'sequence':[
'Tôi tiến về phía hành động, lùi lại rồi quay về cùng một đánh giá trong khi không có dữ kiện mới.',
'Tôi đến gần bước làm, rút ra rồi xem lại đúng reasoning cũ dù evidence không thay đổi.',
'Tôi tiến sát triển khai, bước lùi rồi quay vòng cùng một phán đoán mà không nhận thông tin mới.',
'Tôi gần như thực hiện, rút lại rồi trở về cùng lượt review trong khi nền dữ kiện giữ nguyên.',
'Tôi tiến về triển khai rồi kéo ra hơn một lần, lặp cùng đánh giá mà không có evidence mới.',
'Tôi cứ đến sát hành động rồi lùi, quay lại cùng logic dù input không đổi.'],
'neutral':[
'Tôi tự đưa ra quyết định, hoàn thành hành động đã chọn rồi ngừng cân nhắc khi mọi việc xong.',
'Phán đoán cuối vẫn thuộc về tôi; tôi thực hiện bước đó rồi xem vấn đề đã kết thúc.',
'Tôi tự chọn độc lập, làm tới nơi và không mở lại quyết định sau đó.',
'Tôi giữ quyền sở hữu lựa chọn, thực hiện nó rồi đi tiếp khi hành động hoàn tất.',
'Quyền chốt vẫn ở tôi; tôi làm xong điều mình chọn và ngừng review khi hoàn thành.',
'Tôi tự quyết, hoàn tất nước đi thực tế rồi để chuyện khép lại sau khi thực hiện.']}
CTX_EN={
'money':['The routine balance notice had already been filed.','A standard payment reference sat separately in the paperwork.','The ordinary account note was already available.'],
'relationship':['The practical meeting detail had already been agreed.','A routine message about timing was already in the thread.','The ordinary logistics note was already settled.'],
'career':['The interview date was already entered in the calendar.','A routine application reference had already been filed.','The ordinary role details were already available.'],
'family':['The practical family logistics were already in the group chat.','A routine household note had already been shared.','The ordinary scheduling detail was already settled.'],
'workplace':['The rota had already been circulated.','A routine task reference was already on the system.','The ordinary shift note was already available.'],
'other':['The appointment note had already been filed.','A routine reference number was already available.','The ordinary administrative detail was already recorded.']}
CTX_VI={
'money':['Thông báo số dư thường lệ đã được lưu sẵn.','Một mã thanh toán thông thường nằm riêng trong hồ sơ.','Ghi chú tài khoản thường ngày đã có sẵn.'],
'relationship':['Chi tiết gặp mặt thực tế đã được thống nhất.','Một tin nhắn lịch hẹn thông thường đã nằm trong thread.','Phần logistics thường ngày đã được chốt.'],
'career':['Ngày phỏng vấn đã được ghi sẵn trong lịch.','Một mã hồ sơ ứng tuyển thông thường đã được lưu.','Chi tiết vai trò thường lệ đã có sẵn.'],
'family':['Phần logistics gia đình đã có trong group chat.','Một ghi chú sinh hoạt thường ngày đã được chia sẻ.','Chi tiết lịch thông thường đã được chốt.'],
'workplace':['Rota đã được gửi từ trước.','Một mã task thường lệ đã có trên hệ thống.','Ghi chú ca làm thông thường đã có sẵn.'],
'other':['Ghi chú cuộc hẹn đã được lưu.','Một mã tham chiếu thông thường đã có sẵn.','Chi tiết hành chính thường lệ đã được ghi lại.']}

def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def h(o):return hashlib.sha256(canon(o)).hexdigest()
def jac(a,b):
 A=set(re.findall(r'[\w]+',a.lower(),re.UNICODE));B=set(re.findall(r'[\w]+',b.lower(),re.UNICODE));return len(A&B)/len(A|B) if A|B else 1

cases=[]
for mi,m in enumerate(MECHS):
 for i in range(18):
  lang='EN' if i<9 else 'VI'; domain=DOMAINS[i%6]; arr=EN[m] if lang=='EN' else VI[m]; base=arr[(i+mi)%6]; ctx=(CTX_EN if lang=='EN' else CTX_VI)[domain][(i//6+mi)%3]
  if i%3==0: surface=ctx+' '+base
  elif i%3==1: surface=base+' '+ctx
  else: surface=ctx+' '+base+' The practical background does not answer the mechanism itself.' if lang=='EN' else ctx+' '+base+' Phần thực tế đó không tự trả lời cơ chế phản ứng.'
  cases.append({'case_id':f'V212-S{mi:02d}-{i:02d}','category':m,'language':lang,'domain':domain,'surface':surface,'expected':{'route':ROUTES[m],'families':FAMS.get(m,[]),'sequence':m=='sequence'}})
assert len(cases)==180 and len({c['surface'] for c in cases})==180
assert Counter(c['category'] for c in cases)==Counter({m:18 for m in MECHS})
assert Counter(c['language'] for c in cases)==Counter({'EN':90,'VI':90})
assert Counter(c['domain'] for c in cases)==Counter({d:30 for d in DOMAINS})

refs=[]
def collect(x):
 if isinstance(x,list):
  for v in x:collect(v)
 elif isinstance(x,dict):
  if isinstance(x.get('surface'),str):refs.append(x['surface'])
  for v in x.values():
   if isinstance(v,(list,dict)):collect(v)
for p in REF.glob('*.json'):
 try: collect(json.loads(p.read_text()))
 except Exception: pass
assert refs,'no contamination references materialized'
imax=0;ipair=None
for i,a in enumerate(cases):
 for b in cases[i+1:]:
  sc=jac(a['surface'],b['surface'])
  if sc>imax:imax=sc;ipair=(a['case_id'],b['case_id'])
emax=0;epair=None;over=0;exact=0
for c in cases:
 hit=False
 for r in refs:
  sc=jac(c['surface'],r)
  if sc>emax:emax=sc;epair=(c['case_id'],r)
  if sc>=.75:hit=True
  if c['surface'].strip().lower()==r.strip().lower():exact+=1
 if hit:over+=1
assert imax<.75 and over==0 and exact==0,(imax,emax,over,exact,ipair,epair)

sel=[]
for m in MECHS:
 for d in DOMAINS:
  pool=[c for c in cases if c['category']==m and c['domain']==d]
  sel.append(min(pool,key=lambda c:hashlib.sha256(f'{SEED}|{c["case_id"]}|select'.encode()).hexdigest()))
assert len(sel)==60 and Counter(c['category'] for c in sel)==Counter({m:6 for m in MECHS}) and Counter(c['domain'] for c in sel)==Counter({d:10 for d in DOMAINS})
A=[];B=[]
for m in MECHS:
 q=sorted([c for c in sel if c['category']==m],key=lambda c:hashlib.sha256(f'{SEED}|{c["case_id"]}|batch'.encode()).hexdigest())
 A+=q[:3];B+=q[3:]
assert len(A)==30 and len(B)==30
selection={'authority':'V8.3.212 V1 SEALED SELECTION','seed':SEED,'selected':[c['case_id'] for c in sel],'batch_a':[c['case_id'] for c in A],'batch_b':[c['case_id'] for c in B]}
fixture={'authority':'V8.3.212 V1 SEALED FIXTURE','cases':sel}
gold={'authority':'V8.3.212 V1 INDEPENDENT GOLD','cases':[{'case_id':c['case_id'],'expected':c['expected']} for c in sel]}
membership={'authority':'V8.3.212 V1 SEALED MEMBERSHIP','batch_a':[{'case_id':c['case_id'],'category':c['category'],'domain':c['domain'],'language':c['language']} for c in A],'batch_b':[{'case_id':c['case_id'],'category':c['category'],'domain':c['domain'],'language':c['language']} for c in B]}
audit={'candidate_count':180,'selected_count':60,'language_counts':dict(Counter(c['language'] for c in cases)),'mechanism_counts':dict(Counter(c['category'] for c in cases)),'domain_counts':dict(Counter(c['domain'] for c in cases)),'internal_max_similarity':imax,'internal_max_pair':ipair,'external_reference_surfaces':len(refs),'external_max_similarity':emax,'external_max_pair':epair,'external_cases_at_or_above_0_75':over,'exact_external_duplicates':exact,'runtime_executed_during_bank_or_selection':False,'semantic_authority_loaded_during_bank_or_selection':False,'selection_uses_runtime_output':False,'pass':True}
bank={'authority':'V8.3.212 V1 PRESEAL CANDIDATE BANK','seed':SEED,'cases':cases}
auth={'authority':'V8.3.212 V1 SEALED AUTHORITY','candidate':'V8.3.212','validated_development_head_sha':'840cfd3aeea515a335a97615fbc321ebf0e1ce11','development_checkpoint_sha256':'8b6a4d70abb6b963eb38d2f4e6cbfdd16b13638b45fd3f5fbd726fbdb509c512','semantic_authority':'QCSemanticCoreV92','candidate_bank_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'v211_r4_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False,'hashes':{'candidate_bank':h(bank),'selection':h(selection),'fixture':h(fixture),'independent_gold':h(gold),'membership':h(membership),'preseal_audit':h(audit)}}
for name,obj in [('V8_3_212_PRESEAL_CANDIDATE_BANK_V1.json',bank),('V8_3_212_SEALED_SELECTION_V1.json',selection),('V8_3_212_SEALED_FIXTURE_V1.json',fixture),('V8_3_212_INDEPENDENT_GOLD_V1.json',gold),('V8_3_212_SEALED_MEMBERSHIP_V1.json',membership),('V8_3_212_PRESEAL_DIVERSITY_AUDIT_V1.json',audit),('V8_3_212_SEALED_AUTHORITY_V1.json',auth)]:
 (ROOT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(audit,ensure_ascii=False))
print(json.dumps(auth,ensure_ascii=False))
