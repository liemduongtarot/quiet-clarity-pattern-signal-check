import json,hashlib,pathlib,random,re,gzip,base64
from collections import Counter
SEED=8321109
rng=random.Random(SEED)
ROOT=pathlib.Path('validation/v83211-v1-sealed'); ROOT.mkdir(parents=True,exist_ok=True)
REF=pathlib.Path('validation/preseal_refs')
MECHS=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral']
DOMAINS=['money','relationship','career','family','workplace','other']
ROUTES={'clarification':'input:clarification-required','decision':'input:decision-request','hypothetical':'input:hypothetical-or-example','third':'input:third-party-only','prediction':'input:prediction','freeze':'input:self-lived','ignore':'input:self-lived','slow':'input:self-lived','sequence':'input:self-lived','neutral':'input:self-lived'}
FAMS={'freeze':['freeze'],'ignore':['ignore'],'slow':['slow'],'sequence':['slow'],'neutral':[]}
EN={
'clarification':['The external story is complete, yet the last observable thing I contributed is never identified.','All surrounding details are available, but my own behaviour at the stopping point remains unstated.','Nothing outside me is missing; the unresolved fact is what I actually did when the matter closed.','The narrative reaches the finish, while my personal response there is absent.','The situation can be followed end to end except for the concrete step taken by me.','The context is sufficient, but the record never specifies my final contribution.'],
'decision':['Take responsibility for choosing the next move for me instead of leaving the judgement with me.','I want your selection to replace mine; tell me the action I should adopt.','Make the final call in my place and give me the path to follow.','Do not merely compare the alternatives—choose one on my behalf.','Hand me the decision you would make for me, not a framework for deciding myself.','Use your judgement as the final choice and tell me which course I should take.'],
'hypothetical':['This passage was invented for a system check and is unrelated to anything I have lived through.','I composed this fictional example for validation; it is not autobiographical material.','The scenario is manufactured test prose rather than a real event from my life.','I created these details only to probe classification, not to report an experience of mine.','This is deliberately synthetic input for evaluation and did not happen to me.','Read this as a fabricated exercise, not as a description of my own history.'],
'third':['Tell me the private belief my supervisor is holding even though no observed conduct supports an inference.','Infer the client’s concealed intention despite there being no expressed words or visible action to ground it.','I want the internal conclusion of the other person where the outward record provides no evidence.','Work out what my colleague keeps privately in mind although nothing they did reveals it.','Determine the customer’s hidden judgement without relying on any observable behaviour.','Tell me what the other person secretly means when no external sign establishes it.'],
'prediction':['Looking several weeks ahead, will the eventual result turn out in my favour?','By the coming month, is this situation going to produce the result I am hoping for?','Before the current deadline passes, will the final outcome resolve well for me?','Will the end result move in the direction I want during the near future?','Over the next few weeks, does this conclude with a favourable outcome for me?','Is the future resolution likely to become the result I want before the stated horizon?'],
'freeze':['A small step could be reversed cheaply, yet I kept enlarging the set of possibilities instead of trying it.','The trial carried little commitment, but I remained in option-building mode and never initiated it.','I had an easy exit from the experiment; still I researched more alternatives rather than begin.','The proposed move was reversible, yet I continued widening choices and left the first action undone.','I could test the idea without locking myself in, but I added possibilities instead of starting.','There was a low-cost way to try it and retreat, while I stayed comparing options and did not act.'],
'ignore':['A consequential responsibility was awaiting my reply, but I redirected effort into small surrounding jobs.','The main matter still required an answer from me while I kept busy with lower-impact tasks.','I left the central request unresolved and spent attention on peripheral work instead.','Something important needed my direct response, yet I turned to secondary details and did not answer.','The core responsibility remained open while I occupied myself with less important activity.','I avoided addressing the main item by shifting into side work that did not resolve it.'],
'slow':['My reply took longer than normal; I verified it once, accepted the position, and did not revisit it.','I answered after a delay, made one check, then treated the matter as closed.','There was extra time before my response, but only one review before I moved on.','I was slower than usual to answer; a single verification ended the process.','The response came late, I checked one point, and afterwards I left the issue alone.','I paused before replying, reviewed it once, and then stopped reopening the decision.'],
'sequence':['I advanced toward the action, backed off, and re-entered the same evaluation while nothing in the evidence changed.','I repeatedly got near execution and withdrew, returning to identical reasoning without new facts.','I moved close to acting, retreated, then revisited the same judgement despite receiving no fresh information.','I approached the step and pulled away more than once, cycling through the same assessment with unchanged inputs.','I kept moving toward implementation then stepping back, repeating the review without new evidence.','I nearly acted, withdrew, and came back to the same logic again while the factual basis stayed the same.'],
'neutral':['I made the judgement myself, completed the chosen step, and afterwards considered the matter finished.','The choice stayed mine; I carried it through and did not return to reconsider it.','I decided independently, executed the action, and then moved on.','I retained the final call, finished what I chose, and left the issue closed.','I owned the decision, followed through completely, and stopped reviewing it once done.','The judgement remained with me, the action was completed, and I did not reopen the matter.']}
VI={
'clarification':['Câu chuyện bên ngoài đã đủ, nhưng hành động quan sát được cuối cùng do tôi tạo ra vẫn chưa được xác định.','Mọi chi tiết xung quanh đều có, riêng hành vi của tôi tại điểm dừng vẫn chưa được nêu.','Không thiếu dữ kiện bên ngoài; phần chưa rõ là chính tôi đã làm gì khi việc khép lại.','Diễn biến đi tới đoạn kết, còn phản ứng cá nhân của tôi ở đó lại vắng mặt.','Có thể theo dõi tình huống từ đầu tới cuối ngoại trừ bước cụ thể do tôi thực hiện.','Bối cảnh đã đủ, nhưng record chưa hề chỉ rõ phần đóng góp cuối của tôi.'],
'decision':['Hãy chịu trách nhiệm chọn bước tiếp theo cho tôi thay vì để quyền phán đoán ở tôi.','Tôi muốn lựa chọn của bạn thay cho lựa chọn của tôi; hãy nói hành động tôi cần dùng.','Hãy đưa ra quyết định cuối thay tôi và chỉ đường tôi nên theo.','Đừng chỉ so các phương án; hãy chọn một phương án nhân danh tôi.','Cho tôi quyết định mà bạn sẽ chọn hộ, không phải khung để tôi tự quyết.','Dùng phán đoán của bạn làm lựa chọn cuối và nói tôi nên đi hướng nào.'],
'hypothetical':['Đoạn này được bịa ra để kiểm hệ thống và không liên quan tới chuyện tôi từng trải qua.','Tôi soạn ví dụ hư cấu này cho validation; nó không phải nội dung tự truyện.','Scenario này là test prose được tạo ra chứ không phải sự kiện thật trong đời tôi.','Tôi tạo các chi tiết này chỉ để thử classification, không phải kể trải nghiệm của mình.','Đây là input tổng hợp có chủ ý để đánh giá và nó chưa từng xảy ra với tôi.','Hãy đọc đây như bài tập được bịa, không phải mô tả lịch sử cá nhân của tôi.'],
'third':['Cho tôi biết niềm tin riêng quản lý đang giữ dù không có hành vi quan sát nào làm căn cứ suy ra.','Suy ra ý định bị giấu của khách hàng dù không có lời nói hay hành động nhìn thấy nào để dựa vào.','Tôi muốn biết kết luận nội tâm của người kia khi record bên ngoài không cung cấp bằng chứng.','Xác định điều đồng nghiệp giữ trong đầu dù không có việc họ làm nào bộc lộ nó.','Hãy nói đánh giá ẩn của khách hàng mà không dựa vào bất kỳ hành vi quan sát nào.','Cho tôi biết người kia ngầm có ý gì khi không có dấu hiệu bên ngoài xác nhận.'],
'prediction':['Nhìn vài tuần phía trước, kết quả cuối cùng có chuyển thành có lợi cho tôi không?','Tới tháng sắp tới tình huống này có tạo ra kết quả tôi đang mong không?','Trước khi hạn hiện tại qua đi, outcome cuối có giải quyết tốt cho tôi không?','Trong tương lai gần kết quả kết thúc có đi theo hướng tôi muốn không?','Trong vài tuần tới chuyện này có kết thúc bằng outcome thuận lợi cho tôi không?','Trước mốc đã nêu, kết cục tương lai có khả năng trở thành kết quả tôi muốn không?'],
'freeze':['Có một bước nhỏ ít tốn kém và dễ đảo ngược, nhưng tôi cứ tăng thêm khả năng thay vì thử.','Thử nghiệm không tạo nhiều cam kết, vậy mà tôi ở trong mode gom lựa chọn và chưa khởi động.','Tôi có đường ra dễ từ phép thử, nhưng vẫn nghiên cứu thêm phương án thay vì bắt đầu.','Bước dự kiến có thể quay lại, nhưng tôi tiếp tục mở rộng lựa chọn và để hành động đầu chưa làm.','Tôi có thể test ý tưởng mà không tự khóa mình, nhưng cứ thêm khả năng thay vì bắt tay vào.','Có cách thử ít tốn kém rồi rút lại, trong khi tôi cứ so phương án và chưa hành động.'],
'ignore':['Một trách nhiệm có hệ quả đang chờ câu trả lời, nhưng tôi chuyển sức sang các việc nhỏ xung quanh.','Việc chính vẫn cần tôi trả lời trong khi tôi làm mình bận với nhiệm vụ ít tác động hơn.','Tôi để yêu cầu trung tâm chưa giải quyết và dành chú ý cho công việc bên lề.','Có chuyện quan trọng cần phản hồi trực tiếp từ tôi, nhưng tôi quay sang chi tiết thứ yếu và không trả lời.','Trách nhiệm cốt lõi vẫn mở trong khi tôi bận với hoạt động kém quan trọng hơn.','Tôi tránh xử lý mục chính bằng cách chuyển sang việc phụ không giải quyết được nó.'],
'slow':['Tôi trả lời lâu hơn bình thường; xác minh một lần, chấp nhận vị trí rồi không xem lại nữa.','Tôi phản hồi sau một khoảng chậm, kiểm một lần rồi xem chuyện đã đóng.','Tôi mất thêm thời gian trước khi trả lời, nhưng chỉ review một lượt rồi đi tiếp.','Tôi chậm hơn thường lệ khi đáp; một lần xác minh là kết thúc quá trình.','Phản hồi đến muộn, tôi kiểm một điểm rồi sau đó để vấn đề yên.','Tôi dừng trước khi trả lời, xem lại một lần rồi ngừng mở lại quyết định.'],
'sequence':['Tôi tiến về hành động, lùi lại rồi quay vào cùng đánh giá trong khi evidence không thay đổi.','Tôi nhiều lần tới gần thực hiện rồi rút, trở lại cùng reasoning mà không có dữ kiện mới.','Tôi tiến sát hành động, rút lui rồi xem lại cùng phán đoán dù không nhận thêm thông tin.','Tôi tiếp cận bước làm rồi kéo ra hơn một lần, quay vòng cùng đánh giá với input không đổi.','Tôi cứ tiến tới triển khai rồi bước lùi, lặp lại lượt review mà không có evidence mới.','Tôi gần như làm, rút lại rồi trở về cùng logic trong khi nền dữ kiện vẫn y nguyên.'],
'neutral':['Tôi tự đưa ra phán đoán, hoàn thành bước đã chọn rồi xem việc kết thúc.','Lựa chọn vẫn thuộc về tôi; tôi làm tới nơi và không quay lại cân nhắc.','Tôi quyết định độc lập, thực hiện hành động rồi đi tiếp.','Tôi giữ quyền chốt cuối, làm xong điều đã chọn và để vấn đề đóng lại.','Tôi sở hữu quyết định, thực hiện đầy đủ rồi ngừng review khi xong.','Phán đoán vẫn ở tôi, hành động đã hoàn thành và tôi không mở lại chuyện.']}
CTX_EN=['A routine administrative note existed separately and added no evidence about the response mechanism.','The background included an ordinary scheduling detail that did not change the behavioural signal.','A separate record was present, but it provided no information about the mechanism being tested.']
CTX_VI=['Có một ghi chú hành chính riêng và nó không thêm bằng chứng về cơ chế phản ứng.','Bối cảnh có chi tiết lịch thông thường nhưng không thay đổi tín hiệu hành vi.','Một record riêng tồn tại nhưng không cung cấp thông tin về cơ chế đang được kiểm.']
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def h(o):return hashlib.sha256(canon(o)).hexdigest()
def jac(a,b):
 A=set(re.findall(r'[\w]+',a.lower(),re.UNICODE));B=set(re.findall(r'[\w]+',b.lower(),re.UNICODE));return len(A&B)/len(A|B) if A|B else 1
cases=[]
for mi,m in enumerate(MECHS):
 for i in range(18):
  lang='EN' if i<9 else 'VI'; arr=EN[m] if lang=='EN' else VI[m]; s=arr[i%len(arr)]
  if i%3==1:s=(CTX_EN if lang=='EN' else CTX_VI)[(mi+i)%3]+' '+s
  elif i%3==2:s=s+' '+(CTX_EN if lang=='EN' else CTX_VI)[(mi+i)%3]
  domain=DOMAINS[i%6]
  cases.append({'case_id':f'V211-C{mi*18+i+1:03d}','category':m,'language':lang,'domain':domain,'surface':s,'expected':{'route':ROUTES[m],'families':FAMS.get(m,[]),'sequence':m=='sequence'}})
assert len(cases)==180 and len({c['surface'] for c in cases})==180
# Prior-only contamination references.
refs=[]
def collect(x):
 if isinstance(x,list):
  for v in x:collect(v)
 elif isinstance(x,dict):
  if isinstance(x.get('surface'),str):refs.append(x['surface'])
  for v in x.values():
   if isinstance(v,(list,dict)):collect(v)
for p in REF.glob('*.json'):
 try:collect(json.loads(p.read_text()))
 except:pass
# Internal/external similarity.
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
# Deterministic balanced selection: one candidate per mechanism x domain, lowest hash.
sel=[]
for m in MECHS:
 for d in DOMAINS:
  pool=[c for c in cases if c['category']==m and c['domain']==d]
  sel.append(min(pool,key=lambda c:hashlib.sha256(f'{SEED}|{c["case_id"]}|select'.encode()).hexdigest()))
assert len(sel)==60 and Counter(c['category'] for c in sel)==Counter({m:6 for m in MECHS}) and Counter(c['domain'] for c in sel)==Counter({d:10 for d in DOMAINS})
# Split each mechanism 3/3 deterministically.
A=[];B=[]
for m in MECHS:
 q=sorted([c for c in sel if c['category']==m],key=lambda c:hashlib.sha256(f'{SEED}|{c["case_id"]}|batch'.encode()).hexdigest())
 A+=q[:3];B+=q[3:]
assert len(A)==30 and len(B)==30
selection={'authority':'V8.3.211 V1 SEALED SELECTION','seed':SEED,'selected':[c['case_id'] for c in sel],'batch_a':[c['case_id'] for c in A],'batch_b':[c['case_id'] for c in B]}
fixture={'authority':'V8.3.211 V1 SEALED FIXTURE','cases':sel}
gold={'authority':'V8.3.211 V1 INDEPENDENT GOLD','cases':[{'case_id':c['case_id'],'expected':c['expected']} for c in sel]}
membership={'authority':'V8.3.211 V1 SEALED MEMBERSHIP','batch_a':[{'case_id':c['case_id'],'category':c['category'],'domain':c['domain'],'language':c['language']} for c in A],'batch_b':[{'case_id':c['case_id'],'category':c['category'],'domain':c['domain'],'language':c['language']} for c in B]}
audit={'candidate_count':180,'selected_count':60,'internal_max_similarity':imax,'internal_max_pair':ipair,'external_reference_surfaces':len(refs),'external_max_similarity':emax,'external_max_pair':epair,'external_cases_at_or_above_0_75':over,'exact_external_duplicates':exact,'runtime_executed_during_bank_or_selection':False,'semantic_authority_loaded_during_bank_or_selection':False,'selection_uses_runtime_output':False,'pass':True}
bank={'authority':'V8.3.211 V1 PRESEAL CANDIDATE BANK','seed':SEED,'cases':cases}
for name,obj in [('V8_3_211_PRESEAL_CANDIDATE_BANK_V1.json',bank),('V8_3_211_SEALED_SELECTION_V1.json',selection),('V8_3_211_SEALED_FIXTURE_V1.json',fixture),('V8_3_211_INDEPENDENT_GOLD_V1.json',gold),('V8_3_211_SEALED_MEMBERSHIP_V1.json',membership),('V8_3_211_PRESEAL_DIVERSITY_AUDIT_V1.json',audit)]: (ROOT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
auth={'authority':'V8.3.211 V1 SEALED AUTHORITY','candidate':'V8.3.211','validated_development_head_sha':'ec0646c126ffd60358013663c148f4ffd7080ca2','development_checkpoint_inner_sha256':'444b1f6e22537fb0d378afb818c190976fae71758d0bc56f44fd3f225d27f11c','semantic_authority':'QCSemanticCoreV89','candidate_bank_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'v210_batch_a_rerun':False,'v210_batch_b_accessed':False,'step_111_authorized':False,'production_authorized':False,'hashes':{'candidate_bank':h(bank),'selection':h(selection),'fixture':h(fixture),'independent_gold':h(gold),'membership':h(membership),'preseal_audit':h(audit)}}
(ROOT/'V8_3_211_SEALED_AUTHORITY_V1.json').write_text(json.dumps(auth,ensure_ascii=False,indent=2)+'\n')
bundle={'bank':bank,'selection':selection,'fixture':fixture,'gold':gold,'membership':membership,'audit':audit,'authority':auth}
(ROOT/'V8_3_211_PRESEAL_BUNDLE_V1.json.gz.b64').write_text(base64.b64encode(gzip.compress(canon(bundle))).decode()+'\n')
print(json.dumps(audit))
