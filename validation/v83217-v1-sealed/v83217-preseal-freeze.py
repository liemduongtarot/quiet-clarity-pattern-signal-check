import json,hashlib,pathlib,subprocess,zipfile,os,re,shutil
R=pathlib.Path('.');O=R/'validation/v83217-v1-sealed';O.mkdir(parents=True,exist_ok=True)
DEV='456a88d01b671f0cb92a0be31f4d34d68f60d135';SEED=8321741
C=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral'];D=['money','relationship','career','family','workplace','other']
E={'clarification':('input:clarification-required',[],0),'decision':('input:decision-request',[],0),'hypothetical':('input:hypothetical-or-example',[],0),'third':('input:third-party-only',[],0),'prediction':('input:prediction',[],0),'freeze':('input:self-lived',['freeze'],0),'ignore':('input:self-lived',['ignore'],0),'slow':('input:self-lived',['slow'],0),'sequence':('input:self-lived',['slow'],1),'neutral':('input:self-lived',[],0)}
EN={
'clarification':['The event record is otherwise complete, but the concrete action I myself took at the closing point is still absent.','All external facts are accounted for; what remains unknown is my own observable response before the episode ended.','The situation can be reconstructed fully except for the visible behaviour that came from me at closure.'],
'decision':['Choose the route on my behalf and make your judgement the final selection instead of helping me make it myself.','Take the deciding role here: tell me which option to follow so your choice replaces my own final call.','I want you to make the choice for me, not merely give me a method for reaching my own decision.'],
'hypothetical':['This is deliberately invented validation text and does not describe anything that happened in my real life.','The paragraph is fabricated test material, explicitly unrelated to any lived episode of mine.','Treat this scenario as synthetic evaluation prose rather than personal history; I did not experience it.'],
'third':['Tell me the private belief of the other person even though nothing observable in their conduct provides evidence for it.','I want the other person’s hidden mental conclusion despite having no outward words or actions that establish it.','Infer what somebody else secretly thinks when no visible behaviour gives a basis for that internal state.'],
'prediction':['At the stated future cutoff, will this end with the result I want?','When the next defined future milestone arrives, is the eventual outcome going to favour me?','Looking ahead to the specified future point, will the matter close in the direction I am hoping for?'],
'freeze':['A low-commitment reversible starter action was available, but I kept adding alternatives and never began it.','There was an easy-to-reverse first move; instead of starting, I widened the option set again.','I had a small action with a clear way back, yet I kept comparing more choices and left it untouched.'],
'ignore':['The central obligation still required my answer, but I diverted effort into secondary activity and left the main duty unresolved.','The consequential issue was waiting for action from me while I occupied myself with peripheral work that could not settle it.','My response was still needed on the core matter, yet I shifted attention to side tasks and kept the primary responsibility open.'],
'slow':['I took one bounded interval before answering, reviewed the point a single time, and then closed the review.','There was one finite delay before my response; I checked once and treated the process as finished.','I allowed a limited pause, made one review pass, then considered the matter complete.'],
'sequence':['I moved close to acting, pulled away, and returned to the same judgement although no new facts had appeared.','I approached execution then backed off; afterward I repeated the same reasoning with unchanged evidence.','I neared the practical step, retreated, then cycled through the same assessment without receiving new information.'],
'neutral':['I kept final agency, completed the practical action, and left the issue closed afterward.','The decision remained mine; I carried the move through and did not reopen the matter.','I chose for myself, finished the concrete step, and moved on with the issue settled.']}
VI={
'clarification':['Record sự việc đã đầy đủ ở các phần khác, nhưng hành động cụ thể do chính tôi làm tại điểm khép lại vẫn còn thiếu.','Các fact bên ngoài đã đủ; phần chưa biết duy nhất là phản ứng quan sát được của tôi trước khi tình huống kết thúc.','Có thể dựng lại toàn bộ diễn biến ngoại trừ hành vi nhìn thấy được đến từ tôi ở lúc đóng lại.'],
'decision':['Hãy chọn hướng thay tôi và để phán đoán của bạn trở thành lựa chọn cuối, thay vì giúp tôi tự quyết.','Nhận vai trò quyết định ở đây: nói tôi phải theo phương án nào để lựa chọn của bạn thay quyền chốt của tôi.','Tôi muốn bạn quyết định thay, không chỉ đưa phương pháp để tôi tự đi đến kết luận.'],
'hypothetical':['Đây là text validation được cố ý bịa và không mô tả chuyện nào thật sự xảy ra trong đời tôi.','Đoạn này là dữ liệu test hư cấu, được tách rõ khỏi bất kỳ trải nghiệm sống nào của tôi.','Hãy xem scenario này là prose đánh giá tổng hợp chứ không phải lịch sử cá nhân; tôi chưa từng trải qua nó.'],
'third':['Hãy nói niềm tin riêng của người kia dù không có hành vi quan sát được nào của họ làm evidence cho điều đó.','Tôi muốn biết kết luận nội tâm bị giấu của người khác dù không có lời nói hay hành động bên ngoài nào xác lập nó.','Hãy suy ra người khác âm thầm nghĩ gì khi không có biểu hiện nhìn thấy được nào tạo căn cứ cho trạng thái đó.'],
'prediction':['Tại mốc tương lai đã nêu, chuyện này có kết thúc bằng kết quả tôi muốn không?','Khi milestone tương lai được xác định tiếp theo tới, outcome cuối có đi theo hướng có lợi cho tôi không?','Nhìn tới điểm tương lai cụ thể đã chỉ ra, việc này có khép lại theo hướng tôi đang mong không?'],
'freeze':['Có một hành động mở đầu ít cam kết và dễ đảo ngược, nhưng tôi cứ thêm phương án rồi không bắt đầu.','Một nước đi đầu có thể quay lại dễ dàng đã sẵn; thay vì làm, tôi lại mở rộng tập option.','Tôi có một bước nhỏ với đường lui rõ, nhưng cứ so thêm lựa chọn và để nó chưa được thực hiện.'],
'ignore':['Nghĩa vụ trung tâm vẫn cần câu trả lời của tôi, nhưng tôi chuyển sức sang hoạt động thứ yếu và để việc chính chưa giải quyết.','Vấn đề có hệ quả còn chờ hành động từ tôi trong khi tôi bận với việc bên lề không thể xử lý nó.','Phần cốt lõi vẫn cần phản hồi của tôi, vậy mà tôi dồn chú ý vào task phụ và để trách nhiệm chính còn mở.'],
'slow':['Tôi dùng đúng một khoảng thời gian hữu hạn trước khi đáp, xem lại một lần rồi đóng review.','Có một độ trễ giới hạn trước phản hồi; tôi kiểm một lượt duy nhất và xem quá trình đã xong.','Tôi cho mình một khoảng dừng có giới hạn, review một pass rồi coi vấn đề hoàn tất.'],
'sequence':['Tôi tiến sát tới hành động, rút lại rồi quay về cùng phán đoán dù không có fact mới.','Tôi tiếp cận execution rồi lùi ra; sau đó lặp lại cùng reasoning khi evidence không đổi.','Tôi đến gần bước thực tế, kéo ra rồi quay vòng cùng đánh giá mà không nhận thêm thông tin.'],
'neutral':['Tôi giữ quyền chốt cuối, hoàn tất hành động thực tế và để vấn đề đóng lại sau đó.','Quyết định vẫn thuộc về tôi; tôi làm xong nước đi và không mở lại chuyện này.','Tôi tự lựa chọn, hoàn thành bước cụ thể rồi tiếp tục với vấn đề đã được giải quyết.']}
CTXE=['A payroll archive retained a quarterly control sheet.','Facilities logged a key-card inventory on a maintenance tablet.','Recruitment stored an intake barcode inside a candidate folder.','A shared-flat noticeboard held a utilities rotation note.','Operations filed a shift handover sheet beside the rota board.','Records management indexed a storage carton under a retention code.','Finance clipped a settlement stub to the reconciliation packet.','The mail desk placed a routing label on the correspondence tray.','Reception kept a booking checklist beside the visitor register.']
CTXV=['Kho payroll giữ một control sheet theo quý.','Facilities ghi inventory thẻ khóa trên tablet bảo trì.','Recruitment lưu barcode tiếp nhận trong folder ứng viên.','Bảng noticeboard nhà chung giữ ghi chú luân phiên utilities.','Operations lưu sheet bàn giao ca cạnh bảng rota.','Records management lập index thùng storage theo retention code.','Finance ghim settlement stub vào packet đối soát.','Bàn mail đặt routing label trên khay thư từ.','Reception giữ checklist booking cạnh visitor register.']
TAIL_E=['That administrative item only locates the record.','The paperwork is procedural background rather than response evidence.','The stored reference does not determine the mechanism.','This logistics detail only fixes chronology.','The filing trace is separate from the behaviour being measured.','The archive note does not answer the response question.','Routine documentation provides operational context only.','The recorded marker cannot establish the behavioural classification.','That external detail remains outside the mechanism itself.']
TAIL_V=['Mục hành chính đó chỉ định vị record.','Giấy tờ này là background thủ tục chứ không phải evidence phản ứng.','Reference được lưu không quyết định cơ chế.','Chi tiết logistics này chỉ cố định chronology.','Dấu vết filing tách khỏi hành vi đang được đo.','Ghi chú archive không tự trả lời câu hỏi phản ứng.','Tài liệu thường lệ chỉ cung cấp context vận hành.','Marker đã ghi không thể tự xác lập classification hành vi.','Chi tiết bên ngoài đó nằm ngoài bản thân cơ chế.']
EXE=['A blue binder tab marked the filing month.','A courier pouch carried duplicate paperwork.','A scanner ledger counted the digitisation batch.','A magnetic calendar strip showed the household week.','A desk lanyard listed the staffing extension.','A carton label recorded the archive cycle.','A remittance envelope held the duplicate receipt.','A mail tray separated incoming notices.','A reception binder listed the visitor desk code.']
EXV=['Một tab binder xanh đánh dấu tháng filing.','Một túi courier mang bản sao giấy tờ.','Scanner ledger đếm batch số hóa.','Một dải lịch nam châm cho biết tuần household.','Thẻ lanyard bàn ghi extension staffing.','Nhãn carton ghi chu kỳ archive.','Phong bì remittance giữ receipt bản sao.','Khay mail tách notice đi vào.','Binder reception ghi mã visitor desk.']
def surf(cat,i):
 l='EN' if i<9 else 'VI';j=i%9;ci=C.index(cat);core=(EN if l=='EN' else VI)[cat][(j+ci)%3];ctx=(CTXE if l=='EN' else CTXV)[(j+2*ci)%9];tail=(TAIL_E if l=='EN' else TAIL_V)[(j+3*ci)%9];extra=(EXE if l=='EN' else EXV)[(2*j+ci)%9];parts=[[core,ctx,tail,extra],[ctx,extra,core,tail],[tail,core,extra,ctx]][(j+ci)%3];return l,' '.join(parts)
cs=[]
for ci,cat in enumerate(C):
 for i in range(18):
  l,s=surf(cat,i);r,f,q=E[cat];cs.append({'case_id':f'V217-S{ci:02d}-{i:02d}','category':cat,'language':l,'domain':D[(i+ci)%6],'surface':s,'expected':{'route':r,'families':f,'sequence':bool(q)}})
bank={'authority':'V8.3.217 V1 PRESEAL CANDIDATE BANK','seed':SEED,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'cases':cs}
sel=[]
for cat in C:
 g=[x for x in cs if x['category']==cat];sel += [g[k] for k in [0,3,6,9,12,15]]
a=[];b=[]
for cat in C:
 ids=[x['case_id'] for x in sel if x['category']==cat];a+=ids[::2];b+=ids[1::2]
selection={'authority':'V8.3.217 V1 SEALED SELECTION','seed':SEED,'selected':[x['case_id'] for x in sel],'batch_a':a,'batch_b':b}
fixture={'authority':'V8.3.217 V1 SEALED FIXTURE','cases':[{k:x[k] for k in ['case_id','category','language','domain','surface']} for x in sel]}
gold={'authority':'V8.3.217 V1 INDEPENDENT GOLD','cases':[{'case_id':x['case_id'],'expected':x['expected']} for x in sel]}
membership={'authority':'V8.3.217 V1 SEALED MEMBERSHIP','cases':[{'case_id':x['case_id'],'category':x['category'],'language':x['language'],'domain':x['domain'],'batch':'A' if x['case_id'] in a else 'B'} for x in sel]}
def tok(s):return set(re.findall(r'[a-z0-9]+',s.lower()))
def sim(x,y):
 A=tok(x);B=tok(y);return len(A&B)/len(A|B) if A|B else 1
def fp(s):return ' '.join(sorted(tok(s)))
ext=[]
for v in range(201,217):
 ss=str(v)[-2:];br=f'v832{ss}-v1-sealed-validation';subprocess.run(['git','fetch','--depth=1','origin',f'refs/heads/{br}:refs/remotes/origin/{br}'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 for n in [f'validation/v832{ss}-v1-sealed/V8_3_{v}_SEALED_FIXTURE_V1.json',f'validation/v832{ss}-v1-sealed/V8_3_{v}_PRESEAL_CANDIDATE_BANK_V1.json']:
  p=subprocess.run(['git','show',f'origin/{br}:{n}'],capture_output=True,text=True)
  if p.returncode==0:
   try:ext += [z['surface'] for z in json.loads(p.stdout).get('cases',[]) if z.get('surface')]
   except:pass
im=0;pair=None
for i,x in enumerate(cs):
 for y in cs[i+1:]:
  z=sim(x['surface'],y['surface'])
  if z>im:im=z;pair=[x['case_id'],y['case_id']]
em=0;ge=ex=fd=0;es=set(ext);ef={fp(x) for x in ext}
for x in cs:
 ex+=x['surface'] in es;fd+=fp(x['surface']) in ef
 for y in ext:
  z=sim(x['surface'],y);em=max(em,z);ge+=z>=.75
audit={'authority':'V8.3.217 V1 PRESEAL DIVERSITY AUDIT','candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':round(im,6),'internal_max_pair':pair,'external_reference_surface_count':len(ext),'external_max_similarity':round(em,6),'external_cases_at_or_above_0_75':ge,'exact_external_duplicates':ex,'semantic_fingerprint_exact_duplicates':fd,'runtime_executed_during_bank_or_selection':False,'semantic_authority_loaded_during_bank_or_selection':False,'selection_uses_runtime_output':False};audit['pass']=im<.75 and ge==0 and ex==0 and fd==0
def can(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def hh(o):return hashlib.sha256(can(o)).hexdigest()
objs={'candidate_bank':bank,'selection':selection,'fixture':fixture,'independent_gold':gold,'membership':membership,'preseal_audit':audit};names={'candidate_bank':'V8_3_217_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_217_SEALED_SELECTION_V1.json','fixture':'V8_3_217_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_217_INDEPENDENT_GOLD_V1.json','membership':'V8_3_217_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_217_PRESEAL_DIVERSITY_AUDIT_V1.json'}
for k,v in objs.items():(O/names[k]).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
auth={'authority':'V8.3.217 V1 SEALED AUTHORITY','validated_development_head_sha':DEV,'semantic_authority':'QCSemanticCoreV97','candidate_bank_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'hashes':{k:hh(v) for k,v in objs.items()},'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'step_111_authorized':False,'production_authorized':False,'preseal_pass':audit['pass']};(O/'V8_3_217_SEALED_AUTHORITY_V1.json').write_text(json.dumps(auth,indent=2)+'\n')
rec={'candidate':'V8.3.217','phase':'preseal-freeze-v1','run_id':int(os.environ.get('GITHUB_RUN_ID','0')),'validated_development_head_sha':DEV,'semantic_authority':'QCSemanticCoreV97','candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':audit['internal_max_similarity'],'external_max_similarity':audit['external_max_similarity'],'external_cases_at_or_above_0_75':ge,'exact_external_duplicates':ex,'semantic_fingerprint_exact_duplicates':fd,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'batch_a_executed':False,'batch_b_executed':False,'conclusion':'success' if audit['pass'] else 'failure'};(O/'V8_3_217_PRESEAL_RUN_RECEIPT.json').write_text(json.dumps(rec,indent=2)+'\n')
st=R/'V8_3_217_PRESEAL_CHECKPOINT';shutil.rmtree(st,ignore_errors=True);st.mkdir();
for p in O.glob('V8_3_217_*.json'):shutil.copy2(p,st/p.name)
(st/'SHA256_MANIFEST.txt').write_text(''.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n' for p in sorted(st.iterdir()) if p.is_file()));z=R/'PSC_V8_3_217_V1_PRESEAL_CHECKPOINT.zip'
if z.exists():z.unlink()
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as q:
 for p in sorted(st.iterdir()):q.write(p,p.name)
(R/'PSC_V8_3_217_V1_PRESEAL_CHECKPOINT_SHA256.txt').write_text(f'{hashlib.sha256(z.read_bytes()).hexdigest()}  {z.name}\n');print(json.dumps(rec,indent=2));raise SystemExit(0 if audit['pass'] else 1)
