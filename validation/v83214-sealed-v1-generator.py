import json,hashlib,pathlib,re
from collections import Counter
SEED=8321423
ROOT=pathlib.Path('validation/v83214-v1-sealed');ROOT.mkdir(parents=True,exist_ok=True)
REF=pathlib.Path('validation/v83214-preseal-refs')
MECHS=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral']
DOMAINS=['money','relationship','career','family','workplace','other']
ROUTES={'clarification':'input:clarification-required','decision':'input:decision-request','hypothetical':'input:hypothetical-or-example','third':'input:third-party-only','prediction':'input:prediction','freeze':'input:self-lived','ignore':'input:self-lived','slow':'input:self-lived','sequence':'input:self-lived','neutral':'input:self-lived'}
FAMS={'freeze':['freeze'],'ignore':['ignore'],'slow':['slow'],'sequence':['slow'],'neutral':[]}
# Fresh compositional surface grammar. Vocabulary and clause structure intentionally differ from V213 sealed bank.
EN={
'clarification':[
('The surrounding account is already sufficient','the one unresolved omission is which observable act I personally supplied before the episode shut'),
('All external facts can be followed without a gap','what remains unspecified is my own concrete response at the final point'),
('The setting and chronology are both settled','the record still omits the behaviour that came from me as the matter ended')],
'decision':[
('I am not asking for decision support','I want you to determine the course I should take so your selection substitutes for my final choice'),
('Do not leave the last call with me','choose the practical route on my behalf and let your judgement decide what I do'),
('I want the agency transferred for this choice','select my next course rather than helping me reach my own conclusion')],
'hypothetical':[
('This text was manufactured solely as classifier material','it is explicitly not an incident from my personal history'),
('I composed this fictional example for validation','none of it should be treated as a lived event of mine'),
('The paragraph is synthetic evaluation prose','it was invented for testing rather than taken from my real experience')],
'third':[
('The question concerns another person’s private mental state','there is no observable conduct or statement that evidences the hidden view I am asking you to infer'),
('I am asking for someone else’s unspoken belief','nothing visible in their behaviour provides a basis for identifying that internal conclusion'),
('The target is the other person’s concealed judgement','the available record contains no outward evidence establishing what they privately think')],
'prediction':[
('At a specified future horizon','I want to know whether the eventual result will resolve favourably for me'),
('Looking ahead to the next time boundary','is this going to finish with the outcome I want'),
('Before the coming future checkpoint','will the final resolution turn into a positive result for me')],
'freeze':[
('A small trial was available with an easy exit','I kept enlarging the set of alternatives instead of initiating the reversible first move'),
('The opening experiment carried little commitment and could be undone','I continued comparing additional options and left the test unstarted'),
('I had a low-risk action I could reverse without much cost','rather than begin it I broadened the choice set again')],
'ignore':[
('The consequential request still required a response from me','I redirected effort into peripheral activity that could not resolve the main obligation'),
('My primary responsibility remained unanswered','instead of acting on it I occupied myself with lower-priority surrounding work'),
('The core matter was still waiting on my action','I diverted attention to secondary tasks and left the central issue open')],
'slow':[
('My reply came after a contained delay','I performed one verification and then closed the matter without another review'),
('I took longer than my normal response time','after a single factual check I moved on and did not reopen it'),
('There was one bounded pause before I answered','I reviewed the point once and treated the process as complete')],
'sequence':[
('I advanced toward carrying out the step and then pulled away','I returned to the identical reasoning while the factual inputs remained unchanged'),
('I came close to execution before retreating','then I revisited the same judgement despite receiving no new information'),
('I moved toward implementation and backed out','afterwards I cycled through the same assessment with no change in evidence')],
'neutral':[
('I retained ownership of the judgement','I completed the action I selected and ended the review once execution was finished'),
('The final call stayed with me','I followed through on my chosen step and did not reopen the decision afterward'),
('I made the choice independently','I carried the practical move to completion and then left the issue closed')]
}
VI={
'clarification':[
('Phần diễn biến bên ngoài đã đủ để hiểu sự việc','khoảng trống duy nhất là hành động quan sát được do chính tôi đưa ra trước lúc câu chuyện đóng lại'),
('Bối cảnh và dòng thời gian đều đã đầy đủ','record vẫn chưa nêu phản ứng cụ thể của tôi tại điểm cuối'),
('Các facts xung quanh không còn thiếu','điều chưa xác định là hành vi thực tế xuất phát từ tôi khi sự việc kết thúc')],
'decision':[
('Tôi không muốn chỉ được hỗ trợ ra quyết định','tôi muốn bạn xác định hướng tôi phải đi để lựa chọn của bạn thay quyền chốt cuối của tôi'),
('Đừng để quyết định sau cùng ở tôi','hãy chọn route thực tế nhân danh tôi và dùng phán đoán của bạn làm câu trả lời'),
('Trong lựa chọn này tôi đang giao quyền quyết định','hãy chọn bước tiếp theo thay vì chỉ giúp tôi tự kết luận')],
'hypothetical':[
('Đoạn này được tạo riêng làm dữ liệu cho classifier','nó được nói rõ là không phải sự việc trong lịch sử đời tôi'),
('Tôi dựng một ví dụ hư cấu để validation','không phần nào nên được hiểu là trải nghiệm thật của tôi'),
('Đây là prose đánh giá tổng hợp','nó được bịa để test chứ không lấy từ chuyện tôi đã sống qua')],
'third':[
('Câu hỏi nhắm vào trạng thái nội tâm riêng của người khác','không có hành vi hay phát biểu quan sát được nào làm evidence cho góc nhìn ẩn tôi đang muốn suy ra'),
('Tôi đang hỏi về niềm tin chưa nói của một người khác','không có gì nhìn thấy trong hành vi của họ tạo căn cứ để xác định kết luận nội tâm đó'),
('Đối tượng là phán đoán bị che của người kia','record hiện có không chứa evidence bên ngoài chứng minh họ đang nghĩ riêng điều gì')],
'prediction':[
('Tại một mốc tương lai đã xác định','tôi muốn biết kết quả cuối có giải quyết theo hướng có lợi cho tôi không'),
('Nhìn tới ranh giới thời gian kế tiếp','chuyện này có kết thúc bằng outcome tôi muốn không'),
('Trước checkpoint tương lai sắp tới','kết cục sau cùng có chuyển thành kết quả tích cực cho tôi không')],
'freeze':[
('Có một thử nghiệm nhỏ với lối thoát dễ dàng','tôi cứ mở rộng thêm phương án thay vì khởi động bước đầu có thể hoàn tác'),
('Phép thử mở đầu ít cam kết và có thể đảo ngược','tôi tiếp tục so thêm option rồi để test chưa bắt đầu'),
('Tôi có một hành động rủi ro thấp có thể quay lại với ít chi phí','thay vì làm nó tôi lại mở rộng tập lựa chọn')],
'ignore':[
('Yêu cầu có hệ quả vẫn cần phản hồi từ tôi','tôi chuyển sức sang hoạt động bên lề không thể giải quyết nghĩa vụ chính'),
('Trách nhiệm ưu tiên của tôi vẫn chưa được xử lý','thay vì hành động tôi làm mình bận với công việc xung quanh ít quan trọng hơn'),
('Chuyện cốt lõi vẫn chờ hành động của tôi','tôi dời chú ý sang task thứ yếu và để vấn đề trung tâm còn mở')],
'slow':[
('Phản hồi của tôi đến sau một khoảng chậm có giới hạn','tôi xác minh một lần rồi đóng vấn đề mà không review thêm'),
('Tôi mất lâu hơn nhịp phản hồi thông thường','sau đúng một lần kiểm facts tôi đi tiếp và không mở lại'),
('Có một khoảng dừng hữu hạn trước khi tôi trả lời','tôi review điểm đó một lượt rồi xem quá trình đã hoàn tất')],
'sequence':[
('Tôi tiến tới gần việc thực hiện rồi kéo ra','sau đó quay về đúng reasoning cũ trong khi dữ kiện đầu vào vẫn không đổi'),
('Tôi đến sát execution trước khi rút lui','rồi xem lại cùng phán đoán dù không nhận thêm thông tin nào'),
('Tôi tiến về triển khai rồi lùi khỏi bước đó','sau đó quay vòng cùng đánh giá trong khi evidence không thay đổi')],
'neutral':[
('Tôi vẫn giữ quyền sở hữu phán đoán','tôi hoàn thành hành động mình chọn và kết thúc việc review khi thực hiện xong'),
('Quyền chốt cuối vẫn thuộc về tôi','tôi làm tới cùng bước đã chọn rồi không mở lại quyết định'),
('Tôi tự đưa ra lựa chọn','tôi thực hiện nước đi thực tế đến hoàn tất rồi để vấn đề đóng lại')]
}
CTX_EN={
'money':['The ordinary reconciliation code was already recorded.','A routine invoice reference already existed.','The standard account memo was already filed.'],
'relationship':['The basic meeting logistics were already settled.','A routine contact-time note was already present.','The ordinary arrangement detail had already been agreed.'],
'career':['The standard application metadata was already on record.','The routine interview slot was already documented.','The ordinary role identifier was already filed.'],
'family':['The normal household schedule was already available.','A routine family logistics note was already present.','The ordinary domestic arrangement had already been recorded.'],
'workplace':['The routine shift metadata was already logged.','A normal rota reference was already available.','The ordinary task identifier had already been filed.'],
'other':['The routine administrative code was already present.','A standard appointment reference was already stored.','The ordinary record marker had already been documented.']}
CTX_VI={
'money':['Mã đối soát thường lệ đã được ghi.','Mã invoice thông thường đã có sẵn.','Memo tài khoản chuẩn đã được lưu.'],
'relationship':['Logistics gặp mặt cơ bản đã được chốt.','Ghi chú giờ liên hệ thường lệ đã có.','Chi tiết sắp xếp thông thường đã được thống nhất.'],
'career':['Metadata hồ sơ ứng tuyển chuẩn đã có trong record.','Slot phỏng vấn thường lệ đã được ghi.','Định danh vai trò thông thường đã được lưu.'],
'family':['Lịch sinh hoạt gia đình bình thường đã có sẵn.','Ghi chú logistics gia đình thường lệ đã hiện diện.','Sắp xếp sinh hoạt thông thường đã được ghi.'],
'workplace':['Metadata ca làm thường lệ đã được log.','Mã rota bình thường đã có sẵn.','Định danh task thông thường đã được lưu.'],
'other':['Mã hành chính thường lệ đã có.','Mã cuộc hẹn chuẩn đã được lưu.','Marker hồ sơ thông thường đã được ghi.']}
TAIL_EN=['That ordinary detail is context only and does not establish the mechanism.','The routine fact is separate from the behavioural evidence being measured.','This administrative background does not determine the response classification.']
TAIL_VI=['Chi tiết thường lệ đó chỉ là bối cảnh và không xác lập cơ chế.','Fact thông thường này tách biệt với evidence hành vi đang được đo.','Phần nền hành chính này không quyết định classification của phản ứng.']

def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def h(o):return hashlib.sha256(canon(o)).hexdigest()
def toks(s):return set(re.findall(r'[\w]+',s.lower(),re.UNICODE))
def jac(a,b):
 A=toks(a);B=toks(b);return len(A&B)/len(A|B) if A|B else 1

def fingerprint(s):
 stop={'the','a','an','and','or','to','of','in','on','for','my','me','i','it','is','was','were','had','has','have','this','that','da','toi','va','mot','cua','cho','trong','o','la','co','khong','nhung','duoc','de','khi'}
 return tuple(sorted(w for w in toks(s) if len(w)>2 and w not in stop))

cases=[]
for mi,m in enumerate(MECHS):
 for i in range(18):
  lang='EN' if i<9 else 'VI';domain=DOMAINS[(i+2*mi)%6];pair=(EN if lang=='EN' else VI)[m][(i+mi)%3];ctx=(CTX_EN if lang=='EN' else CTX_VI)[domain][(i//3+mi)%3];tail=(TAIL_EN if lang=='EN' else TAIL_VI)[(i+2*mi)%3]
  joiners=['; ',' — ','; meanwhile, '] if lang=='EN' else ['; ',' — ','; đồng thời, ']
  core=pair[0]+joiners[(i+mi)%3]+pair[1]+'.'
  mode=(i+mi)%4
  surface=(ctx+' '+core) if mode==0 else (core+' '+ctx) if mode==1 else (ctx+' '+core+' '+tail) if mode==2 else (core+' '+tail+' '+ctx)
  cases.append({'case_id':f'V214-S{mi:02d}-{i:02d}','category':m,'language':lang,'domain':domain,'surface':surface,'expected':{'route':ROUTES[m],'families':FAMS.get(m,[]),'sequence':m=='sequence'}})
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
 try:collect(json.loads(p.read_text()))
 except Exception:pass
assert refs,'no contamination references materialized'
imax=0;ipair=None
for i,a in enumerate(cases):
 for b in cases[i+1:]:
  sc=jac(a['surface'],b['surface'])
  if sc>imax:imax=sc;ipair=(a['case_id'],b['case_id'])
emax=0;epair=None;over=0;exact=0;fp_exact=0;ref_fp={fingerprint(r) for r in refs}
for c in cases:
 hit=False
 for r in refs:
  sc=jac(c['surface'],r)
  if sc>emax:emax=sc;epair=(c['case_id'],r)
  if sc>=.75:hit=True
  if c['surface'].strip().lower()==r.strip().lower():exact+=1
 if hit:over+=1
 if fingerprint(c['surface']) in ref_fp:fp_exact+=1
assert imax<.75 and over==0 and exact==0 and fp_exact==0,(imax,emax,over,exact,fp_exact,ipair,epair)
sel=[]
for m in MECHS:
 for d in DOMAINS:
  pool=[c for c in cases if c['category']==m and c['domain']==d];assert pool
  sel.append(min(pool,key=lambda c:hashlib.sha256(f'{SEED}|{c["case_id"]}|select'.encode()).hexdigest()))
assert len(sel)==60 and Counter(c['category'] for c in sel)==Counter({m:6 for m in MECHS}) and Counter(c['domain'] for c in sel)==Counter({d:10 for d in DOMAINS})
A=[];B=[]
for m in MECHS:
 q=sorted([c for c in sel if c['category']==m],key=lambda c:hashlib.sha256(f'{SEED}|{c["case_id"]}|batch'.encode()).hexdigest());A+=q[:3];B+=q[3:]
assert len(A)==30 and len(B)==30 and set(c['case_id'] for c in A).isdisjoint(c['case_id'] for c in B)
selection={'authority':'V8.3.214 V1 SEALED SELECTION','seed':SEED,'selected':[c['case_id'] for c in sel],'batch_a':[c['case_id'] for c in A],'batch_b':[c['case_id'] for c in B]}
fixture={'authority':'V8.3.214 V1 SEALED FIXTURE','cases':sel};gold={'authority':'V8.3.214 V1 INDEPENDENT GOLD','cases':[{'case_id':c['case_id'],'expected':c['expected']} for c in sel]};membership={'authority':'V8.3.214 V1 SEALED MEMBERSHIP','batch_a':[{'case_id':c['case_id'],'category':c['category'],'domain':c['domain'],'language':c['language']} for c in A],'batch_b':[{'case_id':c['case_id'],'category':c['category'],'domain':c['domain'],'language':c['language']} for c in B]}
audit={'candidate_count':180,'selected_count':60,'language_counts':dict(Counter(c['language'] for c in cases)),'mechanism_counts':dict(Counter(c['category'] for c in cases)),'domain_counts':dict(Counter(c['domain'] for c in cases)),'internal_max_similarity':imax,'internal_max_pair':ipair,'external_reference_surfaces':len(refs),'external_max_similarity':emax,'external_max_pair':epair,'external_cases_at_or_above_0_75':over,'exact_external_duplicates':exact,'semantic_fingerprint_exact_duplicates':fp_exact,'runtime_executed_during_bank_or_selection':False,'semantic_authority_loaded_during_bank_or_selection':False,'selection_uses_runtime_output':False,'pass':True}
bank={'authority':'V8.3.214 V1 PRESEAL CANDIDATE BANK','seed':SEED,'cases':cases}
auth={'authority':'V8.3.214 V1 SEALED AUTHORITY','candidate':'V8.3.214','validated_development_head_sha':'4725f8a613048e755fef6c10398d83305abd136f','semantic_authority':'QCSemanticCoreV94R','candidate_bank_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'v213_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False,'hashes':{'candidate_bank':h(bank),'selection':h(selection),'fixture':h(fixture),'independent_gold':h(gold),'membership':h(membership),'preseal_audit':h(audit)}}
for name,obj in [('V8_3_214_PRESEAL_CANDIDATE_BANK_V1.json',bank),('V8_3_214_SEALED_SELECTION_V1.json',selection),('V8_3_214_SEALED_FIXTURE_V1.json',fixture),('V8_3_214_INDEPENDENT_GOLD_V1.json',gold),('V8_3_214_SEALED_MEMBERSHIP_V1.json',membership),('V8_3_214_PRESEAL_DIVERSITY_AUDIT_V1.json',audit),('V8_3_214_SEALED_AUTHORITY_V1.json',auth)]:
 (ROOT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(audit,ensure_ascii=False));print(json.dumps(auth,ensure_ascii=False))
