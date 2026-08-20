import json,hashlib,pathlib,re
from collections import Counter
SEED=8321201
OUT=pathlib.Path('validation/V8_3_212_DEVELOPMENT_GENERALIZATION_800_V1.json')
MECHS=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral']
DOMAINS=['money','relationship','career','family','workplace','other']
ROUTES={'clarification':'input:clarification-required','decision':'input:decision-request','hypothetical':'input:hypothetical-or-example','third':'input:third-party-only','prediction':'input:prediction','freeze':'input:self-lived','ignore':'input:self-lived','slow':'input:self-lived','sequence':'input:self-lived','neutral':'input:self-lived'}
FAMS={'freeze':['freeze'],'ignore':['ignore'],'slow':['slow'],'sequence':['slow'],'neutral':[]}
BASE_EN={
'clarification':['The outside chronology is settled, although the concrete action I contributed at closure is still not recorded.','Everything around the episode is known; what remains unstated is my own final response.','The account reaches its endpoint without identifying the observable thing I did there.','All external facts are available, but the closing move attributable to me has been omitted.'],
'decision':['I want you to choose the course I should take rather than merely support my decision.','Select the option on my behalf so your choice replaces the one I would make.','Make the call in my place and tell me the path I am to follow.','Use your judgement as my decision instead of giving me a framework to decide.'],
'hypothetical':['I created this passage solely for evaluation; it does not describe a real experience of mine.','This constructed example is test material rather than something that happened to me.','I wrote the scenario to exercise the classifier, not to report my lived history.','These details are synthetic validation input and should not be read as autobiographical.'],
'third':['Infer the private conclusion my colleague holds even though nothing observable supports that inference.','Tell me what the client secretly intends when their words and actions provide no basis for it.','Determine the other person’s hidden judgement despite the absence of outward evidence.','Work out my supervisor’s unspoken belief where no observable sign establishes it.'],
'prediction':['Looking ahead several weeks, will the eventual outcome become favourable for me?','By the next stated horizon, is the final result going to match what I want?','Will this resolve in my favour before the upcoming deadline?','Over the near future, does the situation end with the outcome I am hoping for?'],
'freeze':['A low-commitment trial was easy to reverse, yet I expanded alternatives rather than initiate it.','I could test the step and retreat cheaply, but I kept comparing possibilities and never began.','The move would not lock me in; still I widened the option set instead of taking the first step.','A reversible experiment was ready, while I stayed researching choices and left it unstarted.'],
'ignore':['The consequential item still needed my reply, but I shifted effort into minor side work instead.','A central responsibility remained unanswered while I focused on peripheral tasks.','The main matter was waiting for my action, yet I redirected attention toward lower-impact details.','I left the core request open and occupied myself with secondary work that did not resolve it.'],
'slow':['I answered later than normal, checked one point, then left the matter closed.','My reply was delayed; after a single verification I did not revisit the issue.','I paused longer than usual before responding, reviewed it once, and then moved on.','The response came slowly, but one check ended the process and I stopped reopening it.'],
'sequence':['I moved toward action, withdrew, then returned to the same assessment while the evidence stayed unchanged.','I repeatedly approached execution and backed away, revisiting identical reasoning without new facts.','I nearly acted, stepped back, and came again to the same judgement despite no fresh information.','I advanced toward implementation then retreated, cycling through the same review with unchanged inputs.'],
'neutral':['I kept the judgement with me, completed the chosen action, and considered the matter finished.','The decision remained mine; I carried it through and did not reopen it afterwards.','I chose independently, executed the step, and moved on once it was complete.','I owned the final call, followed through fully, and stopped reviewing when done.']}
BASE_VI={
'clarification':['Diễn biến bên ngoài đã rõ, nhưng hành động cụ thể do tôi tạo ra lúc khép lại vẫn chưa được ghi.','Mọi dữ kiện xung quanh đều đủ; phần chưa nêu là phản ứng cuối của chính tôi.','Record đã tới điểm kết nhưng chưa xác định việc quan sát được mà tôi đã làm ở đó.','Toàn bộ facts bên ngoài đã có, còn nước đi chốt từ phía tôi vẫn bị bỏ thiếu.'],
'decision':['Tôi muốn bạn chọn hướng tôi nên đi thay vì chỉ hỗ trợ tôi tự quyết.','Hãy chọn phương án thay tôi để lựa chọn của bạn thế chỗ lựa chọn của tôi.','Đưa ra quyết định ở vị trí của tôi và nói con đường tôi cần theo.','Dùng phán đoán của bạn làm quyết định cho tôi thay vì đưa khung để tôi tự chọn.'],
'hypothetical':['Tôi tạo đoạn này chỉ để đánh giá hệ thống; nó không mô tả trải nghiệm thật của tôi.','Ví dụ được dựng này là dữ liệu test chứ không phải chuyện đã xảy ra với tôi.','Tôi viết scenario để thử classifier, không phải kể lịch sử sống của mình.','Các chi tiết này là input validation tổng hợp và không nên hiểu là tự truyện.'],
'third':['Suy ra kết luận riêng đồng nghiệp đang giữ dù không có bằng chứng quan sát nào hỗ trợ.','Cho tôi biết khách hàng bí mật định gì khi lời nói và hành động không tạo căn cứ.','Xác định đánh giá ẩn của người kia dù hoàn toàn thiếu evidence bên ngoài.','Tìm ra niềm tin chưa nói của quản lý khi không có dấu hiệu quan sát nào xác nhận.'],
'prediction':['Nhìn về vài tuần tới, outcome cuối cùng có trở nên có lợi cho tôi không?','Tới mốc sắp tới, kết quả cuối có đi đúng điều tôi muốn không?','Trước deadline kế tiếp, chuyện này có giải quyết theo hướng có lợi cho tôi không?','Trong tương lai gần, tình huống có kết thúc bằng outcome tôi đang mong không?'],
'freeze':['Một phép thử ít cam kết và dễ quay lại đã có, nhưng tôi mở rộng phương án thay vì bắt đầu.','Tôi có thể test bước đó rồi rút với chi phí thấp, vậy mà vẫn so thêm khả năng và chưa làm.','Bước này không khóa tôi vào nó; nhưng tôi cứ mở rộng lựa chọn thay vì thực hiện bước đầu.','Một thử nghiệm có thể đảo ngược đã sẵn sàng, trong khi tôi nghiên cứu thêm option và để nó chưa khởi động.'],
'ignore':['Mục có hệ quả vẫn cần phản hồi của tôi, nhưng tôi chuyển sức sang việc phụ nhỏ hơn.','Một trách nhiệm trung tâm vẫn chưa được trả lời trong khi tôi tập trung vào việc bên lề.','Chuyện chính đang chờ hành động từ tôi, nhưng tôi dồn chú ý cho chi tiết ít tác động hơn.','Tôi để yêu cầu cốt lõi còn mở và làm mình bận với công việc thứ yếu không giải quyết được nó.'],
'slow':['Tôi trả lời muộn hơn bình thường, kiểm một điểm rồi để vấn đề đóng lại.','Phản hồi bị chậm; sau đúng một lần xác minh tôi không quay lại nữa.','Tôi dừng lâu hơn thường lệ trước khi đáp, review một lượt rồi đi tiếp.','Câu trả lời đến chậm, nhưng một lần kiểm là kết thúc và tôi ngừng mở lại.'],
'sequence':['Tôi tiến về hành động, rút lại rồi trở về cùng đánh giá trong khi evidence vẫn không đổi.','Tôi nhiều lần tới gần thực hiện rồi lùi, xem lại cùng reasoning mà không có facts mới.','Tôi gần như làm, bước lùi rồi quay lại cùng phán đoán dù không có thông tin mới.','Tôi tiến tới triển khai rồi rút ra, quay vòng cùng lượt review với input y nguyên.'],
'neutral':['Tôi giữ phán đoán ở mình, hoàn thành hành động đã chọn rồi xem chuyện kết thúc.','Quyết định vẫn thuộc về tôi; tôi làm tới nơi và sau đó không mở lại.','Tôi tự chọn, thực hiện bước đó rồi đi tiếp khi đã hoàn tất.','Tôi giữ quyền chốt cuối, làm đầy đủ và ngừng review khi xong.']}
NEUTRAL_EN=['A calendar note was filed separately; it contributes no behavioural evidence.','Separately, an invoice reference sat in routine paperwork and supplies no evidence about the response mechanism.','An unrelated admin record remained present; it adds no behavioural cue.','A routine shipping entry was stored elsewhere and provides no behavioural evidence.']
NEUTRAL_VI=['Một ghi chú lịch được lưu riêng; nó không cung cấp bằng chứng hành vi.','Riêng mã hóa đơn nằm trong giấy tờ thường ngày và không thêm evidence về cơ chế phản ứng.','Một record hành chính không liên quan vẫn tồn tại; nó không bổ sung cue hành vi.','Một mục vận chuyển thường lệ được cất riêng và không cung cấp bằng chứng hành vi.']
TAIL_EN=['Later that day, the unrelated background stayed unchanged.','Before the next routine check, that separate record remained unchanged.','During ordinary admin work, none of that background altered the mechanism.','After a normal break, the unrelated detail still added no signal.']
TAIL_VI=['Cuối ngày, background không liên quan đó vẫn không đổi.','Trước lần kiểm thường lệ tiếp theo, record riêng đó vẫn y nguyên.','Trong lúc làm admin bình thường, background đó không thay đổi cơ chế.','Sau một giờ nghỉ thông thường, chi tiết không liên quan vẫn không thêm signal.']
VARIANTS=['plain','prefix-neutral','suffix-neutral','sandwich-neutral','semicolon-neutral','reordered','mixed','negated-distractor','high-functioning','competing-cue']
cases=[]
for mi,m in enumerate(MECHS):
 for i in range(80):
  lang='EN' if i<32 else ('VI' if i<64 else 'MIX')
  base_idx=(i*3+mi)%4; nidx=(i+mi)%4;tidx=(i*2+mi)%4;variant=VARIANTS[i%len(VARIANTS)]
  if lang=='EN': b=BASE_EN[m][base_idx];n=NEUTRAL_EN[nidx];t=TAIL_EN[tidx]
  elif lang=='VI': b=BASE_VI[m][base_idx];n=NEUTRAL_VI[nidx];t=TAIL_VI[tidx]
  else:
   if i%2==0:b=BASE_EN[m][base_idx]+' '+NEUTRAL_VI[nidx];n='';t=TAIL_EN[tidx]
   else:b=BASE_VI[m][base_idx]+' '+NEUTRAL_EN[nidx];n='';t=TAIL_VI[tidx]
  if variant=='plain':s=b
  elif variant=='prefix-neutral':s=f'{n} {b}'
  elif variant=='suffix-neutral':s=f'{b} {n}'
  elif variant=='sandwich-neutral':s=f'{n} {b} {t}'
  elif variant=='semicolon-neutral':s=f'{b}; {n} {t}'
  elif variant=='reordered':s=f'{t} {b} {n}'
  elif variant=='mixed':s=f'{b} {n} {t}'
  elif variant=='negated-distractor':s=f'{b} {n} The separate record did not ask anyone to decide, predict, delay, or infer a hidden state.' if lang!='VI' else f'{b} {n} Record riêng không yêu cầu ai quyết định, dự đoán, trì hoãn hay suy ra trạng thái ẩn.'
  elif variant=='high-functioning':s=f'{b} {n} I remained otherwise organised and functional.' if lang!='VI' else f'{b} {n} Ngoài phần này tôi vẫn vận hành gọn và ổn định.'
  else:s=f'{b} {n} A future date and another person were mentioned only in the unrelated admin note, not as behavioural evidence.' if lang!='VI' else f'{b} {n} Một mốc tương lai và người khác chỉ xuất hiện trong ghi chú admin không liên quan, không phải evidence hành vi.'
  domain=DOMAINS[(i+mi)%6]
  cases.append({'case_id':f'V212-G{mi:02d}-{i:02d}','mechanism':m,'language':lang,'variant':variant,'domain':domain,'surface':s,'expected':{'route':ROUTES[m],'families':FAMS.get(m,[]),'sequence':m=='sequence'},'sealed_eligible':False})
assert len(cases)==800 and len({c['case_id'] for c in cases})==800
OUT.write_text(json.dumps({'authority':'V8.3.212 DEVELOPMENT GENERALIZATION 800 V1','seed':SEED,'sealed_eligible':False,'cases':cases},ensure_ascii=False,indent=2)+'\n')
print('generated',len(cases),Counter(c['mechanism'] for c in cases),Counter(c['language'] for c in cases))
