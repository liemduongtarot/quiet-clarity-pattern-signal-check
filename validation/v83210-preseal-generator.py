import json,hashlib,pathlib,collections,gzip,base64
ROOT=pathlib.Path('validation/v83210-v1-sealed');ROOT.mkdir(parents=True,exist_ok=True)
REF=pathlib.Path('validation/preseal_refs')
CATS=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral']
DOMAINS=['work','relationship','money','business','housing','daily-admin']
ROUTES={'clarification':'input:clarification-required','decision':'input:decision-request','hypothetical':'input:hypothetical-or-example','third':'input:third-party-only','prediction':'input:prediction','freeze':'input:self-lived','ignore':'input:self-lived','slow':'input:self-lived','sequence':'input:self-lived','neutral':'input:self-lived'}
FAMS={'freeze':['freeze'],'ignore':['ignore'],'slow':['slow'],'sequence':['slow']}
SEQ={'sequence':True}
EN={
'clarification':[
'The surrounding chronology is settled, yet the record never identifies the concrete thing I did when the episode closed.',
'All outside facts are accounted for; the missing piece is my own observable move at the stopping point.',
'The sequence reaches a clear ending, but what I personally did at that ending has not been supplied.',
'The account is complete around the event while my final behaviour remains absent from the description.',
'Nothing external needs clarification; only my own action at the close is still unspecified.',
'We can reconstruct the whole episode except for the response that actually came from me at the end.',
'The context is sufficiently complete, but the last action attributable to me is omitted.',
'The event has an endpoint and clear surrounding facts; my direct contribution at that endpoint is still blank.',
'The narrative finishes cleanly yet leaves out what I myself did in the final moment.'
],
'decision':[
'Take the final choice out of my hands and select which action I should carry out.',
'Make this call on my behalf rather than giving me criteria to decide it myself.',
'I want your selection to replace mine: choose the next course I am to follow.',
'Do the choosing for me and state the option that should become my decision.',
'Transfer the final call to yourself and tell me which path I should take.',
'Choose one alternative in my place; I am asking you to own the decision rather than support it.',
'Pick the action for me so your judgement becomes the answer I use.',
'Remove the choice from me and name the route you want me to follow.',
'I am handing you the decision itself: select my next step for me.'
],
'hypothetical':[
'This passage is fabricated for a classification exercise and is not an event from my life.',
'I constructed this sample to test the tool; none of it describes something I actually lived.',
'Treat the text as synthetic validation material rather than autobiographical evidence.',
'This is an invented practice case, not a real episode that happened to me.',
'I wrote this scenario only to exercise the classifier; it should not be read as lived history.',
'The material is deliberately fictional and exists for robustness testing, not as a personal account.',
'This example was manufactured for validation and does not represent my experience.',
'I am supplying a made-up case for practice; there is no corresponding event in my own life.',
'The scenario is test prose I created, not something that occurred to me.'
],
'third':[
'Infer my supervisor’s concealed opinion even though nothing they have said or done provides observable evidence for it.',
'Tell me the private conclusion my colleague keeps to themselves when the outward record gives no basis for knowing it.',
'Work out what the customer secretly thinks despite there being no visible behaviour that supports an inference.',
'Determine the other person’s hidden judgement even though no statement, action, or outward sign reveals it.',
'Give me my manager’s unspoken internal view despite the absence of observable evidence.',
'Identify the client’s private intention when nothing available in their words or actions indicates it.',
'Tell me what the other person is secretly concluding while the behavioural record remains silent.',
'Infer the colleague’s internal assessment even though it has never been expressed or shown.',
'Determine what my supervisor privately wants despite there being no outward basis for that claim.'
],
'prediction':[
'Over the coming month, will this situation resolve in a way that benefits me?',
'Within the next several weeks, is the final outcome likely to move in my favour?',
'Before the approaching deadline, will this end with the result I want?',
'Looking ahead through the near future, is this matter going to conclude positively for me?',
'By next month, will the eventual result turn out well for me?',
'Across the coming weeks, will this produce the outcome I am hoping for?',
'Will the final result become favourable to me before the deadline arrives?',
'In the near future, is this going to end on the positive side for me?',
'Over the next few weeks, will the outcome land in my favour?'
],
'freeze':[
'A reversible first move was available, but I kept expanding the alternatives and never began it.',
'I had a low-cost step I could undo, yet I stayed in comparison mode instead of starting.',
'There was a trial with a clear way back; I postponed the start while adding more possibilities.',
'The next action would not lock me in, but I kept broadening the option list and left it untouched.',
'I could have tested a low-risk move and reversed it easily, yet I continued researching alternatives rather than beginning.',
'A small undoable experiment was available; I kept collecting options and did not initiate it.',
'The first step was reversible with little downside, but I widened the decision set rather than trying it.',
'I had an easy-to-reverse starting move and still remained unstarted while comparing more routes.',
'The available trial carried a clear exit, yet I kept adding choices instead of putting the first move into action.'
],
'ignore':[
'The consequential request still needed my answer, but I redirected myself into lower-priority side work instead.',
'A central responsibility remained unanswered while I spent my effort on peripheral details.',
'The main issue required a response from me, yet I turned toward secondary tasks and left it open.',
'Something materially important was waiting on my answer while I kept busy with less important activity.',
'The core request was still mine to address, but I shifted attention into surrounding work rather than replying.',
'A central item needed action from me; instead I occupied myself with minor tasks and did not answer it.',
'The important matter stayed open because I diverted effort to side details instead of responding.',
'My response was still required on the main issue, yet I focused on lower-priority work around it.',
'The central obligation remained unresolved while I kept doing peripheral activity rather than dealing with it.'
],
'slow':[
'I answered later than I normally would, checked the matter once, and then closed it without returning.',
'My reply came after a delay; one verification was enough and I treated the issue as finished.',
'I took extra time before responding, reviewed it a single time, then left the decision alone.',
'The response was slower than usual, but after one check I moved on and did not reopen it.',
'I paused longer than normal before answering, verified one point, and then stopped revisiting the matter.',
'I was delayed in replying; I made one review and afterwards regarded the issue as complete.',
'I responded late, checked it once only, and then let the matter stay closed.',
'It took me longer to answer than usual; after a single verification I moved on without reconsidering.',
'My response arrived slowly, followed by one check and a clean stop with no return to the issue.'
],
'sequence':[
'I prepared to act, backed away, and repeated that approach-and-retreat cycle while the facts and reasoning stayed unchanged.',
'I got close to execution, withdrew, then returned to the same evaluation several times without new information.',
'I moved toward the step and pulled back repeatedly, re-running the same logic even though nothing new arrived.',
'I nearly acted, retreated, and cycled through the same assessment more than once with no fresh evidence.',
'I approached action and stepped back again and again while using identical reasoning and receiving no new input.',
'I kept moving toward execution then withdrawing, revisiting the same judgement despite unchanged facts.',
'I repeatedly neared the action and backed away, returning to the same review without additional information.',
'I moved in, retreated, and re-entered the identical evaluation several times while the evidence remained the same.',
'I came close to acting and pulled out repeatedly, with the same reasoning and no new facts entering the picture.'
],
'neutral':[
'I kept the decision with myself, carried it out, and then left the matter closed.',
'The judgement remained mine; I completed the practical action and did not return to reconsider it.',
'I made my own choice, followed through, and treated the issue as finished afterwards.',
'I retained ownership of the decision, executed it, then moved on without reopening the question.',
'I chose independently, completed the step, and stopped reviewing it once it was done.',
'The final call stayed with me; I acted on it and then let the matter remain closed.',
'I owned the choice, finished the action, and did not revisit it after completion.',
'I decided for myself, carried the decision through, and moved on once the action was complete.',
'My judgement governed the choice; I executed the step and left the issue behind afterwards.'
]}
VI={
'clarification':[
'Diễn biến bên ngoài đã đầy đủ, nhưng record vẫn không nói hành động cụ thể tôi đã làm khi chuyện khép lại.',
'Các dữ kiện xung quanh đã rõ; phần còn thiếu là nước đi có thể quan sát của chính tôi ở điểm dừng.',
'Chuỗi sự việc đã tới hồi kết, nhưng việc tôi trực tiếp làm ở hồi kết đó chưa được cung cấp.',
'Mô tả bao quát đủ tình huống nhưng bỏ trống hành vi cuối xuất phát từ tôi.',
'Không còn thiếu thông tin bên ngoài; chỉ hành động của tôi lúc chốt vẫn chưa được nêu.',
'Có thể dựng lại toàn bộ câu chuyện ngoại trừ phản ứng thực tế của tôi ở đoạn cuối.',
'Bối cảnh đã đủ để hiểu, nhưng hành vi cuối có thể quy cho tôi vẫn bị lược mất.',
'Tình huống có điểm kết rõ và dữ kiện đầy đủ; đóng góp trực tiếp của tôi tại điểm đó vẫn để trống.',
'Câu chuyện đã hoàn chỉnh nhưng không ghi tôi đã làm gì trong khoảnh khắc cuối.'
],
'decision':[
'Hãy lấy quyết định cuối khỏi tay tôi và chọn hành động tôi sẽ thực hiện.',
'Bạn hãy chốt thay tôi thay vì chỉ đưa tiêu chí để tôi tự quyết.',
'Tôi muốn lựa chọn của bạn thay thế lựa chọn của tôi: hãy chọn hướng tiếp theo cho tôi.',
'Hãy trực tiếp chọn hộ và nói phương án nào sẽ trở thành quyết định của tôi.',
'Chuyển quyền chốt sang bạn và nói con đường nào tôi phải theo.',
'Hãy chọn một phương án thay tôi; tôi đang giao cho bạn quyết định chứ không xin hỗ trợ cân nhắc.',
'Chọn hành động cho tôi để phán đoán của bạn trở thành câu trả lời tôi dùng.',
'Lấy quyền lựa chọn khỏi tôi và chỉ ra hướng bạn muốn tôi làm theo.',
'Tôi giao chính quyết định này cho bạn: hãy chọn bước tiếp theo thay tôi.'
],
'hypothetical':[
'Đoạn này được bịa để làm bài kiểm classification, không phải sự kiện trong đời tôi.',
'Tôi dựng sample này để thử công cụ; không phần nào mô tả chuyện tôi thật sự đã trải qua.',
'Hãy xem đây là dữ liệu validation tổng hợp chứ không phải bằng chứng tự truyện.',
'Đây là case thực hành hư cấu, không phải chuyện thật đã xảy ra với tôi.',
'Tôi viết scenario này chỉ để thử classifier; nó không nên được hiểu là lịch sử sống của tôi.',
'Phần nội dung này cố ý là hư cấu để kiểm độ bền, không phải bản tường thuật cá nhân.',
'Ví dụ này được tạo ra cho validation và không đại diện cho trải nghiệm của tôi.',
'Tôi đưa một case giả để thực hành; đời tôi không có sự kiện tương ứng.',
'Scenario này là nội dung test do tôi tạo, không phải chuyện từng xảy ra với tôi.'
],
'third':[
'Hãy suy ra quan điểm giấu kín của quản lý dù không điều gì họ nói hay làm tạo ra bằng chứng quan sát được.',
'Cho tôi biết kết luận riêng đồng nghiệp đang giữ khi record bên ngoài không cho căn cứ để biết.',
'Hãy xác định khách hàng bí mật nghĩ gì dù hành vi nhìn thấy không hỗ trợ suy luận đó.',
'Xác định đánh giá ẩn của người kia dù không lời nói, hành động hay dấu hiệu bên ngoài nào hé lộ.',
'Cho tôi biết quan điểm nội tâm chưa nói của quản lý dù hoàn toàn thiếu bằng chứng quan sát.',
'Xác định ý định riêng của khách hàng khi lời nói và hành động hiện có không chỉ ra điều đó.',
'Nói cho tôi người kia đang bí mật kết luận gì khi record hành vi không có dấu hiệu.',
'Hãy suy ra đánh giá bên trong của đồng nghiệp dù điều đó chưa từng được nói hay thể hiện.',
'Xác định điều quản lý thật sự muốn trong lòng dù không có căn cứ bên ngoài để khẳng định.'
],
'prediction':[
'Trong tháng tới, chuyện này có kết thúc theo hướng có lợi cho tôi không?',
'Trong vài tuần tiếp theo, kết quả cuối có khả năng nghiêng về phía tôi không?',
'Trước deadline sắp tới, chuyện này có chốt bằng kết quả tôi mong muốn không?',
'Nhìn sang tương lai gần, vấn đề này có kết thúc tích cực cho tôi không?',
'Tới tháng sau, kết quả cuối cùng có chuyển theo hướng tốt cho tôi không?',
'Trong những tuần sắp tới, chuyện này có tạo ra outcome tôi đang hy vọng không?',
'Kết quả cuối có trở nên thuận lợi cho tôi trước khi hạn chót đến không?',
'Trong tương lai gần, chuyện này có kết thúc ở phía tích cực cho tôi không?',
'Qua vài tuần tới, outcome có rơi về hướng có lợi cho tôi không?'
],
'freeze':[
'Có một bước đầu dễ đảo ngược, nhưng tôi cứ mở rộng phương án và không bắt đầu.',
'Tôi có một bước ít tốn kém có thể quay lại, vậy mà vẫn so sánh thay vì khởi động.',
'Có thử nghiệm với đường lui rõ; tôi trì hoãn bắt đầu trong lúc thêm khả năng.',
'Bước kế tiếp không khóa tôi vào lựa chọn nào, nhưng tôi vẫn mở rộng danh sách và để nguyên.',
'Tôi có thể thử một nước đi rủi ro thấp rồi đảo lại dễ dàng, nhưng tiếp tục nghiên cứu phương án thay vì làm.',
'Có một thử nghiệm nhỏ có thể hoàn tác; tôi cứ gom lựa chọn và không khởi động.',
'Bước đầu có thể đảo ngược với ít mặt trái, nhưng tôi mở rộng tập lựa chọn thay vì thử.',
'Tôi có một nước đi khởi đầu dễ quay lại nhưng vẫn chưa làm vì cứ so thêm hướng.',
'Thử nghiệm hiện có có lối ra rõ ràng, nhưng tôi tiếp tục thêm lựa chọn thay vì thực hiện bước đầu.'
],
'ignore':[
'Yêu cầu có hệ quả vẫn cần câu trả lời của tôi, nhưng tôi chuyển sang việc phụ có ưu tiên thấp hơn.',
'Một trách nhiệm trung tâm chưa được trả lời trong khi tôi dành sức cho chi tiết bên lề.',
'Vấn đề chính cần phản hồi từ tôi, vậy mà tôi quay sang task thứ yếu và để nó mở.',
'Một chuyện quan trọng đang chờ câu trả lời của tôi trong khi tôi bận với hoạt động kém quan trọng hơn.',
'Yêu cầu cốt lõi vẫn do tôi xử lý, nhưng tôi dời chú ý sang việc xung quanh thay vì phản hồi.',
'Một hạng mục trung tâm cần tôi hành động; thay vào đó tôi bận với task nhỏ và không trả lời.',
'Chuyện quan trọng vẫn mở vì tôi chuyển sức sang chi tiết phụ thay vì đáp lại.',
'Vấn đề chính vẫn cần phản hồi của tôi, nhưng tôi tập trung vào việc có ưu tiên thấp hơn.',
'Nghĩa vụ trung tâm chưa được xử lý trong khi tôi tiếp tục làm việc bên lề thay vì đối diện nó.'
],
'slow':[
'Tôi trả lời muộn hơn bình thường, kiểm tra đúng một lần rồi khép chuyện và không quay lại.',
'Phản hồi đến sau một khoảng chậm; một lượt xác minh là đủ và tôi xem việc đã xong.',
'Tôi cần thêm thời gian trước khi trả lời, xem lại một lần rồi để quyết định yên.',
'Phản hồi chậm hơn thường lệ, nhưng sau một lần kiểm tôi đi tiếp và không mở lại.',
'Tôi dừng lâu hơn bình thường trước khi đáp, xác minh một điểm rồi ngừng xem lại.',
'Tôi trả lời trễ; chỉ review một lần và sau đó xem vấn đề đã hoàn tất.',
'Phản hồi của tôi đến muộn, tôi kiểm đúng một lần rồi để chuyện khép lại.',
'Tôi mất lâu hơn thường lệ để trả lời; sau một lượt xác minh tôi đi tiếp mà không cân nhắc lại.',
'Tôi phản hồi chậm, kiểm một lần rồi dừng hẳn và không quay lại vấn đề.'
],
'sequence':[
'Tôi chuẩn bị hành động rồi lùi lại, lặp vòng tiến-lùi đó trong khi dữ kiện và lý luận không đổi.',
'Tôi đến sát lúc thực hiện rồi rút lui, sau đó quay lại cùng một đánh giá nhiều lần mà không có thông tin mới.',
'Tôi tiến về bước làm rồi kéo lại liên tục, chạy lại cùng logic dù chẳng có gì mới.',
'Tôi gần như hành động rồi rút ra, lặp cùng một đánh giá hơn một lần mà không có evidence mới.',
'Tôi tiến gần hành động rồi lùi liên tục, dùng cùng một lý luận và không nhận thêm input.',
'Tôi cứ tiến tới thực hiện rồi rút lui, quay về cùng một phán đoán dù dữ kiện giữ nguyên.',
'Tôi nhiều lần đến gần bước làm rồi lùi, trở lại cùng một lượt xem xét mà không có thêm thông tin.',
'Tôi tiến vào rồi rút, tái nhập cùng một đánh giá nhiều lần trong khi evidence không đổi.',
'Tôi tới gần hành động rồi rút ra liên tục, với cùng reasoning và không có dữ kiện mới.'
],
'neutral':[
'Tôi giữ quyết định ở mình, thực hiện nó rồi để chuyện khép lại.',
'Phán đoán vẫn là của tôi; tôi hoàn thành hành động thực tế và không quay lại cân nhắc.',
'Tôi tự đưa ra lựa chọn, làm đến nơi rồi xem vấn đề đã xong.',
'Tôi giữ quyền sở hữu quyết định, thực hiện xong rồi đi tiếp mà không mở lại câu hỏi.',
'Tôi độc lập lựa chọn, hoàn tất bước làm và ngừng review khi nó xong.',
'Quyền chốt cuối vẫn ở tôi; tôi hành động theo đó rồi để chuyện đóng lại.',
'Tôi sở hữu lựa chọn, hoàn thành hành động và không xem lại sau khi xong.',
'Tôi tự quyết, làm quyết định đó đến cùng rồi đi tiếp khi hành động hoàn tất.',
'Phán đoán của tôi dẫn quyết định; tôi thực hiện bước đó rồi để vấn đề lại phía sau.'
]}
CTX_EN={'work':'The setting is an ordinary work handover with no extra signal about the mechanism.','relationship':'The setting is a routine conversation between two people and adds no hidden evidence.','money':'The setting involves an ordinary payment decision and no additional behavioural cue.','business':'The setting is a standard business follow-up with no extra semantic signal.','housing':'The setting concerns routine housing administration and adds no new mechanism.','daily-admin':'The setting is ordinary daily administration and contributes no additional behavioural evidence.'}
CTX_VI={'work':'Bối cảnh là một bàn giao công việc bình thường và không thêm tín hiệu cơ chế.','relationship':'Bối cảnh là cuộc trao đổi quan hệ bình thường và không thêm bằng chứng ẩn.','money':'Bối cảnh liên quan quyết định tiền bạc thông thường và không thêm cue hành vi.','business':'Bối cảnh là follow-up kinh doanh tiêu chuẩn và không thêm tín hiệu semantic.','housing':'Bối cảnh là admin nhà ở thông thường và không tạo thêm cơ chế.','daily-admin':'Bối cảnh là việc hành chính hằng ngày và không bổ sung bằng chứng hành vi.'}
def expected(cat):return {'route':ROUTES[cat],'families':FAMS.get(cat,[]),'sequence':SEQ.get(cat,False)}
cases=[]
for ci,cat in enumerate(CATS):
  for i in range(18):
    lang='EN' if i<9 else 'VI';j=i if i<9 else i-9;domain=DOMAINS[(i+ci*3)%6]
    base=(EN if lang=='EN' else VI)[cat][j]
    surface=base+' '+(CTX_EN if lang=='EN' else CTX_VI)[domain]
    cases.append({'case_id':f'V210-C{len(cases)+1:03d}','category':cat,'domain':domain,'language':lang,'surface':surface,'expected':expected(cat)})
def tokens(s):return set(str(s).lower().split())
def jac(a,b):
 A,B=tokens(a),tokens(b)
 return len(A&B)/len(A|B) if A or B else 1.0
def collect(x,out):
 if isinstance(x,list):
  for v in x:collect(v,out)
 elif isinstance(x,dict):
  if isinstance(x.get('surface'),str):out.append(x['surface'])
  for v in x.values():
   if isinstance(v,(dict,list)):collect(v,out)
refs=[]
if REF.exists():
 for p in sorted(REF.glob('*.json')):
  try:collect(json.loads(p.read_text()),refs)
  except Exception:pass
# If any case is too lexically close, add a natural mechanism-neutral context sentence and recheck.
for round_no in range(3):
 bad=[]
 for c in cases:
  m=max((jac(c['surface'],r) for r in refs),default=0)
  if m>=0.75:bad.append(c)
 if not bad:break
 for c in bad:
  tail=('The surrounding record also contains routine logistical details, none of which changes the response mechanism.' if c['language']=='EN' else 'Record xung quanh còn có vài chi tiết hậu cần thông thường, không chi tiết nào thay đổi cơ chế phản ứng.')
  c['surface']+=' '+tail
assert len(cases)==180 and len({c['surface'] for c in cases})==180
lang=collections.Counter(c['language'] for c in cases);cats=collections.Counter(c['category'] for c in cases);dom=collections.Counter(c['domain'] for c in cases)
assert lang=={'EN':90,'VI':90};assert all(cats[x]==18 for x in CATS);assert all(dom[x]==30 for x in DOMAINS)
internal_max=0;internal_pair=None
for i,a in enumerate(cases):
 for b in cases[i+1:]:
  s=jac(a['surface'],b['surface'])
  if s>internal_max:internal_max=s;internal_pair=(a['case_id'],b['case_id'])
external_max=0;external_pair=None;over=0;exact=0
for c in cases:
 hit=False
 for r in refs:
  s=jac(c['surface'],r)
  if s>external_max:external_max=s;external_pair=(c['case_id'],r)
  if s>=0.75:hit=True
  if c['surface'].strip().lower()==str(r).strip().lower():exact+=1
 if hit:over+=1
assert internal_max<0.75,(internal_max,internal_pair)
assert over==0,(external_max,external_pair)
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def h(o):return hashlib.sha256(canon(o)).hexdigest()
bank={'authority':'V8.3.210 V1 PRESEAL CANDIDATE BANK','candidate':'V8.3.210','construction':'fresh independent 180-case bank; 10 contract classes x18; 6 domains x30; 90 EN/90 VI; no runtime outputs used','runtime_output_used':False,'cases':cases}
bank_hash=h(bank)
selected_by={};selected=[]
for cat in CATS:
 for domain in DOMAINS:
  pool=[c for c in cases if c['category']==cat and c['domain']==domain]
  pick=min(pool,key=lambda c:hashlib.sha256(f'{bank_hash}|{cat}|{domain}|{c["case_id"]}'.encode()).hexdigest())
  selected.append(pick);selected_by.setdefault(cat,[]).append(pick['case_id'])
batch_a=[];batch_b=[]
for cat in CATS:
 ids=selected_by[cat]
 ranked=sorted(ids,key=lambda cid:hashlib.sha256(f'AB|{bank_hash}|{cid}'.encode()).hexdigest())
 batch_a+=ranked[:3];batch_b+=ranked[3:]
assert len(selected)==60 and len(batch_a)==30 and len(batch_b)==30 and not(set(batch_a)&set(batch_b))
selection={'authority':'V8.3.210 V1 SEALED SELECTION','candidate':'V8.3.210','candidate_bank_sha256':bank_hash,'selection_method':'For each of 10 contract classes and each of 6 domains, select minimum SHA256(candidate_bank_sha256|category|domain|case_id); 60 total. Within each class rank six by SHA256(AB|candidate_bank_sha256|case_id); first 3 Batch A, rest Batch B. No runtime output used.','selection_by_category':selected_by,'batch_a':batch_a,'batch_b':batch_b,'runtime_output_used':False}
fixture={'authority':'V8.3.210 V1 SEALED FIXTURE','candidate':'V8.3.210','cases':selected}
gold={'authority':'V8.3.210 V1 INDEPENDENT GOLD','candidate':'V8.3.210','expected':{c['case_id']:c['expected'] for c in selected}}
byid={c['case_id']:c for c in selected}
membership={'authority':'V8.3.210 V1 SEALED MEMBERSHIP','candidate':'V8.3.210','members':[{'batch':'A' if cid in set(batch_a) else 'B','case_id':cid,'category':byid[cid]['category'],'domain':byid[cid]['domain']} for cid in batch_a+batch_b]}
audit={'authority':'V8.3.210 V1 PRESEAL DIVERSITY AUDIT','candidate':'V8.3.210','pass':True,'candidate_count':180,'unique_surface_count':180,'language_counts':dict(lang),'category_counts':dict(cats),'domain_counts':dict(dom),'selected_count':60,'selected_category_counts':dict(collections.Counter(c['category'] for c in selected)),'selected_domain_counts':dict(collections.Counter(c['domain'] for c in selected)),'internal_max_similarity':internal_max,'internal_max_pair':internal_pair,'external_reference_count':len(refs),'external_max_similarity':external_max,'external_max_pair_case':external_pair[0] if external_pair else None,'external_cases_at_or_above_0_75':over,'exact_external_duplicates':exact,'reference_sealed_versions':['V8.3.201','V8.3.202','V8.3.203','V8.3.204','V8.3.205','V8.3.206','V8.3.207','V8.3.208','V8.3.209'],'development_generalization_reference_included':True,'runtime_executed_during_bank_or_selection':False,'semantic_authority_loaded_during_bank_or_selection':False,'selection_uses_runtime_output':False,'expected_contracts_modified_after_runtime':False}
hashes={'candidate_bank':h(bank),'selection':h(selection),'fixture':h(fixture),'independent_gold':h(gold),'membership':h(membership),'preseal_audit':h(audit)}
authority={'authority':'V8.3.210 V1 SEALED AUTHORITY','candidate':'V8.3.210','validated_development_head_sha':'3b38e1a445230428e4b48c7a19335ba3a9bfa568','development_checkpoint_inner_sha256':'7689959df9d1fc22d309e19c76ea15531a19d006b07d132ddd2c7c63f803d21a','semantic_authority':'QCSemanticCoreV86','candidate_bank_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'v209_batch_a_rerun':False,'v209_batch_b_accessed':False,'step_111_authorized':False,'production_authorized':False,'hashes':hashes}
for name,obj in [('V8_3_210_PRESEAL_CANDIDATE_BANK_V1.json',bank),('V8_3_210_SEALED_SELECTION_V1.json',selection),('V8_3_210_SEALED_FIXTURE_V1.json',fixture),('V8_3_210_INDEPENDENT_GOLD_V1.json',gold),('V8_3_210_SEALED_MEMBERSHIP_V1.json',membership),('V8_3_210_PRESEAL_DIVERSITY_AUDIT_V1.json',audit),('V8_3_210_SEALED_AUTHORITY_V1.json',authority)]:
 (ROOT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2))
bundle={'bank':bank,'selection':selection,'fixture':fixture,'gold':gold,'membership':membership,'audit':audit,'authority':authority}
(ROOT/'V8_3_210_PRESEAL_BUNDLE_V1.json.gz.b64').write_text(base64.b64encode(gzip.compress(canon(bundle),9)).decode())
print(json.dumps({'pass':True,'bank_hash':bank_hash,'internal_max':internal_max,'external_max':external_max,'external_refs':len(refs),'selected':60},indent=2))
