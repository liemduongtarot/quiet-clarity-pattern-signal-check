import json,hashlib,pathlib,subprocess,zipfile,os,re,shutil
R=pathlib.Path('.'); O=R/'validation/v83216-v1-sealed'; O.mkdir(parents=True,exist_ok=True)
DEV='8f69213bda48583d94f5c9128ecb5cd6f6832d63'; SEED=8321637
C=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral']; D=['money','relationship','career','family','workplace','other']
E={'clarification':('input:clarification-required',[],0),'decision':('input:decision-request',[],0),'hypothetical':('input:hypothetical-or-example',[],0),'third':('input:third-party-only',[],0),'prediction':('input:prediction',[],0),'freeze':('input:self-lived',['freeze'],0),'ignore':('input:self-lived',['ignore'],0),'slow':('input:self-lived',['slow'],0),'sequence':('input:self-lived',['slow'],1),'neutral':('input:self-lived',[],0)}
EN={
'clarification':['The practical history is traceable, yet the account never identifies what visible response came from me at the point it ended.','Everything external is specified; the unresolved gap is the concrete act I personally supplied before closure.','The sequence of events is complete, while my own observable behaviour at the final moment remains unstated.'],
'decision':['Take over the final choice in this situation and tell me which course to follow, rather than helping me weigh it myself.','I am handing you the deciding role: choose the next direction on my behalf instead of leaving the final call with me.','Make the selection for me so your judgement determines the route I take, not merely the framework I use.'],
'hypothetical':['This passage was invented solely as evaluation material and is not drawn from any event I actually experienced.','Treat this as fabricated test prose rather than lived history; the described episode never happened to me.','The scenario is synthetic validation text, explicitly separate from my real experience.'],
'third':['Identify the other person’s private conclusion even though there is no observable action or statement supporting that internal view.','I am asking what someone else secretly believes while providing no outward behaviour that could establish it.','Infer a third party’s unspoken mental position despite the absence of visible evidence for that belief.'],
'prediction':['At a defined future milestone, will the matter end with the result I am hoping for?','Looking to the next specified future point, is the eventual outcome going to resolve in my favour?','When the stated future boundary arrives, will this conclude with the outcome I want?'],
'freeze':['A reversible low-stakes opening move was available, yet I kept expanding alternatives and never started the trial.','I had an easy-to-undo first action, but I added more options instead of initiating it.','A small step with a clear exit existed; I broadened the choice set and left that opening action untouched.'],
'ignore':['The main obligation still required my response, but I moved effort into peripheral tasks that could not settle it.','A consequential request remained mine to answer; I redirected attention to side activity and left the central duty open.','The core issue was waiting on my action while I occupied myself with lower-impact work around it.'],
'slow':['I allowed one finite pause before responding, reviewed the point once, and then considered the review complete.','There was a bounded delay before my reply; I checked the issue a single time and closed the process.','I used one limited interval before answering, made one review pass, and then treated the matter as finished.'],
'sequence':['I moved near taking action, backed away, then returned to the same judgement even though no new facts appeared.','I approached execution and retreated; afterward I repeated the same reasoning while the evidence stayed unchanged.','I came close to doing it, pulled back, and cycled through the same assessment without receiving new information.'],
'neutral':['I kept the decision with myself, completed the practical step, and then left the matter closed.','The final choice remained mine; I carried the action through and did not reopen the issue afterward.','I chose independently, finished the concrete move, and moved on with the matter settled.']}
VI={
'clarification':['Diễn biến bên ngoài đã đủ rõ, nhưng record vẫn không xác định phản ứng nhìn thấy được nào do chính tôi thực hiện ở thời điểm kết thúc.','Toàn bộ bối cảnh thực tế đã có; khoảng trống còn lại là hành động cụ thể của tôi trước khi sự việc khép lại.','Chuỗi sự kiện đã hoàn chỉnh, trong khi hành vi quan sát được của riêng tôi ở điểm cuối vẫn chưa được nêu.'],
'decision':['Hãy nhận quyền chốt cuối trong lựa chọn này và nói tôi phải đi theo hướng nào, thay vì chỉ hỗ trợ tôi tự cân nhắc.','Tôi đang giao vai trò quyết định cho bạn: chọn bước tiếp theo thay tôi thay vì để quyền chốt cuối ở phía tôi.','Hãy đưa ra lựa chọn thay tôi để phán đoán của bạn quyết định con đường tôi đi, không chỉ cung cấp khung suy nghĩ.'],
'hypothetical':['Đoạn này được bịa riêng để làm dữ liệu đánh giá và không lấy từ bất kỳ chuyện nào tôi thực sự trải qua.','Đây là prose test hư cấu chứ không phải lịch sử sống; tình huống mô tả chưa từng xảy ra với tôi.','Scenario này là text validation tổng hợp, được tách rõ khỏi trải nghiệm thật của tôi.'],
'third':['Hãy xác định kết luận riêng của người kia dù không có hành động hay lời nói quan sát được nào hỗ trợ trạng thái nội tâm đó.','Tôi đang hỏi người khác âm thầm tin gì trong khi không đưa ra hành vi bên ngoài nào có thể làm căn cứ.','Hãy suy ra vị trí tinh thần chưa nói của một bên thứ ba dù hoàn toàn thiếu evidence nhìn thấy được cho niềm tin đó.'],
'prediction':['Tại một mốc tương lai đã xác định, chuyện này có kết thúc với kết quả tôi đang mong muốn không?','Nhìn tới điểm tương lai cụ thể tiếp theo, outcome cuối có giải quyết theo hướng có lợi cho tôi không?','Khi ranh giới tương lai đã nêu tới, việc này có khép lại bằng kết quả tôi muốn không?'],
'freeze':['Có một nước đi mở đầu ít rủi ro và dễ đảo ngược, nhưng tôi cứ mở rộng phương án rồi không bắt đầu phép thử.','Tôi có hành động đầu tiên dễ hoàn tác, nhưng lại thêm lựa chọn thay vì khởi động nó.','Một bước nhỏ có đường lui rõ đã sẵn sàng; tôi tăng tập option và để bước mở đầu chưa thực hiện.'],
'ignore':['Nghĩa vụ chính vẫn cần phản hồi của tôi, nhưng tôi chuyển công sức sang task bên lề không thể giải quyết nó.','Một yêu cầu có hệ quả vẫn do tôi phải trả lời; tôi dồn chú ý vào hoạt động phụ và để trách nhiệm trung tâm còn mở.','Vấn đề cốt lõi đang chờ hành động của tôi trong khi tôi bận với công việc tác động thấp xung quanh.'],
'slow':['Tôi để một khoảng dừng hữu hạn trước khi trả lời, xem lại đúng một lượt rồi coi review đã hoàn tất.','Có một độ trễ có giới hạn trước phản hồi; tôi kiểm vấn đề một lần duy nhất rồi đóng quá trình.','Tôi dùng một khoảng thời gian giới hạn trước khi đáp, review một pass và sau đó xem việc này đã kết thúc.'],
'sequence':['Tôi tiến gần tới hành động rồi lùi lại, sau đó quay về cùng phán đoán dù không xuất hiện facts mới.','Tôi tiếp cận execution rồi rút ra; sau đó lặp lại reasoning cũ trong khi evidence vẫn không đổi.','Tôi đến sát bước làm, kéo mình ra và quay vòng cùng đánh giá mà không nhận thêm thông tin.'],
'neutral':['Tôi giữ quyền quyết định ở mình, hoàn tất nước đi thực tế rồi để vấn đề khép lại.','Quyền chốt cuối vẫn thuộc về tôi; tôi làm xong hành động và không mở lại chuyện đó sau đó.','Tôi tự lựa chọn, hoàn thành bước cụ thể và tiếp tục đi với vấn đề đã được đóng.']}
EN_CTX=['A document pouch was archived after monthly reconciliation.','The reception desk retained a room-allocation worksheet.','An intake checklist was placed in the recruitment cabinet.','A shared-house calendar note remained on the kitchen board.','The duty desk stored a printed staffing roster.','Records control filed a retention label with the archive box.','Accounts attached a remittance cover sheet to the packet.','The mailroom indexed correspondence under a routing slip.','Booking staff kept an appointment cover note in reception.']
VI_CTX=['Một túi hồ sơ được lưu sau kỳ đối soát tháng.','Quầy tiếp tân giữ một worksheet phân phòng.','Checklist tiếp nhận được đặt trong tủ tuyển dụng.','Một ghi chú lịch nhà chung vẫn nằm trên bảng bếp.','Bàn duty lưu bản in roster nhân sự.','Records control lưu nhãn retention cùng hộp archive.','Accounts gắn cover sheet remittance vào packet.','Mailroom lập chỉ mục thư từ dưới routing slip.','Nhân viên booking giữ cover note lịch hẹn tại reception.']
EN_TAIL=['The filing detail only identifies where the record sits.','That paperwork describes administration rather than behavioural evidence.','The stored note fixes logistics, not the response mechanism.','This background item only anchors chronology.','The procedural record is separate from the behaviour being classified.','The archive detail does not answer the mechanism question.','Routine documentation supplies location context only.','The operational note does not establish the response itself.','The filing trace is administrative background only.']
VI_TAIL=['Chi tiết lưu trữ chỉ cho biết record nằm ở đâu.','Giấy tờ đó mô tả thủ tục chứ không phải evidence hành vi.','Ghi chú lưu trữ chỉ cố định logistics, không quyết định cơ chế phản ứng.','Mục bối cảnh này chỉ neo dòng thời gian.','Record thủ tục tách biệt với hành vi đang được phân loại.','Chi tiết archive không tự trả lời câu hỏi cơ chế.','Tài liệu thường lệ chỉ cung cấp context định vị.','Ghi chú vận hành không xác lập bản thân phản ứng.','Dấu vết filing chỉ là background hành chính.']
EXTRA_EN=['A separate ledger index was closed for the period.','A laminated access card remained with facilities.','The courier manifest was signed at dispatch.','A scanner queue logged the document count.','A cabinet inventory listed the storage shelf.','A desk extension appeared on the internal directory.','A supplies checklist was initialled by reception.','A folder tab marked the quarterly archive.','A timestamp label was printed by records control.','A barcode sheet accompanied the intake packet.']
EXTRA_VI=['Một ledger index riêng đã đóng cho kỳ đó.','Một thẻ access ép nhựa vẫn ở bộ phận facilities.','Courier manifest đã được ký lúc dispatch.','Scanner queue ghi lại số lượng tài liệu.','Inventory tủ liệt kê vị trí kệ storage.','Số extension bàn làm việc có trên directory nội bộ.','Checklist vật tư được reception ký nháy.','Một folder tab đánh dấu archive theo quý.','Records control in một nhãn timestamp.','Một barcode sheet đi cùng intake packet.']
def surf(cat,i):
 lang='EN' if i<9 else 'VI'; j=i%9; ci=C.index(cat); core=(EN if lang=='EN' else VI)[cat][(j+ci)%3]; ctx=(EN_CTX if lang=='EN' else VI_CTX)[(j+2*ci)%9]; tail=(EN_TAIL if lang=='EN' else VI_TAIL)[(2*j+ci)%9]; extra=(EXTRA_EN if lang=='EN' else EXTRA_VI)[(j+ci)%10]; parts=[[core,ctx,tail,extra],[ctx,extra,core,tail],[tail,core,extra,ctx]][(j+ci)%3]; return lang,' '.join(parts)
cs=[]
for ci,cat in enumerate(C):
 for i in range(18):
  l,s=surf(cat,i); r,f,q=E[cat]; cs.append({'case_id':f'V216-S{ci:02d}-{i:02d}','category':cat,'language':l,'domain':D[(i+2*ci)%6],'surface':s,'expected':{'route':r,'families':f,'sequence':bool(q)}})
bank={'authority':'V8.3.216 V1 PRESEAL CANDIDATE BANK','seed':SEED,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'cases':cs}
sel=[]
for cat in C:
 g=[x for x in cs if x['category']==cat]; sel += [g[k] for k in [1,4,7,10,13,16]]
a=[];b=[]
for cat in C:
 ids=[x['case_id'] for x in sel if x['category']==cat]; a+=ids[::2]; b+=ids[1::2]
selection={'authority':'V8.3.216 V1 SEALED SELECTION','seed':SEED,'selected':[x['case_id'] for x in sel],'batch_a':a,'batch_b':b}
fixture={'authority':'V8.3.216 V1 SEALED FIXTURE','cases':[{k:x[k] for k in ['case_id','category','language','domain','surface']} for x in sel]}
gold={'authority':'V8.3.216 V1 INDEPENDENT GOLD','cases':[{'case_id':x['case_id'],'expected':x['expected']} for x in sel]}
membership={'authority':'V8.3.216 V1 SEALED MEMBERSHIP','cases':[{'case_id':x['case_id'],'category':x['category'],'language':x['language'],'domain':x['domain'],'batch':'A' if x['case_id'] in a else 'B'} for x in sel]}
def tok(s): return set(re.findall(r'[a-z0-9]+',s.lower()))
def sim(x,y):
 A=tok(x);B=tok(y);return len(A&B)/len(A|B) if A|B else 1
def fp(s): return ' '.join(sorted(tok(s)))
ext=[]
for v in range(201,216):
 ss=str(v)[-2:]; br=f'v832{ss}-v1-sealed-validation'; subprocess.run(['git','fetch','--depth=1','origin',f'refs/heads/{br}:refs/remotes/origin/{br}'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 for n in [f'validation/v832{ss}-v1-sealed/V8_3_{v}_SEALED_FIXTURE_V1.json',f'validation/v832{ss}-v1-sealed/V8_3_{v}_PRESEAL_CANDIDATE_BANK_V1.json']:
  p=subprocess.run(['git','show',f'origin/{br}:{n}'],capture_output=True,text=True)
  if p.returncode==0:
   try: ext += [z['surface'] for z in json.loads(p.stdout).get('cases',[]) if z.get('surface')]
   except: pass
im=0;pair=None
for i,x in enumerate(cs):
 for y in cs[i+1:]:
  z=sim(x['surface'],y['surface'])
  if z>im: im=z;pair=[x['case_id'],y['case_id']]
em=0;ge=0;ex=0;fd=0;es=set(ext);ef=set(fp(x) for x in ext)
for x in cs:
 if x['surface'] in es:ex+=1
 if fp(x['surface']) in ef:fd+=1
 for y in ext:
  z=sim(x['surface'],y);em=max(em,z);ge+=z>=.75
audit={'authority':'V8.3.216 V1 PRESEAL DIVERSITY AUDIT','candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':round(im,6),'internal_max_pair':pair,'external_reference_surface_count':len(ext),'external_max_similarity':round(em,6),'external_cases_at_or_above_0_75':ge,'exact_external_duplicates':ex,'semantic_fingerprint_exact_duplicates':fd,'runtime_executed_during_bank_or_selection':False,'semantic_authority_loaded_during_bank_or_selection':False,'selection_uses_runtime_output':False}
audit['pass']=im<.75 and ge==0 and ex==0 and fd==0
def can(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def hh(o):return hashlib.sha256(can(o)).hexdigest()
objs={'candidate_bank':bank,'selection':selection,'fixture':fixture,'independent_gold':gold,'membership':membership,'preseal_audit':audit}; names={'candidate_bank':'V8_3_216_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_216_SEALED_SELECTION_V1.json','fixture':'V8_3_216_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_216_INDEPENDENT_GOLD_V1.json','membership':'V8_3_216_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_216_PRESEAL_DIVERSITY_AUDIT_V1.json'}
for k,v in objs.items():(O/names[k]).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
auth={'authority':'V8.3.216 V1 SEALED AUTHORITY','validated_development_head_sha':DEV,'semantic_authority':'QCSemanticCoreV96','candidate_bank_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'hashes':{k:hh(v) for k,v in objs.items()},'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'step_111_authorized':False,'production_authorized':False,'preseal_pass':audit['pass']}; (O/'V8_3_216_SEALED_AUTHORITY_V1.json').write_text(json.dumps(auth,indent=2)+'\n')
rec={'candidate':'V8.3.216','phase':'preseal-freeze-v1','run_id':int(os.environ.get('GITHUB_RUN_ID','0')),'validated_development_head_sha':DEV,'semantic_authority':'QCSemanticCoreV96','candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':audit['internal_max_similarity'],'external_max_similarity':audit['external_max_similarity'],'external_cases_at_or_above_0_75':ge,'exact_external_duplicates':ex,'semantic_fingerprint_exact_duplicates':fd,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'batch_a_executed':False,'batch_b_executed':False,'conclusion':'success' if audit['pass'] else 'failure'}; (O/'V8_3_216_PRESEAL_RUN_RECEIPT.json').write_text(json.dumps(rec,indent=2)+'\n')
st=R/'V8_3_216_PRESEAL_CHECKPOINT';shutil.rmtree(st,ignore_errors=True);st.mkdir()
for p in O.glob('V8_3_216_*.json'):shutil.copy2(p,st/p.name)
(st/'SHA256_MANIFEST.txt').write_text(''.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n' for p in sorted(st.iterdir()) if p.is_file()))
z=R/'PSC_V8_3_216_V1_PRESEAL_CHECKPOINT.zip';
if z.exists():z.unlink()
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as q:
 for p in sorted(st.iterdir()):q.write(p,p.name)
(R/'PSC_V8_3_216_V1_PRESEAL_CHECKPOINT_SHA256.txt').write_text(f'{hashlib.sha256(z.read_bytes()).hexdigest()}  {z.name}\n')
print(json.dumps(rec,indent=2));raise SystemExit(0 if audit['pass'] else 1)
