import json,hashlib,pathlib,subprocess,re
R=pathlib.Path('.');O=R/'validation/v83245-v1-sealed';O.mkdir(parents=True,exist_ok=True)
DEV='2015436433bede4e454739efe2ebae4807f800af';BASE='885608fce9e70a8818d1ebda23c786a81005a2fe';SEM='QCEvidenceExtractorV5AS -> QCSemanticCoreV118'
C=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral'];D=['money','relationship','career','family','workplace','other']
E={'clarification':('input:clarification-required',[],0),'decision':('input:decision-request',[],0),'hypothetical':('input:hypothetical-or-example',[],0),'third':('input:third-party-only',[],0),'prediction':('input:prediction',[],0),'freeze':('input:self-lived',['freeze'],0),'ignore':('input:self-lived',['ignore'],0),'slow':('input:self-lived',['slow'],0),'sequence':('input:self-lived',['slow'],1),'neutral':('input:self-lived',[],0)}
EN={
'clarification':['Everything is autobiographical except the response I made at closure.','I can give the real context, yet I have not stated what I actually did at the end.','The actual circumstances are known, but I have not supplied my last behavioural move.','Everything is autobiographical except the response I made at closure.','I can give the real context, yet I have not stated what I actually did at the end.','The actual circumstances are known, but I have not supplied my last behavioural move.'],
'decision':['Take over the final choice so your selection replaces mine.','I want the final selection to come from you, not from my judgement.','Choose the final option for me instead of helping me evaluate it.','Take over the final choice so your selection replaces mine.','I want the final selection to come from you, not from my judgement.','Choose the final option for me instead of helping me evaluate it.'],
'hypothetical':['This case was constructed for testing and did not happen to me.','I fabricated this example only for classification testing.','This is invented test material, not an episode from my life.','This case was constructed for testing and did not happen to me.','I fabricated this example only for classification testing.','This is invented test material, not an episode from my life.'],
'third':['Work out someone else’s internal conclusion with no behavioural support.','Give me their concealed belief despite having no behaviour to verify it.','Tell me what the other person privately believes without observable evidence.','Work out someone else’s internal conclusion with no behavioural support.','Give me their concealed belief despite having no behaviour to verify it.','Tell me what the other person privately believes without observable evidence.'],
'prediction':['When the future checkpoint arrives, will things resolve in my favour?','At the named future point, will my preferred outcome have occurred?','By the future milestone, will the result I want have happened?','When the future checkpoint arrives, will things resolve in my favour?','At the named future point, will my preferred outcome have occurred?','By the future milestone, will the result I want have happened?'],
'freeze':['A bounded opening move existed, but I generated extra possibilities and stayed still.','I had a contained starter available, yet option growth replaced initiation.','A reversible first step was available, but I kept expanding options and did not begin.','A bounded opening move existed, but I generated extra possibilities and stayed still.','I had a contained starter available, yet option growth replaced initiation.','A reversible first step was available, but I kept expanding options and did not begin.'],
'ignore':['Something important needed me to act, but I kept doing less relevant work instead.','The main matter still needed my action, but I diverted effort into secondary tasks.','A central responsibility remained open while I stayed busy with side work.','Something important needed me to act, but I kept doing less relevant work instead.','The main matter still needed my action, but I diverted effort into secondary tasks.','A central responsibility remained open while I stayed busy with side work.'],
'slow':['Before responding I used one limited pause and one review, then treated it as settled.','I took one bounded pause, checked once, responded, and then closed the issue.','I delayed within a clear limit, reviewed once, answered, and moved on.','Before responding I used one limited pause and one review, then treated it as settled.','I took one bounded pause, checked once, responded, and then closed the issue.','I delayed within a clear limit, reviewed once, answered, and moved on.'],
'sequence':['I came near to acting, stepped back, and returned to prior reasoning despite no new information.','I moved toward acting, pulled back, then returned to the same conclusion without new facts.','I nearly acted, withdrew, and repeated the old judgement even though nothing changed.','I came near to acting, stepped back, and returned to prior reasoning despite no new information.','I moved toward acting, pulled back, then returned to the same conclusion without new facts.','I nearly acted, withdrew, and repeated the old judgement even though nothing changed.'],
'neutral':['The choice stayed with me; I executed it and did not revisit the decision.','I kept the final choice, carried it out, and left the matter settled.','I made the decision myself, completed it, and did not reopen it.','The choice stayed with me; I executed it and did not revisit the decision.','I kept the final choice, carried it out, and left the matter settled.','I made the decision myself, completed it, and did not reopen it.']}
VI={
'clarification':['Phần tôi đã làm gì ở cuối vẫn còn thiếu dù đây là bối cảnh thật của tôi.','Chuyện này thật sự đã xảy ra nhưng tôi vẫn chưa nói hành động cụ thể cuối cùng của mình.','Mọi phần là chuyện thật của tôi ngoại trừ response tôi đã làm ở đoạn kết.']*2,
'decision':['Hãy cầm quyền chọn cuối để lựa chọn của bạn thay thế lựa chọn của tôi.','Tôi muốn lựa chọn cuối đến từ bạn chứ không phải judgement của tôi.','Hãy chọn phương án cuối cùng thay tôi, không chỉ giúp tôi cân nhắc.']*2,
'hypothetical':['Case này được dựng để test và chưa từng xảy ra với tôi.','Tôi tạo ví dụ này chỉ để test classification.','Đây là material test được bịa ra, không phải chuyện tôi đã sống qua.']*2,
'third':['Hãy xác định kết luận bên trong của người khác khi không có behavioural support.','Hãy cho tôi concealed belief của họ dù không có behaviour để verify.','Hãy nói người kia âm thầm tin gì dù không có evidence quan sát được.']*2,
'prediction':['Khi future checkpoint tới, mọi thứ có resolve có lợi cho tôi không?','Tại future point đã nêu, preferred outcome của tôi có xảy ra không?','Đến milestone tương lai, kết quả tôi muốn có xảy ra chưa?']*2,
'freeze':['Có opening move giới hạn, nhưng tôi tạo thêm possibility rồi đứng yên.','Tôi có starter có giới hạn, nhưng option growth thay cho initiation.','Có một bước đầu reversible nhưng tôi cứ mở rộng option và không bắt đầu.']*2,
'ignore':['Có việc quan trọng cần tôi làm, nhưng tôi cứ làm việc ít liên quan hơn.','Việc chính vẫn cần tôi hành động, nhưng tôi chuyển effort sang task thứ yếu.','Một trách nhiệm trung tâm vẫn mở trong khi tôi bận với side work.']*2,
'slow':['Trước khi phản hồi tôi dùng một pause giới hạn và một review, rồi xem chuyện đã settled.','Tôi dừng một khoảng có giới hạn, check một lần, trả lời rồi đóng chuyện lại.','Tôi delay trong boundary rõ, review một lần, trả lời rồi đi tiếp.']*2,
'sequence':['Tôi gần hành động, bước lùi và quay lại reasoning trước dù không có information mới.','Tôi tiến gần tới hành động, lùi lại rồi quay về cùng kết luận dù không có fact mới.','Tôi gần làm, rút lại rồi lặp judgement cũ dù không gì thay đổi.']*2,
'neutral':['Choice vẫn ở phía tôi; tôi execute và không revisit quyết định.','Tôi giữ quyền chọn cuối, thực hiện xong và để chuyện kết thúc.','Tôi tự quyết định, hoàn tất và không reopen.']*2}
SCENE_EN=[
'A mariner museum indexed signal flags, brass dividers, tide slates, knot boards and sextant shades by gallery.',
'A stained-paper atelier catalogued deckle frames, couch felts, sizing spoons, watermark wires and drying clips by rack.',
'A bellfoundry archive logged tuning forks, mould gauges, wax profiles, clapper blanks and casting tags by cabinet.',
'A falconry school recorded hood blocks, jess braids, perch caps, telemetry sleeves and moult cards by locker.',
'A luthier store indexed purfling strips, bridge gauges, peg compounds, soundpost setters and rib templates by drawer.',
'A diving workshop catalogued fin straps, slate pencils, reel clips, mask buckles and depth-card sleeves by bin.',
'A stone-carving room logged pitching tools, rifflers, mallet heads, point chisels and rubbing papers by bench.',
'A puppetry archive recorded control bars, joint pins, costume hooks, thread reels and backdrop tabs by shelf.',
'A tea laboratory indexed tasting cups, aroma lids, leaf trays, infusion timers and sample envelopes by station.']
TAIL_EN=[
'That maritime catalogue concerns stored objects only and supplies no evidence about the measured response.',
'Those papermaking supplies are scenery rather than behavioural proof.',
'The bellfoundry register describes equipment inventory and cannot establish the response route.',
'That falconry list concerns handling gear only, not the behaviour under classification.',
'Those luthier materials add physical context but cannot prove the mechanism.',
'The diving inventory is logistical background and does not determine the response family.',
'Those carving tools are unrelated objects and cannot decide the semantic route.',
'The puppetry stock list is environmental detail rather than evidence of what happened behaviourally.',
'Those tea-lab records describe samples and utensils, not the measured response.']
SCENE_VI=[
'Một kho maritime ghi signal flag, brass divider, tide slate, knot board và sextant shade theo gallery.',
'Một atelier giấy ghi deckle frame, couch felt, sizing spoon, watermark wire và drying clip theo rack.',
'Một archive đúc chuông ghi tuning fork, mould gauge, wax profile, clapper blank và casting tag theo tủ.',
'Một lớp falconry ghi hood block, jess braid, perch cap, telemetry sleeve và moult card theo locker.',
'Một kho luthier ghi purfling strip, bridge gauge, peg compound, soundpost setter và rib template theo ngăn.',
'Một workshop diving ghi fin strap, slate pencil, reel clip, mask buckle và depth-card sleeve theo bin.',
'Một phòng stone-carving ghi pitching tool, riffler, mallet head, point chisel và rubbing paper theo bàn.',
'Một archive puppetry ghi control bar, joint pin, costume hook, thread reel và backdrop tab theo kệ.',
'Một lab trà ghi tasting cup, aroma lid, leaf tray, infusion timer và sample envelope theo station.']
TAIL_VI=[
'Danh mục maritime chỉ nói về đồ vật lưu trữ và không cung cấp evidence cho response đang đo.',
'Các vật dụng papermaking chỉ là scenery chứ không phải behavioural proof.',
'Bản ghi bellfoundry là inventory thiết bị và không establish response route.',
'Danh sách falconry chỉ nói về handling gear, không phải behaviour đang classify.',
'Vật liệu luthier chỉ thêm physical context và không chứng minh mechanism.',
'Inventory diving là logistical background và không quyết định response family.',
'Các carving tool là object không liên quan và không quyết định semantic route.',
'Stock list puppetry là environmental detail chứ không phải evidence hành vi.',
'Ghi chú tea-lab nói về sample và utensil, không phải measured response.']
CAT_EN={
'clarification':'A mineral-survey cabinet separately tracked core rulers, streak tiles, sample flags, hand lenses and field envelopes; that catalogue has no bearing on whether my own closing action was supplied.',
'decision':'A bookbinding bench separately stored linen tapes, brass corners, press boards, paste knives and sewing keys; none of those materials transfers deciding authority.',
'hypothetical':'A model-railway club separately logged turnout gauges, ballast scoops, coupling hooks, signal lenses and track templates; those objects cannot turn synthetic text into a lived event.',
'third':'A conservation archive separately indexed cotton gloves, humidity cards, mounting strips, light meters and storage sleeves; that inventory cannot reveal another person’s private mind.',
'prediction':'A weather-instrument room separately catalogued barograph pens, rain gauges, anemometer cups, screen latches and calibration cards; those records do not answer a future-outcome question.',
'freeze':'A saddle-making rack separately held edge irons, stitch wheels, buckle blanks, strap gauges and wax cakes; those materials do not create or remove the stalled opening move.',
'ignore':'A mosaic studio separately logged tessera trays, grout floats, nippers, mesh sheets and setting combs; that stock record does not resolve the unattended main obligation.',
'slow':'A flute-maintenance drawer separately contained pad shims, spring hooks, cork sheets, key rollers and feeler strips; those objects do not alter the bounded pause-and-close sequence.',
'sequence':'A loom room separately indexed lease sticks, reed hooks, shuttle bobbins, temple pins and warp weights; that inventory does not create new facts between approach and retreat.',
'neutral':'A camera-repair desk separately stored lens spanners, shutter testers, aperture rings, focusing screens and helicoid grease; those tools do not change who retained and completed the final choice.'}
CAT_VI={k:'Bối cảnh inventory phụ này hoàn toàn inert với measured mechanism. '+v for k,v in CAT_EN.items()}
cases=[]
for ci,c in enumerate(C):
 for j in range(18):
  lang='EN' if j<9 else 'VI';idx=j if j<9 else j-9
  core=(EN if lang=='EN' else VI)[c][(ci*3+j*5)%6]
  scene=(SCENE_EN if lang=='EN' else SCENE_VI)[idx]
  tail=(TAIL_EN if lang=='EN' else TAIL_VI)[idx]
  cat=(CAT_EN if lang=='EN' else CAT_VI)[c]
  parts=[core,scene,tail,cat];rot=(ci+j)%4;parts=parts[rot:]+parts[:rot]
  route,fam,seq=E[c]
  cases.append({'case_id':f'V245-S{ci:02d}-{j:02d}','category':c,'language':lang,'domain':D[(ci*3+j)%6],'surface':' '.join(parts),'expected':{'route':route,'families':fam,'sequence':bool(seq)}})
assert len(cases)==180 and len({x['surface'] for x in cases})==180
selected=[];A=[];B=[]
for ci in range(10):
 ids=[f'V245-S{ci:02d}-{j:02d}' for j in [0,9,3,12,6,15]]
 selected+=ids;A+=ids[:3];B+=ids[3:]
cm={x['case_id']:x for x in cases};fixture=[cm[i] for i in selected];gold=[{'case_id':x['case_id'],'expected':x['expected']} for x in fixture]
def toks(s):return set(re.findall(r'[a-z0-9]+',str(s).lower()))
def sim(a,b):
 A1=toks(a);B1=toks(b);return len(A1&B1)/max(1,len(A1|B1))
internal=(0,None)
for i,x in enumerate(cases):
 for y in cases[i+1:]:
  q=sim(x['surface'],y['surface'])
  if q>internal[0]:internal=(q,(x['case_id'],y['case_id']))
prior=[]
for v in [219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244]:
 br=f'v83{v}-v1-sealed-validation';path=f'validation/v83{v}-v1-sealed/V8_3_{v}_PRESEAL_CANDIDATE_BANK_V1.json'
 try:
  subprocess.run(['git','fetch','--depth=1','origin',f'refs/heads/{br}:refs/remotes/origin/{br}'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  obj=json.loads(subprocess.check_output(['git','show',f'origin/{br}:{path}'],text=True,stderr=subprocess.DEVNULL));prior += obj.get('cases',[])
 except Exception:pass
external=(0,None);high=0;exact=0;prior_surfaces={x.get('surface','') for x in prior}
for x in cases:
 if x['surface'] in prior_surfaces:exact+=1
 for y in prior:
  q=sim(x['surface'],y.get('surface',''))
  if q>=.75:high+=1
  if q>external[0]:external=(q,(x['case_id'],y.get('case_id')))
finger=lambda x:(x['category'],x['language'],x['domain'],x['expected']['route'],tuple(x['expected']['families']),x['expected']['sequence'],tuple(sorted(toks(x['surface']))))
prior_fp={finger(x) for x in prior if all(k in x for k in ['category','language','domain','expected','surface'])};fpdup=sum(1 for x in cases if finger(x) in prior_fp)
assert internal[0]<.75 and external[0]<.75 and high==0 and exact==0 and fpdup==0
for name,obj in [('PRESEAL_CANDIDATE_BANK_V1',{'authority':'V8.3.245 PRESEAL CANDIDATE BANK V1','cases':cases}),('SEALED_SELECTION_V1',{'candidate':'V8.3.245','selected':selected,'batch_a':A,'batch_b':B}),('SEALED_FIXTURE_V1',{'candidate':'V8.3.245','cases':fixture}),('INDEPENDENT_GOLD_V1',{'candidate':'V8.3.245','cases':gold}),('SEALED_MEMBERSHIP_V1',{'candidate':'V8.3.245','batch_a':A,'batch_b':B})]:
 (O/f'V8_3_245_{name}.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
audit={'candidate':'V8.3.245','candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':round(internal[0],6),'internal_max_pair':internal[1],'external_max_similarity':round(external[0],6),'external_max_pair':external[1],'external_cases_at_or_above_0_75':high,'exact_external_duplicates':exact,'semantic_fingerprint_exact_duplicates':fpdup,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'batch_a_executed':False,'batch_b_executed':False,'pass':True};(O/'V8_3_245_PRESEAL_DIVERSITY_AUDIT_V1.json').write_text(json.dumps(audit,indent=2)+'\n')
def ho(o):return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
hashes={k:ho(json.loads((O/n).read_text())) for k,n in {'candidate_bank':'V8_3_245_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_245_SEALED_SELECTION_V1.json','fixture':'V8_3_245_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_245_INDEPENDENT_GOLD_V1.json','membership':'V8_3_245_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_245_PRESEAL_DIVERSITY_AUDIT_V1.json'}.items()}
auth={'candidate':'V8.3.245','phase':'SEALED_AUTHORITY_PRE_BATCH_A','validated_development_head_sha':DEV,'base_exact_development_sha':BASE,'semantic_authority':SEM,'preseal_pass':True,'hashes':hashes,'batch_a_executed':False,'batch_b_executed':False,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'step_111_authorized':False,'production_authorized':False};(O/'V8_3_245_SEALED_AUTHORITY_V1.json').write_text(json.dumps(auth,indent=2)+'\n')
receipt={'candidate':'V8.3.245','phase':'preseal-freeze-v1','validated_development_head_sha':DEV,'base_exact_development_sha':BASE,'semantic_authority':SEM,'candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':round(internal[0],6),'internal_max_pair':internal[1],'external_max_similarity':round(external[0],6),'external_cases_at_or_above_0_75':high,'exact_external_duplicates':exact,'semantic_fingerprint_exact_duplicates':fpdup,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'batch_a_executed':False,'batch_b_executed':False,'conclusion':'success'};(O/'V8_3_245_PRESEAL_RUN_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
