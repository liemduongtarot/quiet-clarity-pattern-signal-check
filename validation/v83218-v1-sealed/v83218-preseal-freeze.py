import json,hashlib,pathlib,subprocess,zipfile,re,os,shutil
R=pathlib.Path('.');O=R/'validation/v83218-v1-sealed';O.mkdir(parents=True,exist_ok=True)
DEV='9d946d3ddf8b98c2b3f80e1b5b849b12415381c2';SEMBASE='456a88d01b671f0cb92a0be31f4d34d68f60d135';SEED=8321841
C=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral'];D=['money','relationship','career','family','workplace','other']
E={'clarification':('input:clarification-required',[],0),'decision':('input:decision-request',[],0),'hypothetical':('input:hypothetical-or-example',[],0),'third':('input:third-party-only',[],0),'prediction':('input:prediction',[],0),'freeze':('input:self-lived',['freeze'],0),'ignore':('input:self-lived',['ignore'],0),'slow':('input:self-lived',['slow'],0),'sequence':('input:self-lived',['slow'],1),'neutral':('input:self-lived',[],0)}
EN={
'clarification':['The chronology is clear, but the last observable thing I myself did is missing, so my response cannot yet be classified.','Everything around the episode is documented except my own concrete behaviour at the point where it ended.','The record gives the setting and outcome, yet it omits what I actually did before closure.'],
'decision':['Make the final choice for me; I want your selection to replace my own decision.','Do not just help me weigh it—decide which option I should take and let that be the answer.','I am asking you to choose on my behalf rather than support a choice that remains mine.'],
'hypothetical':['This scenario is fabricated for testing and is not an event that happened to me.','Nothing in this example comes from my lived experience; it is intentionally synthetic validation text.','Use this as an invented test scenario only, not as evidence about something I personally experienced.'],
'third':['Tell me what the other person privately believes even though I have no observable conduct that reveals it.','Infer the hidden conclusion in someone else’s mind despite there being no words or actions that establish it.','I want the other person’s unspoken internal view when no outward behaviour gives evidence for that view.'],
'prediction':['Will the outcome I want happen at the future date I have in mind?','At the next specified future milestone, is this going to end in my preferred direction?','Looking ahead to that future cutoff, will events resolve the way I hope they will?'],
'freeze':['A small reversible first step was ready, but I kept expanding the alternatives and did not start.','I had a low-risk move I could undo, yet I continued comparing options instead of taking it.','There was a bounded starter action with an easy exit, but I added more possibilities and left it untouched.'],
'ignore':['The main responsibility still needed my action, but I spent effort on side work that could not resolve it.','I moved into peripheral tasks while the consequential issue was still waiting for my response.','The core obligation remained open because I redirected attention to secondary activity rather than dealing with it.'],
'slow':['I paused for one defined interval, checked the issue once, then finished the review and responded.','I allowed one bounded delay, made a single review pass, and treated the checking process as complete.','Before acting I took one limited pause, reviewed once, and then closed the matter without reopening it.'],
'sequence':['I got close to acting, withdrew, then returned to the same judgement even though no new evidence arrived.','I approached the practical move, backed away, and cycled through the same reasoning with unchanged facts.','I nearly executed the step, retreated, then revisited the identical conclusion without receiving new information.'],
'neutral':['I kept the decision as mine, completed the concrete step, and did not reopen the issue afterward.','I made my own final call, carried out the action, and left the matter closed once it was done.','Agency stayed with me; I finished the practical move and moved on rather than returning to it.']}
VI={
'clarification':['Diễn biến đã rõ, nhưng hành động quan sát được cuối cùng do chính tôi làm vẫn thiếu nên chưa thể phân loại response của tôi.','Mọi phần xung quanh sự việc đều có, ngoại trừ hành vi cụ thể của tôi tại điểm tình huống khép lại.','Record cho biết bối cảnh và kết quả nhưng chưa nói tôi thực sự đã làm gì trước lúc đóng chuyện.'],
'decision':['Hãy chốt lựa chọn cuối thay tôi; tôi muốn quyết định của bạn thay cho quyết định của chính mình.','Đừng chỉ giúp cân nhắc—hãy quyết định phương án tôi phải chọn và dùng nó làm câu trả lời cuối.','Tôi đang yêu cầu bạn chọn thay tôi chứ không phải hỗ trợ một lựa chọn vẫn do tôi tự chốt.'],
'hypothetical':['Scenario này được bịa để test và không phải chuyện từng xảy ra với tôi.','Không phần nào của ví dụ này đến từ trải nghiệm sống của tôi; đây là text validation tổng hợp có chủ ý.','Chỉ dùng đây như tình huống test hư cấu, không xem nó là evidence về chuyện tôi đã thật sự trải qua.'],
'third':['Hãy nói người kia âm thầm tin điều gì dù tôi không có hành vi quan sát được nào cho thấy điều đó.','Hãy suy ra kết luận kín trong đầu người khác mặc dù không có lời nói hay hành động nào xác lập nó.','Tôi muốn biết góc nhìn nội tâm chưa nói ra của người kia khi không có biểu hiện bên ngoài làm evidence.'],
'prediction':['Đến mốc tương lai tôi đang nghĩ tới, kết quả tôi muốn có xảy ra không?','Tại milestone tương lai tiếp theo đã xác định, chuyện này có kết thúc theo hướng tôi mong không?','Nhìn tới cutoff tương lai đó, mọi việc có khép lại đúng theo kết quả tôi hy vọng không?'],
'freeze':['Một bước đầu nhỏ và dễ đảo ngược đã sẵn, nhưng tôi cứ mở thêm lựa chọn rồi không bắt đầu.','Tôi có một nước đi ít rủi ro và có thể quay lại, vậy mà vẫn so thêm option thay vì làm nó.','Có một hành động mở đầu giới hạn với đường lui dễ, nhưng tôi thêm khả năng rồi để nguyên chưa thực hiện.'],
'ignore':['Trách nhiệm chính vẫn cần hành động của tôi, nhưng tôi dùng sức vào việc phụ không thể giải quyết nó.','Tôi chuyển sang các task bên lề trong khi vấn đề có hệ quả vẫn đang chờ response của mình.','Nghĩa vụ cốt lõi còn mở vì tôi dời chú ý sang hoạt động thứ yếu thay vì xử lý nó.'],
'slow':['Tôi dừng đúng một khoảng đã giới hạn, kiểm vấn đề một lần rồi kết thúc review và phản hồi.','Tôi cho phép một độ trễ có biên, xem lại một pass duy nhất rồi coi việc kiểm tra đã hoàn tất.','Trước khi hành động tôi tạm dừng một lần có giới hạn, review một lượt rồi đóng chuyện mà không mở lại.'],
'sequence':['Tôi tiến gần tới hành động, rút lại rồi quay về cùng phán đoán dù không có evidence mới.','Tôi tiếp cận bước thực tế, lùi ra và quay vòng cùng reasoning trong khi fact không đổi.','Tôi gần thực hiện nước đi, retreat rồi xem lại đúng kết luận cũ mà không nhận thêm thông tin.'],
'neutral':['Tôi giữ quyết định thuộc về mình, làm xong bước cụ thể và không mở lại vấn đề sau đó.','Tôi tự đưa ra chốt cuối, thực hiện hành động và để chuyện đóng khi đã hoàn tất.','Agency vẫn ở phía tôi; tôi hoàn thành nước đi thực tế rồi tiếp tục thay vì quay lại nó.']}
CTXE=['A laboratory freezer log recorded a calibration window and rack position.','A museum loan register noted a crate seal and gallery intake time.','A bicycle workshop tagged a repair stand with a service ticket number.','A community garden ledger listed tool-shed keys and watering slots.','A theatre wardrobe sheet tracked garment bags and return hooks.','A ferry terminal binder logged locker seals beside the crew roster.','A university media room indexed microphone cases by shelf code.','A bakery production board marked mixer cleaning and proofing batches.','A veterinary reception file held a kennel label and appointment token.','A library conservation cart carried folio sleeves and humidity tags.','A sports centre clipboard listed court nets and equipment cage keys.','A print studio docket recorded paper stock, plate numbers and drying racks.','A hotel linen room chart tracked trolley bays and laundry counts.','A makerspace cabinet sheet listed soldering stations and tool checkouts.','A florist delivery board recorded vase crates and collection windows.','A recording studio patch sheet logged cable lockers and microphone stands.','A school science cupboard inventory listed specimen trays and cabinet keys.','A food bank dispatch sheet tracked crate lanes and collection tickets.']
CTXV=['Nhật ký freezer phòng lab ghi cửa sổ calibration và vị trí rack.','Sổ mượn hiện vật bảo tàng ghi seal của crate và giờ tiếp nhận gallery.','Xưởng xe đạp gắn ticket dịch vụ cho từng repair stand.','Ledger vườn cộng đồng liệt kê chìa khóa tool-shed và khung giờ tưới.','Sheet wardrobe nhà hát theo dõi garment bag và móc hoàn trả.','Binder bến ferry ghi seal locker cạnh roster thủy thủ.','Phòng media đại học lập index hộp microphone theo mã kệ.','Board sản xuất bakery đánh dấu batch vệ sinh mixer và proofing.','File reception thú y giữ nhãn kennel cùng appointment token.','Xe conservation thư viện mang sleeve folio và thẻ humidity.','Clipboard trung tâm thể thao liệt kê lưới sân và chìa khóa equipment cage.','Docket print studio ghi paper stock, số plate và drying rack.','Chart phòng linen khách sạn theo dõi trolley bay và laundry count.','Sheet tủ makerspace liệt kê soldering station và lượt mượn tool.','Board giao hàng florist ghi vase crate và cửa sổ collection.','Patch sheet recording studio ghi cable locker và microphone stand.','Inventory tủ khoa học trường học liệt kê specimen tray và chìa khóa cabinet.','Sheet dispatch food bank theo dõi crate lane và collection ticket.']
EXE=['A red wax pencil marked the inspection column.','A brass tag identified the storage hook.','A laminated slip carried the weekly rotation code.','A grey clip separated completed forms from open ones.','A numbered sleeve held the duplicate docket.','A green cord tied the inventory card to its crate.','A small stamp recorded the handover station.','A paper band grouped the day’s receipts.','A plastic tab marked the equipment row.','A white label showed the return shelf.','A narrow envelope held the counterfoil copy.','A blue sticker identified the collection bin.','A binder flag marked the monthly count.','A metal token showed the locker section.','A kraft tag carried the dispatch sequence.','A clear pouch held the signed checklist.','A desk stamp marked the intake lane.','A black divider separated archived tickets.']
EXV=['Bút wax đỏ đánh dấu cột inspection.','Tag đồng nhận diện móc storage.','Slip laminate mang mã rotation theo tuần.','Clip xám tách form đã xong khỏi form còn mở.','Sleeve đánh số giữ docket bản sao.','Dây xanh buộc inventory card vào crate tương ứng.','Con dấu nhỏ ghi station bàn giao.','Dải giấy gom receipt trong ngày.','Tab nhựa đánh dấu hàng equipment.','Nhãn trắng chỉ return shelf.','Phong bì hẹp giữ bản counterfoil.','Sticker xanh nhận diện collection bin.','Cờ binder đánh dấu count theo tháng.','Token kim loại chỉ khu locker.','Tag kraft mang sequence dispatch.','Pouch trong giữ checklist đã ký.','Dấu bàn ghi intake lane.','Divider đen tách ticket đã archive.']
TAIL_E=['Those logistics only identify where the record sat; they do not establish my response.','That inventory detail is procedural context and cannot decide the behavioural classification.','The storage trace fixes location, not the mechanism being evaluated.','This operational marker does not supply evidence about the response itself.','The physical label belongs to record handling rather than the measured behaviour.','That administrative note helps chronology only and cannot determine the route.','The equipment reference remains external to the response evidence.','This filing detail is not a substitute for the behaviour the check is meant to classify.','The recorded object adds context but does not answer the mechanism question.','That routine handling detail cannot create a behavioural signal on its own.']
TAIL_V=['Chi tiết logistics đó chỉ cho biết record nằm ở đâu, không xác lập response của tôi.','Thông tin inventory này là context thủ tục và không thể quyết định classification hành vi.','Dấu vết storage cố định vị trí chứ không xác định cơ chế đang được đánh giá.','Marker vận hành này không cung cấp evidence về bản thân response.','Nhãn vật lý thuộc việc xử lý record chứ không phải hành vi đang được đo.','Ghi chú hành chính đó chỉ hỗ trợ chronology và không thể tự quyết route.','Reference equipment vẫn nằm ngoài evidence của response.','Chi tiết filing này không thay thế hành vi mà bài check cần phân loại.','Vật thể được ghi thêm context nhưng không trả lời câu hỏi về mechanism.','Chi tiết xử lý thường lệ đó không thể tự tạo behavioral signal.']
def surf(cat,i):
 lang='EN' if i<9 else 'VI';j=i%9;ci=C.index(cat);cores=EN if lang=='EN' else VI;ctx=CTXE if lang=='EN' else CTXV;ex=EXE if lang=='EN' else EXV;tail=TAIL_E if lang=='EN' else TAIL_V
 core=cores[cat][(j+2*ci)%3];c1=ctx[(j*2+ci)%18];c2=ex[(j*5+3*ci)%18];t=tail[(j+ci)%10]
 orders=[[core,c1,c2,t],[c1,t,core,c2],[c2,core,t,c1]][(j+ci)%3]
 return lang,' '.join(orders)
cs=[]
for ci,cat in enumerate(C):
 for i in range(18):
  lang,s=surf(cat,i);route,fam,seq=E[cat]
  cs.append({'case_id':f'V218-S{ci:02d}-{i:02d}','category':cat,'language':lang,'domain':D[(i+2*ci)%6],'surface':s,'expected':{'route':route,'families':fam,'sequence':bool(seq)}})
bank={'authority':'V8.3.218 V1 PRESEAL CANDIDATE BANK','seed':SEED,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'cases':cs}
sel=[]
for cat in C:
 g=[x for x in cs if x['category']==cat];sel += [g[k] for k in [0,3,6,9,12,15]]
a=[];b=[]
for cat in C:
 ids=[x['case_id'] for x in sel if x['category']==cat];a+=ids[::2];b+=ids[1::2]
selection={'authority':'V8.3.218 V1 SEALED SELECTION','seed':SEED,'selected':[x['case_id'] for x in sel],'batch_a':a,'batch_b':b}
fixture={'authority':'V8.3.218 V1 SEALED FIXTURE','cases':[{k:x[k] for k in ['case_id','category','language','domain','surface']} for x in sel]}
gold={'authority':'V8.3.218 V1 INDEPENDENT GOLD','cases':[{'case_id':x['case_id'],'expected':x['expected']} for x in sel]}
membership={'authority':'V8.3.218 V1 SEALED MEMBERSHIP','cases':[{'case_id':x['case_id'],'category':x['category'],'language':x['language'],'domain':x['domain'],'batch':'A' if x['case_id'] in a else 'B'} for x in sel]}
def tok(s):return set(re.findall(r'[a-z0-9]+',s.lower()))
def sim(x,y):
 A=tok(x);B=tok(y);return len(A&B)/len(A|B) if A|B else 1.0
def fp(s):return ' '.join(sorted(tok(s)))
ext=[]
for v in range(201,218):
 ss=str(v)[-2:];br=f'v832{ss}-v1-sealed-validation'
 subprocess.run(['git','fetch','--depth=1','origin',f'refs/heads/{br}:refs/remotes/origin/{br}'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 for n in [f'validation/v832{ss}-v1-sealed/V8_3_{v}_SEALED_FIXTURE_V1.json',f'validation/v832{ss}-v1-sealed/V8_3_{v}_PRESEAL_CANDIDATE_BANK_V1.json']:
  p=subprocess.run(['git','show',f'origin/{br}:{n}'],capture_output=True,text=True)
  if p.returncode==0:
   try:ext += [z['surface'] for z in json.loads(p.stdout).get('cases',[]) if z.get('surface')]
   except Exception:pass
internal=(-1,None)
for i in range(len(cs)):
 for j in range(i+1,len(cs)):
  q=sim(cs[i]['surface'],cs[j]['surface'])
  if q>internal[0]:internal=(q,[cs[i]['case_id'],cs[j]['case_id']])
external=(-1,None);ext75=0
for x in cs:
 best=0
 for y in ext:best=max(best,sim(x['surface'],y))
 if best>=.75:ext75+=1
 if best>external[0]:external=(best,x['case_id'])
exact=sum(1 for x in cs if x['surface'] in set(ext));extfps=set(fp(y) for y in ext);fpdups=sum(1 for x in cs if fp(x['surface']) in extfps)
audit={'authority':'V8.3.218 V1 PRESEAL DIVERSITY AUDIT','candidate_count':len(cs),'selected_count':len(sel),'batch_a_count':len(a),'batch_b_count':len(b),'internal_max_similarity':round(internal[0],6),'internal_max_pair':internal[1],'external_reference_surface_count':len(ext),'external_max_similarity':round(external[0],6),'external_max_case':external[1],'external_cases_at_or_above_0_75':ext75,'exact_external_duplicates':exact,'semantic_fingerprint_exact_duplicates':fpdups,'runtime_executed_during_bank_or_selection':False,'semantic_authority_loaded_during_bank_or_selection':False,'selection_uses_runtime_output':False}
audit['pass']=audit['internal_max_similarity']<.75 and audit['external_max_similarity']<.75 and ext75==0 and exact==0 and fpdups==0
objs={'PRESEAL_CANDIDATE_BANK':bank,'SEALED_SELECTION':selection,'SEALED_FIXTURE':fixture,'INDEPENDENT_GOLD':gold,'SEALED_MEMBERSHIP':membership,'PRESEAL_DIVERSITY_AUDIT':audit}
for n,o in objs.items():(O/f'V8_3_218_{n}_V1.json').write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
def can(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def hh(o):return hashlib.sha256(can(o)).hexdigest()
auth={'authority':'V8.3.218 V1 SEALED AUTHORITY','validated_development_head_sha':DEV,'semantic_base_sha':SEMBASE,'semantic_authority':'QCEvidenceExtractorV5X -> QCSemanticCoreV97','hash_contract':'canonical-json-sort-keys-compact','hashes':{'candidate_bank':hh(bank),'selection':hh(selection),'fixture':hh(fixture),'independent_gold':hh(gold),'membership':hh(membership),'preseal_audit':hh(audit)},'preseal_pass':audit['pass'],'semantic_change_from_v217':False,'v217_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False}
(O/'V8_3_218_SEALED_AUTHORITY_V1.json').write_text(json.dumps(auth,indent=2)+'\n')
receipt={'candidate':'V8.3.218','phase':'preseal-freeze-v1','run_id':int(os.environ.get('GITHUB_RUN_ID','0')),'validated_development_head_sha':DEV,'semantic_base_sha':SEMBASE,'semantic_authority':'QCEvidenceExtractorV5X -> QCSemanticCoreV97','candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':audit['internal_max_similarity'],'external_max_similarity':audit['external_max_similarity'],'external_cases_at_or_above_0_75':ext75,'exact_external_duplicates':exact,'semantic_fingerprint_exact_duplicates':fpdups,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'batch_a_executed':False,'batch_b_executed':False,'conclusion':'success' if audit['pass'] else 'failure'}
(O/'V8_3_218_PRESEAL_RUN_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n')
stage=R/'V8_3_218_PRESEAL_CHECKPOINT';shutil.rmtree(stage,ignore_errors=True);stage.mkdir()
for p in sorted(O.glob('V8_3_218_*.json')):shutil.copy2(p,stage/p.name)
def fsha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
(stage/'SHA256_MANIFEST.txt').write_text(''.join(f'{fsha(p)}  {p.name}\n' for p in sorted(stage.iterdir()) if p.is_file()))
z=R/'PSC_V8_3_218_V1_PRESEAL_CHECKPOINT.zip'
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as q:
 for p in sorted(stage.iterdir()):q.write(p,p.name)
(R/'PSC_V8_3_218_V1_PRESEAL_CHECKPOINT_SHA256.txt').write_text(f'{fsha(z)}  {z.name}\n')
print(json.dumps(receipt))
raise SystemExit(0 if audit['pass'] else 1)
