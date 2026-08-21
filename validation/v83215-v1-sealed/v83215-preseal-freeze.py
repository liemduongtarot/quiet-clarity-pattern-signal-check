import json,hashlib,pathlib,subprocess,zipfile,os,re,shutil
R=pathlib.Path('.');O=R/'validation/v83215-v1-sealed';O.mkdir(parents=True,exist_ok=True)
DEV='e0ee7b03ad0dcdc616b242f6df810f4211e08baa'; SEED=8321529
C=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral']; D=['money','relationship','career','family','workplace','other']
E={'clarification':('input:clarification-required',[],0),'decision':('input:decision-request',[],0),'hypothetical':('input:hypothetical-or-example',[],0),'third':('input:third-party-only',[],0),'prediction':('input:prediction',[],0),'freeze':('input:self-lived',['freeze'],0),'ignore':('input:self-lived',['ignore'],0),'slow':('input:self-lived',['slow'],0),'sequence':('input:self-lived',['slow'],1),'neutral':('input:self-lived',[],0)}
EN={
'clarification':['The external story is complete, but it never states the observable action I personally took at closure.','Context and chronology are settled; only my own concrete response at the ending point is missing.'],
'decision':['I am transferring the choice itself: select the course I should take instead of helping me decide.','Choose my next move for me so your selection replaces my final call rather than merely guiding it.'],
'hypothetical':['This is fabricated evaluation prose, not an episode I have actually lived through.','The example is synthetic test material and does not come from my real-life history.'],
'third':['Infer another person’s unspoken belief even though no observable conduct or statement supports that hidden conclusion.','I am asking for someone else’s private view with nothing visible in what they said or did to ground it.'],
'prediction':['At the next defined future checkpoint, will this finish with the result I want?','At a specified future horizon, is the eventual outcome going to resolve in my favour?'],
'freeze':['A low-cost reversible first step was available, but I expanded alternatives instead of starting it.','An easy-exit trial was available; I added more options and left the reversible opening move unstarted.'],
'ignore':['The central obligation still needed my response, but I redirected effort into peripheral tasks that could not resolve it.','The main request was waiting on me; I shifted attention to side work and left the core responsibility unanswered.'],
'slow':['There was one bounded pause before I replied; I reviewed the point once and then treated the process as complete.','I took one finite extra interval before answering, checked the issue once, and then closed the review.'],
'sequence':['I moved close to execution, pulled back, then revisited the same judgement despite no new information.','I approached action and retreated; afterward I returned to the same reasoning while the facts stayed unchanged.'],
'neutral':['I made the choice myself, completed the practical action, and then left the matter closed.','I retained the final decision, carried the step through, and did not keep the issue open afterward.']}
VI={
'clarification':['Bối cảnh bên ngoài đã đầy đủ nhưng record không nêu hành động quan sát được nào do chính tôi thực hiện ở điểm kết thúc.','Dòng thời gian đã rõ; phần duy nhất còn thiếu là phản ứng cụ thể của tôi trước lúc sự việc khép lại.'],
'decision':['Tôi đang giao chính quyền lựa chọn: hãy chọn hướng tôi phải đi thay vì chỉ giúp tôi tự quyết.','Hãy chốt bước tiếp theo cho tôi để lựa chọn của bạn thay quyết định cuối của tôi, không chỉ đưa khung cân nhắc.'],
'hypothetical':['Đây là prose được bịa để đánh giá hệ thống, không lấy từ trải nghiệm nào tôi thực sự đã sống qua.','Ví dụ này là tình huống hư cấu dùng để test, không phải chuyện thật trong lịch sử sống của tôi.'],
'third':['Hãy suy ra niềm tin chưa nói của người khác dù không có hành vi hay lời nói quan sát được nào làm căn cứ.','Tôi hỏi về quan điểm riêng chưa bộc lộ của bên thứ ba, trong khi không có dấu hiệu bên ngoài chứng minh nó.'],
'prediction':['Tại checkpoint tương lai đã xác định tiếp theo, chuyện này có kết thúc với kết quả tôi muốn không?','Nhìn tới một mốc tương lai cụ thể, outcome cuối có giải quyết theo hướng có lợi cho tôi không?'],
'freeze':['Tôi có bước đầu rủi ro thấp và có thể quay lại dễ dàng, nhưng lại mở rộng phương án thay vì bắt đầu.','Có một phép thử dễ thoát và có thể đảo ngược; tôi thêm option rồi để bước mở đầu chưa khởi động.'],
'ignore':['Nghĩa vụ trung tâm vẫn cần phản hồi từ tôi, nhưng tôi chuyển công sức sang việc bên lề không thể giải quyết phần chính.','Yêu cầu cốt lõi còn chờ tôi xử lý; tôi dồn chú ý vào việc phụ và để trách nhiệm chính chưa được trả lời.'],
'slow':['Tôi có một khoảng dừng hữu hạn trước khi trả lời; review đúng một lượt rồi xem quá trình đã hoàn tất.','Tôi dùng thêm một khoảng thời gian có giới hạn trước phản hồi, kiểm một lần và sau đó đóng review.'],
'sequence':['Tôi tiến sát tới lúc thực hiện rồi rút lại, sau đó quay về cùng phán đoán dù không có thông tin mới.','Tôi đến gần execution rồi lùi ra; sau đó xem lại reasoning cũ trong khi dữ kiện không thay đổi.'],
'neutral':['Tôi tự đưa ra lựa chọn, thực hiện hành động đến hoàn tất rồi để vấn đề khép lại.','Tôi giữ quyền quyết định cuối, làm xong nước đi và không tiếp tục để chuyện đó mở.']}
CE=['Ledger reference already filed.','Meeting schedule already stored.','Application marker already logged.','Household logistics already recorded.','Rota identifier already present.','Admin reference already saved.','Invoice marker already present.','Thread timestamp already recorded.','Booking detail already filed.']
CV=['Mã ledger đã được lưu.','Lịch gặp đã có sẵn.','Marker hồ sơ đã được ghi.','Ghi chú sinh hoạt đã có.','Định danh rota đã lưu.','Mã hành chính đã có.','Marker invoice đã có.','Timestamp thread đã ghi.','Chi tiết booking đã lưu.']
TE=['This procedural detail only locates the record.','Routine paperwork is background, not behavioural evidence.','The admin marker does not decide the mechanism.','That logistics fact is separate from the measured response.','The stored reference only anchors chronology.']
TV=['Chi tiết thủ tục chỉ định vị record.','Giấy tờ thường lệ chỉ là bối cảnh, không phải evidence hành vi.','Marker hành chính không quyết định cơ chế.','Fact logistics tách biệt với phản ứng đang đo.','Mã lưu trữ chỉ neo dòng thời gian.']
def surf(cat,i):
 L='EN' if i<9 else 'VI';j=i%9; core=(EN if L=='EN' else VI)[cat][j%2];ctx=(CE if L=='EN' else CV)[j];tail=(TE if L=='EN' else TV)[(j+2*C.index(cat))%5]; parts=[[ctx,core,tail],[core,tail,ctx],[tail,ctx,core]][(j+C.index(cat))%3];return L,' '.join(parts)
cs=[]
for ci,cat in enumerate(C):
 for i in range(18):
  l,s=surf(cat,i);r,f,q=E[cat];cs.append({'case_id':f'V215-S{ci:02d}-{i:02d}','category':cat,'language':l,'domain':D[(i+ci)%6],'surface':s,'expected':{'route':r,'families':f,'sequence':bool(q)}})
bank={'authority':'V8.3.215 V1 PRESEAL CANDIDATE BANK','seed':SEED,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'cases':cs}
sel=[]
for cat in C:
 g=[x for x in cs if x['category']==cat];sel += [g[k] for k in [0,3,6,9,12,15]]
a=[];b=[]
for cat in C:
 ids=[x['case_id'] for x in sel if x['category']==cat];a+=ids[::2];b+=ids[1::2]
selection={'authority':'V8.3.215 V1 SEALED SELECTION','seed':SEED,'selected':[x['case_id'] for x in sel],'batch_a':a,'batch_b':b}
fixture={'authority':'V8.3.215 V1 SEALED FIXTURE','cases':[{k:x[k] for k in ['case_id','category','language','domain','surface']} for x in sel]}
gold={'authority':'V8.3.215 V1 INDEPENDENT GOLD','cases':[{'case_id':x['case_id'],'expected':x['expected']} for x in sel]}
membership={'authority':'V8.3.215 V1 SEALED MEMBERSHIP','cases':[{'case_id':x['case_id'],'category':x['category'],'language':x['language'],'domain':x['domain'],'batch':'A' if x['case_id'] in a else 'B'} for x in sel]}
def tok(s):return set(re.findall(r'[a-z0-9]+',s.lower()))
def sim(x,y):
 A=tok(x);B=tok(y);return len(A&B)/len(A|B) if A|B else 1
def fp(s):return ' '.join(sorted(tok(s)))
ext=[]
for v in range(201,215):
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
em=0;ge=0;ex=0;fd=0;es=set(ext);ef=set(fp(x) for x in ext)
for x in cs:
 if x['surface'] in es:ex+=1
 if fp(x['surface']) in ef:fd+=1
 for y in ext:
  z=sim(x['surface'],y);em=max(em,z);ge+=z>=.75
audit={'authority':'V8.3.215 V1 PRESEAL DIVERSITY AUDIT','candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':round(im,6),'internal_max_pair':pair,'external_reference_surface_count':len(ext),'external_max_similarity':round(em,6),'external_cases_at_or_above_0_75':ge,'exact_external_duplicates':ex,'semantic_fingerprint_exact_duplicates':fd,'runtime_executed_during_bank_or_selection':False,'semantic_authority_loaded_during_bank_or_selection':False,'selection_uses_runtime_output':False}
audit['pass']=im<.75 and ge==0 and ex==0 and fd==0
def can(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def hh(o):return hashlib.sha256(can(o)).hexdigest()
objs={'candidate_bank':bank,'selection':selection,'fixture':fixture,'independent_gold':gold,'membership':membership,'preseal_audit':audit};names={'candidate_bank':'V8_3_215_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_215_SEALED_SELECTION_V1.json','fixture':'V8_3_215_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_215_INDEPENDENT_GOLD_V1.json','membership':'V8_3_215_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_215_PRESEAL_DIVERSITY_AUDIT_V1.json'}
for k,v in objs.items():(O/names[k]).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
auth={'authority':'V8.3.215 V1 SEALED AUTHORITY','validated_development_head_sha':DEV,'semantic_authority':'QCSemanticCoreV95','candidate_bank_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'hashes':{k:hh(v) for k,v in objs.items()},'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'step_111_authorized':False,'production_authorized':False,'preseal_pass':audit['pass']};(O/'V8_3_215_SEALED_AUTHORITY_V1.json').write_text(json.dumps(auth,indent=2)+'\n')
rec={'candidate':'V8.3.215','phase':'preseal-freeze-v1','run_id':int(os.environ.get('GITHUB_RUN_ID','0')),'validated_development_head_sha':DEV,'semantic_authority':'QCSemanticCoreV95','candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':audit['internal_max_similarity'],'external_max_similarity':audit['external_max_similarity'],'external_cases_at_or_above_0_75':ge,'exact_external_duplicates':ex,'semantic_fingerprint_exact_duplicates':fd,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'batch_a_executed':False,'batch_b_executed':False,'conclusion':'success' if audit['pass'] else 'failure'};(O/'V8_3_215_PRESEAL_RUN_RECEIPT.json').write_text(json.dumps(rec,indent=2)+'\n')
st=R/'V8_3_215_PRESEAL_CHECKPOINT';shutil.rmtree(st,ignore_errors=True);st.mkdir();
for p in O.glob('V8_3_215_*.json'):shutil.copy2(p,st/p.name)
(st/'SHA256_MANIFEST.txt').write_text(''.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n' for p in sorted(st.iterdir()) if p.is_file()));z=R/'PSC_V8_3_215_V1_PRESEAL_CHECKPOINT.zip';
if z.exists():z.unlink()
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as q:
 for p in sorted(st.iterdir()):q.write(p,p.name)
(R/'PSC_V8_3_215_V1_PRESEAL_CHECKPOINT_SHA256.txt').write_text(f'{hashlib.sha256(z.read_bytes()).hexdigest()}  {z.name}\n');print(json.dumps(rec,indent=2));raise SystemExit(0 if audit['pass'] else 1)
