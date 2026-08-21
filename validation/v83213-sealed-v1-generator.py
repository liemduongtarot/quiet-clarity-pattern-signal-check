import json,hashlib,pathlib,re
from collections import Counter

SEED=8321319
ROOT=pathlib.Path('validation/v83213-v1-sealed'); ROOT.mkdir(parents=True,exist_ok=True)
REF=pathlib.Path('validation/v83213-preseal-refs')
MECHS=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral']
DOMAINS=['money','relationship','career','family','workplace','other']
ROUTES={'clarification':'input:clarification-required','decision':'input:decision-request','hypothetical':'input:hypothetical-or-example','third':'input:third-party-only','prediction':'input:prediction','freeze':'input:self-lived','ignore':'input:self-lived','slow':'input:self-lived','sequence':'input:self-lived','neutral':'input:self-lived'}
FAMS={'freeze':['freeze'],'ignore':['ignore'],'slow':['slow'],'sequence':['slow'],'neutral':[]}

# Fresh V213 semantic surfaces. These are independently authored and do not copy V212 sealed wording.
EN={
'clarification':[
'Every surrounding fact is known, yet the account leaves out the observable response I myself made at the end.',
'The episode has a clear endpoint, but it never identifies the action that came from me before closure.',
'What happened around me is fully described; the unresolved gap is my own concrete behaviour when it finished.',
'The external chronology is complete while the final step attributable to me remains unstated.',
'Nothing about the setting is missing except the response I personally contributed at the stopping point.',
'The record reaches the end of the event without specifying what I actually did there.',
'All contextual details are settled, but my own visible move at closure has not been identified.',
'The sequence of events is complete apart from the action that was mine to make before it closed.',
'The factual background is sufficient; only my personally observable response at the endpoint is absent.'],
'decision':[
'Use your judgement to pick my next move for me instead of leaving the final choice in my hands.',
'I want you to select the path I should take and have your choice replace the decision I would make myself.',
'Make the call on my behalf: choose the option I should follow rather than just helping me evaluate it.',
'Decide which course I should adopt in my place, not merely provide a framework for my own decision.',
'Choose my next step for me so that your judgement, rather than mine, determines what I do.',
'I am handing over the final selection: tell me which route to take as the decision itself.',
'Pick the option on my behalf and let that answer stand where my own final call would normally sit.',
'I want your selected course to become my decision, rather than keeping ownership of the last choice.',
'Take over the choice and determine my next move instead of supporting me to decide it myself.'],
'hypothetical':[
'I invented this passage for classifier testing; it is not part of my lived history.',
'This is synthetic evaluation material rather than an event that happened in my life.',
'The scenario was deliberately constructed for a system test and should not be read as autobiographical.',
'I made up these details to exercise classification, not to describe a genuine experience of mine.',
'Treat the paragraph as fabricated validation input, unrelated to anything I have personally lived through.',
'This example exists only as test material and does not report an episode from my own life.',
'I wrote a fictional case for evaluation; none of it belongs to my real-life history.',
'This deliberately invented scenario is for validation, not a record of something that happened to me.',
'The prose is synthetic classifier input and is explicitly unrelated to my personal lived experience.'],
'third':[
'Tell me what my manager privately thinks when nothing observable in their words or actions supports that inference.',
'Work out the supervisor’s concealed opinion despite having no behavioural evidence for that internal view.',
'Infer the colleague’s hidden belief even though there is no outward sign showing what they believe.',
'Determine the client’s private conclusion without any observable behaviour that could establish it.',
'I want the other person’s unspoken judgement even though the record contains no external evidence of it.',
'Say what the manager secretly believes where nothing they said or did gives an observable basis.',
'Identify the supervisor’s hidden view despite the absence of any behavioural cue pointing to that view.',
'Infer what my colleague privately believes when there is no visible action or statement supporting the claim.',
'Tell me the customer’s concealed internal judgement without an observable basis in their behaviour.'],
'prediction':[
'At the next future horizon, will this close in a positive direction for me?',
'Looking ahead to the coming deadline, will the final result become favourable to me?',
'Over the next few weeks, is the eventual outcome going to match what I am hoping for?',
'By the approaching time marker, will this situation resolve the way I want?',
'In the near future, will the end result turn out positively for me?',
'Before the coming window ends, is this going to conclude with the outcome I want?',
'At the next stated future point, will the matter finish in my favour?',
'Looking toward the upcoming horizon, does the final outcome become the result I am hoping for?',
'By the next future checkpoint, will this resolve positively for me?'],
'freeze':[
'There was a reversible trial I could exit easily, but I kept increasing options and never got started.',
'I had a low-commitment first test available, yet I widened the alternatives instead of beginning it.',
'A clear route back existed from the experiment, but I continued adding choices and left it unstarted.',
'The first move was easy to reverse; I kept comparing more possibilities rather than initiating it.',
'I could retreat from the trial cheaply, but I expanded the option set and did not take the opening step.',
'The experiment would not lock me in, yet I stayed researching alternatives and never began.',
'A small reversible action was available, but I added more options instead of putting the test into motion.',
'I had an easy exit from the trial and still kept broadening choices rather than starting.',
'The action carried little commitment and a clear way back, but I remained in option expansion without beginning.'],
'ignore':[
'The main issue was still waiting for my reply while I redirected effort into secondary work.',
'A central responsibility needed action from me, but I occupied myself with peripheral tasks instead.',
'The core request remained unanswered while my attention moved to lower-impact details.',
'I left the consequential matter open and spent my effort on side activity that did not address it.',
'The primary responsibility was waiting on me, yet I focused on minor surrounding tasks instead of responding.',
'The important request still required my action, but I diverted attention toward less important work.',
'I did not answer the central matter and kept busy with secondary jobs that could not resolve it.',
'The main obligation stayed unresolved while I shifted into peripheral activity rather than dealing with it.',
'A consequential request remained open because I turned to minor side work instead of giving the required response.'],
'slow':[
'I took more time than normal before replying, made one check, and then did not reopen the issue.',
'There was a bounded delay before my response; I verified it once and considered the matter finished.',
'My answer came later than usual, followed by a single review before I moved on.',
'I paused longer than I normally would, checked one point, and then left the process closed.',
'The response was delayed, but after one verification I stopped returning to the matter.',
'I allowed extra time before answering, reviewed it once, and treated the issue as complete.',
'The reply came slowly; one factual check was enough before I closed it and moved on.',
'I responded after a longer pause, made a single verification, and did not revisit the question.',
'There was more time before my response than usual; I checked once and then ended the process.'],
'sequence':[
'I moved close to action, backed off, then returned to the same logic even though the inputs had not changed.',
'I approached execution, withdrew, and revisited identical reasoning without receiving new information.',
'I neared the step, pulled back, then cycled through the same judgement while the evidence stayed unchanged.',
'I advanced toward doing it, retreated, and came back to the same assessment with no fresh facts.',
'I got near implementation, stepped away, then repeated the same review despite unchanged evidence.',
'I moved toward acting, backed away, and returned again to the same reasoning without new input.',
'I approached the practical step, withdrew, then revisited the same conclusion while nothing factual changed.',
'I kept nearing execution and pulling back, repeating the same logic in the absence of fresh information.',
'I came close to acting, retreated, and returned to the same judgement although the evidence remained the same.'],
'neutral':[
'I kept the judgement as mine, carried out the action I chose, and stopped reviewing once it was completed.',
'The final decision remained with me; I executed the selected step and moved on after it finished.',
'I chose independently, completed what I chose, and did not reopen the matter afterwards.',
'I retained ownership of the call, followed through fully, and treated the issue as closed.',
'The choice stayed mine; I finished the practical action and stopped reconsidering it once done.',
'I made the final judgement myself, completed the step, and moved forward without reopening the decision.',
'I owned the selection, carried it through to completion, and ended the review there.',
'I decided for myself, executed the chosen move completely, and left the matter finished.',
'The final call remained mine; after completing the action I stopped returning to the decision.']}

VI={
'clarification':[
'Mọi dữ kiện xung quanh đều đã rõ, nhưng bản ghi vẫn thiếu phản ứng quan sát được do chính tôi thực hiện ở đoạn cuối.',
'Tình huống có điểm kết rõ ràng, nhưng không xác định hành động nào thực sự đến từ tôi trước khi khép lại.',
'Diễn biến bên ngoài đã đầy đủ; khoảng trống còn lại là hành vi cụ thể của chính tôi lúc chuyện kết thúc.',
'Dòng thời gian bên ngoài hoàn chỉnh trong khi bước cuối có thể quy cho tôi vẫn chưa được nêu.',
'Bối cảnh không còn thiếu gì ngoài phản ứng mà cá nhân tôi đã đưa ra tại điểm dừng.',
'Record đi tới cuối sự việc nhưng vẫn không nói tôi thực tế đã làm gì ở đó.',
'Mọi chi tiết nền đã chốt, riêng nước đi nhìn thấy được của tôi lúc khép lại chưa được xác định.',
'Chuỗi sự kiện đã đủ ngoại trừ hành động thuộc về tôi trước khi nó đóng lại.',
'Phần facts xung quanh đã đủ; chỉ phản ứng quan sát được của tôi tại endpoint còn vắng.'],
'decision':[
'Dùng phán đoán của bạn chọn nước đi tiếp theo cho tôi thay vì để quyền chốt cuối ở tôi.',
'Tôi muốn bạn chọn con đường tôi nên đi và để lựa chọn của bạn thay thế quyết định tôi tự đưa ra.',
'Hãy chốt thay tôi: chọn phương án tôi phải theo, không chỉ giúp tôi cân nhắc.',
'Quyết định hướng tôi nên chọn ở vị trí của tôi, chứ không chỉ đưa khung để tôi tự quyết.',
'Hãy chọn bước tiếp theo cho tôi để phán đoán của bạn, thay vì của tôi, quyết định việc tôi làm.',
'Tôi giao quyền chọn cuối: nói thẳng route nào tôi phải lấy làm quyết định.',
'Chọn phương án nhân danh tôi và để câu trả lời đó đứng vào chỗ quyền chốt của chính tôi.',
'Tôi muốn hướng bạn chọn trở thành quyết định của tôi thay vì giữ quyền sở hữu lựa chọn cuối.',
'Hãy tiếp quản lựa chọn và xác định nước đi kế tiếp thay vì hỗ trợ tôi tự quyết.'],
'hypothetical':[
'Tôi bịa đoạn này để test classifier; nó không thuộc lịch sử sống của tôi.',
'Đây là dữ liệu đánh giá tổng hợp chứ không phải một sự kiện đã xảy ra trong đời tôi.',
'Scenario được cố ý dựng cho system test và không nên đọc như chuyện tự truyện.',
'Tôi tạo các chi tiết này để thử classification, không phải mô tả trải nghiệm thật của mình.',
'Hãy xem đoạn này là input validation hư cấu, không liên quan đến điều tôi từng sống qua.',
'Ví dụ này chỉ tồn tại để test và không báo lại một tình huống trong đời thật của tôi.',
'Tôi viết một case hư cấu để đánh giá; nội dung không thuộc lịch sử đời thực của tôi.',
'Tình huống cố ý bịa này dùng cho validation, không phải record của chuyện đã xảy ra với tôi.',
'Đoạn prose là input classifier tổng hợp và được nói rõ là không liên quan tới trải nghiệm sống cá nhân của tôi.'],
'third':[
'Hãy nói quản lý của tôi đang nghĩ riêng điều gì khi không có lời nói hay hành động quan sát được nào làm căn cứ.',
'Suy ra quan điểm bị giấu của supervisor dù không có bằng chứng hành vi cho trạng thái nội tâm đó.',
'Xác định niềm tin kín của đồng nghiệp mặc dù không có dấu hiệu bên ngoài cho thấy họ tin gì.',
'Hãy cho biết kết luận riêng của khách hàng khi không có hành vi quan sát nào có thể chứng minh nó.',
'Tôi muốn biết đánh giá chưa nói của người kia dù record không có evidence bên ngoài cho điều đó.',
'Nói quản lý đang tin thầm gì khi không có gì họ nói hay làm tạo thành căn cứ quan sát được.',
'Xác định góc nhìn ẩn của supervisor dù hoàn toàn thiếu cue hành vi hướng tới góc nhìn ấy.',
'Suy ra đồng nghiệp của tôi tin riêng điều gì khi không có hành động hay phát biểu nhìn thấy được hỗ trợ.',
'Hãy nói phán đoán nội tâm bị che của khách hàng mà không có căn cứ quan sát trong hành vi của họ.'],
'prediction':[
'Tới mốc tương lai kế tiếp, chuyện này có khép lại theo hướng tích cực cho tôi không?',
'Nhìn tới deadline sắp đến, kết quả cuối có trở nên có lợi cho tôi không?',
'Trong vài tuần tới, outcome sau cùng có thành điều tôi đang mong không?',
'Tới cột mốc thời gian sắp tới, tình huống này có giải quyết theo cách tôi muốn không?',
'Trong tương lai gần, kết quả cuối có chuyển theo hướng tốt cho tôi không?',
'Trước khi khoảng thời gian sắp tới kết thúc, chuyện này có chốt bằng outcome tôi muốn không?',
'Tại mốc tương lai được nêu tiếp theo, vấn đề có kết thúc có lợi cho tôi không?',
'Nhìn về horizon sắp tới, outcome cuối có trở thành kết quả tôi đang hy vọng không?',
'Tới checkpoint tương lai kế tiếp, chuyện này có giải quyết tích cực cho tôi không?'],
'freeze':[
'Tôi có một thử nghiệm có thể đảo ngược và rút ra dễ dàng, nhưng cứ tăng lựa chọn rồi không bắt đầu.',
'Một phép thử đầu tiên ít cam kết đã sẵn sàng, vậy mà tôi mở rộng phương án thay vì khởi động.',
'Có đường quay lại rõ ràng khỏi thử nghiệm, nhưng tôi tiếp tục thêm lựa chọn và để nó chưa bắt đầu.',
'Bước đầu rất dễ hoàn tác; tôi cứ so thêm khả năng thay vì thực hiện nó.',
'Tôi có thể rút khỏi phép thử với chi phí thấp, nhưng lại mở rộng option và không đi bước đầu.',
'Thử nghiệm không khóa tôi vào lựa chọn, vậy mà tôi vẫn nghiên cứu thêm phương án và chưa bắt tay.',
'Một hành động nhỏ có thể đảo ngược đã có, nhưng tôi thêm option thay vì đưa phép thử vào chạy.',
'Tôi có lối thoát dễ dàng khỏi thử nghiệm nhưng vẫn cứ mở rộng lựa chọn thay vì bắt đầu.',
'Hành động ít cam kết và có đường lui rõ, nhưng tôi vẫn ở trong việc tăng option mà không khởi động.'],
'ignore':[
'Vấn đề chính vẫn đang chờ phản hồi của tôi trong khi tôi chuyển sức sang công việc thứ yếu.',
'Một trách nhiệm trung tâm cần hành động từ tôi, nhưng tôi lại làm mình bận với các task bên lề.',
'Yêu cầu cốt lõi vẫn chưa được trả lời trong lúc chú ý của tôi chuyển sang chi tiết ít tác động hơn.',
'Tôi để chuyện có hệ quả còn mở và dùng sức cho hoạt động phụ không xử lý được nó.',
'Trách nhiệm chính đang chờ tôi, vậy mà tôi tập trung vào việc nhỏ xung quanh thay vì phản hồi.',
'Yêu cầu quan trọng vẫn cần hành động của tôi, nhưng tôi chuyển chú ý sang công việc kém quan trọng.',
'Tôi không trả lời vấn đề trung tâm và cứ bận với task phụ không thể giải quyết nó.',
'Nghĩa vụ chính vẫn chưa xong trong khi tôi chuyển sang hoạt động bên lề thay vì xử lý.',
'Một yêu cầu có hệ quả còn mở vì tôi quay sang việc phụ nhỏ thay cho phản ứng cần thiết.'],
'slow':[
'Tôi mất nhiều thời gian hơn bình thường trước khi trả lời, kiểm một lần rồi không mở lại vấn đề.',
'Có một khoảng chậm hữu hạn trước phản hồi; tôi xác minh đúng một lượt và xem chuyện đã xong.',
'Câu trả lời đến muộn hơn thường lệ, sau đó tôi review một lần rồi đi tiếp.',
'Tôi dừng lâu hơn bình thường trước khi đáp, kiểm một điểm rồi để quá trình khép lại.',
'Phản hồi bị chậm, nhưng sau một lần xác minh tôi ngừng quay lại chuyện đó.',
'Tôi để thêm thời gian trước khi trả lời, review một lượt rồi xem vấn đề hoàn tất.',
'Câu đáp đến chậm; một lần kiểm facts là đủ trước khi tôi đóng lại và đi tiếp.',
'Tôi phản hồi sau một khoảng dừng dài hơn, xác minh một lần và không xem lại câu hỏi.',
'Có thêm thời gian trước phản hồi so với thường lệ; tôi kiểm một lượt rồi kết thúc quá trình.'],
'sequence':[
'Tôi tiến gần hành động, rút ra rồi quay lại cùng logic dù input không thay đổi.',
'Tôi tiếp cận bước thực hiện, lùi lại và xem lại reasoning giống hệt mà không nhận thông tin mới.',
'Tôi đến sát bước làm, kéo ra rồi quay vòng cùng một phán đoán trong khi evidence giữ nguyên.',
'Tôi tiến về phía thực hiện, rút lui rồi trở lại cùng đánh giá mà không có facts mới.',
'Tôi đến gần triển khai, bước ra rồi lặp lại cùng lượt review dù evidence không đổi.',
'Tôi tiến về hành động, lùi lại rồi quay lại cùng reasoning khi không có input mới.',
'Tôi tiếp cận bước thực tế, rút ra rồi xem lại cùng kết luận trong khi facts không đổi.',
'Tôi cứ tới gần thực hiện rồi kéo ra, lặp cùng logic trong lúc không có thông tin mới.',
'Tôi gần hành động, lùi lại rồi trở về cùng phán đoán mặc dù evidence vẫn y nguyên.'],
'neutral':[
'Tôi giữ phán đoán ở mình, thực hiện xong hành động đã chọn rồi ngừng review khi hoàn tất.',
'Quyết định cuối vẫn thuộc về tôi; tôi làm bước đã chọn rồi đi tiếp sau khi xong.',
'Tôi tự chọn độc lập, hoàn thành điều mình chọn và không mở lại vấn đề về sau.',
'Tôi giữ quyền sở hữu quyết định, làm tới cùng rồi xem chuyện đã đóng.',
'Lựa chọn vẫn là của tôi; tôi hoàn thành hành động thực tế và ngừng cân nhắc khi xong.',
'Tôi tự đưa ra phán đoán cuối, hoàn tất bước đó rồi đi tiếp mà không mở lại quyết định.',
'Tôi sở hữu lựa chọn, thực hiện tới khi hoàn thành và dừng việc review tại đó.',
'Tôi tự quyết, làm trọn nước đi đã chọn rồi để vấn đề kết thúc.',
'Quyền chốt cuối vẫn ở tôi; sau khi hoàn tất hành động tôi không quay lại quyết định nữa.']}

CTX_EN={
'money':['The ledger already contained the routine reference.','The ordinary billing detail was documented separately.','A standard account entry was already on file.'],
'relationship':['The meeting logistics had already been settled.','The routine timing message was already recorded.','The practical contact detail was already agreed.'],
'career':['The application logistics were already documented.','The interview scheduling note was already present.','The routine role reference was already filed.'],
'family':['The household scheduling detail was already known.','The ordinary family logistics were already recorded.','A routine domestic note was already in the thread.'],
'workplace':['The shift logistics were already documented.','The ordinary task reference was already available.','The routine rota detail had already been recorded.'],
'other':['The administrative reference was already filed.','The ordinary appointment detail was already known.','A routine record identifier was already available.']}
CTX_VI={
'money':['Sổ theo dõi đã có mã tham chiếu thường lệ.','Chi tiết thanh toán thông thường được ghi riêng.','Một entry tài khoản chuẩn đã có trong hồ sơ.'],
'relationship':['Phần logistics gặp mặt đã được chốt.','Tin nhắn thời gian thường lệ đã được ghi lại.','Chi tiết liên hệ thực tế đã được thống nhất.'],
'career':['Logistics hồ sơ ứng tuyển đã được ghi.','Ghi chú lịch phỏng vấn đã có sẵn.','Mã vai trò thông thường đã được lưu.'],
'family':['Chi tiết lịch sinh hoạt gia đình đã rõ.','Logistics gia đình thường ngày đã được ghi.','Một ghi chú sinh hoạt chuẩn đã có trong thread.'],
'workplace':['Logistics ca làm đã được ghi lại.','Mã task thông thường đã có sẵn.','Chi tiết rota thường lệ đã được lưu.'],
'other':['Mã hành chính đã được lưu.','Chi tiết cuộc hẹn thông thường đã rõ.','Một định danh hồ sơ thường lệ đã có sẵn.']}

TAIL_EN=['The practical context does not determine the response mechanism.','That routine detail is background rather than evidence of the mechanism.','The administrative fact does not answer the behavioural question.']
TAIL_VI=['Chi tiết thực tế đó không quyết định cơ chế phản ứng.','Phần thường lệ chỉ là bối cảnh chứ không phải evidence của cơ chế.','Dữ kiện hành chính đó không trả lời câu hỏi về hành vi.']

def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def h(o):return hashlib.sha256(canon(o)).hexdigest()
def toks(s):return set(re.findall(r'[\w]+',s.lower(),re.UNICODE))
def jac(a,b):
 A=toks(a);B=toks(b);return len(A&B)/len(A|B) if A|B else 1

def fingerprint(s):
 # Order-insensitive lexical fingerprint after removing short/common glue words; used only for contamination audit.
 stop={'the','a','an','and','or','to','of','in','on','for','my','me','i','it','is','was','were','had','has','have','this','that','da','toi','va','mot','cua','cho','trong','o','la','co','khong','nhung','duoc','bi','de','khi'}
 return tuple(sorted(w for w in toks(s) if len(w)>2 and w not in stop))

cases=[]
for mi,m in enumerate(MECHS):
 for i in range(18):
  lang='EN' if i<9 else 'VI'; domain=DOMAINS[(i+mi)%6]; arr=EN[m] if lang=='EN' else VI[m]; base=arr[i%9]
  ctx=(CTX_EN if lang=='EN' else CTX_VI)[domain][(i+2*mi)%3]
  tail=(TAIL_EN if lang=='EN' else TAIL_VI)[(i+mi)%3]
  mode=(i+mi)%4
  if mode==0: surface=ctx+' '+base
  elif mode==1: surface=base+' '+ctx
  elif mode==2: surface=ctx+' '+base+' '+tail
  else: surface=base+' '+tail+' '+ctx
  cases.append({'case_id':f'V213-S{mi:02d}-{i:02d}','category':m,'language':lang,'domain':domain,'surface':surface,'expected':{'route':ROUTES[m],'families':FAMS.get(m,[]),'sequence':m=='sequence'}})
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
emax=0;epair=None;over=0;exact=0;fp_exact=0
ref_fp={fingerprint(r) for r in refs}
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
  pool=[c for c in cases if c['category']==m and c['domain']==d]
  assert pool
  sel.append(min(pool,key=lambda c:hashlib.sha256(f'{SEED}|{c["case_id"]}|select'.encode()).hexdigest()))
assert len(sel)==60 and Counter(c['category'] for c in sel)==Counter({m:6 for m in MECHS}) and Counter(c['domain'] for c in sel)==Counter({d:10 for d in DOMAINS})
A=[];B=[]
for m in MECHS:
 q=sorted([c for c in sel if c['category']==m],key=lambda c:hashlib.sha256(f'{SEED}|{c["case_id"]}|batch'.encode()).hexdigest())
 A+=q[:3];B+=q[3:]
assert len(A)==30 and len(B)==30 and set(c['case_id'] for c in A).isdisjoint(c['case_id'] for c in B)
selection={'authority':'V8.3.213 V1 SEALED SELECTION','seed':SEED,'selected':[c['case_id'] for c in sel],'batch_a':[c['case_id'] for c in A],'batch_b':[c['case_id'] for c in B]}
fixture={'authority':'V8.3.213 V1 SEALED FIXTURE','cases':sel}
gold={'authority':'V8.3.213 V1 INDEPENDENT GOLD','cases':[{'case_id':c['case_id'],'expected':c['expected']} for c in sel]}
membership={'authority':'V8.3.213 V1 SEALED MEMBERSHIP','batch_a':[{'case_id':c['case_id'],'category':c['category'],'domain':c['domain'],'language':c['language']} for c in A],'batch_b':[{'case_id':c['case_id'],'category':c['category'],'domain':c['domain'],'language':c['language']} for c in B]}
audit={'candidate_count':180,'selected_count':60,'language_counts':dict(Counter(c['language'] for c in cases)),'mechanism_counts':dict(Counter(c['category'] for c in cases)),'domain_counts':dict(Counter(c['domain'] for c in cases)),'internal_max_similarity':imax,'internal_max_pair':ipair,'external_reference_surfaces':len(refs),'external_max_similarity':emax,'external_max_pair':epair,'external_cases_at_or_above_0_75':over,'exact_external_duplicates':exact,'semantic_fingerprint_exact_duplicates':fp_exact,'runtime_executed_during_bank_or_selection':False,'semantic_authority_loaded_during_bank_or_selection':False,'selection_uses_runtime_output':False,'pass':True}
bank={'authority':'V8.3.213 V1 PRESEAL CANDIDATE BANK','seed':SEED,'cases':cases}
auth={'authority':'V8.3.213 V1 SEALED AUTHORITY','candidate':'V8.3.213','validated_development_head_sha':'70808836f6cfb09a5428685e0bfdc336afe4181f','semantic_authority':'QCSemanticCoreV93','candidate_bank_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'v212_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False,'hashes':{'candidate_bank':h(bank),'selection':h(selection),'fixture':h(fixture),'independent_gold':h(gold),'membership':h(membership),'preseal_audit':h(audit)}}
for name,obj in [('V8_3_213_PRESEAL_CANDIDATE_BANK_V1.json',bank),('V8_3_213_SEALED_SELECTION_V1.json',selection),('V8_3_213_SEALED_FIXTURE_V1.json',fixture),('V8_3_213_INDEPENDENT_GOLD_V1.json',gold),('V8_3_213_SEALED_MEMBERSHIP_V1.json',membership),('V8_3_213_PRESEAL_DIVERSITY_AUDIT_V1.json',audit),('V8_3_213_SEALED_AUTHORITY_V1.json',auth)]:
 (ROOT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(audit,ensure_ascii=False))
print(json.dumps(auth,ensure_ascii=False))
