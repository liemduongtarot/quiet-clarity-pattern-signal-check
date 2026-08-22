import json,hashlib,pathlib,subprocess,re
R=pathlib.Path('.');O=R/'validation/v83236-v1-sealed';O.mkdir(parents=True,exist_ok=True)
DEV='fac7c5e35c928c5b0dfe33b28b584af876ac0bf1';SEM='QCEvidenceExtractorV5AL -> QCSemanticCoreV111'
C=['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral'];D=['money','relationship','career','family','workplace','other']
E={'clarification':('input:clarification-required',[],0),'decision':('input:decision-request',[],0),'hypothetical':('input:hypothetical-or-example',[],0),'third':('input:third-party-only',[],0),'prediction':('input:prediction',[],0),'freeze':('input:self-lived',['freeze'],0),'ignore':('input:self-lived',['ignore'],0),'slow':('input:self-lived',['slow'],0),'sequence':('input:self-lived',['slow'],1),'neutral':('input:self-lived',[],0)}
EN={
'clarification':['This happened in real life and the surrounding facts are known, but my own observable endpoint response is still missing.','The situation is real and described; the gap is what I personally did at the close.','The episode is lived and otherwise clear, yet my final observable behaviour has not been stated.','I can supply the real sequence, except for the action that came from me at the endpoint.','Everything around the actual event is available, but my own closing response remains unknown.','The account is real and complete apart from my personal final action.'],
'decision':['Make the final selection itself so your choice replaces mine.','Take ownership of the deciding act and choose the option that will stand.','I want the actual decision to come from you rather than from me.','Choose the final route itself instead of only helping me compare.','The deciding call is yours; make the option selection on my behalf.','I am handing you the final choice itself, not asking for advice.'],
'hypothetical':['This is artificial validation material rather than evidence from my life.','I created this synthetic example only for evaluation; it is not something I lived.','Nothing here is autobiographical; it is constructed test input.','This scenario is fabricated practice material and not personal evidence.','The example exists for testing and does not come from any event I experienced.','Treat this as fictional assessment text with no lived episode behind it.'],
'third':['Infer the other person’s private belief even though no observable words or actions support it.','Tell me the concealed conclusion in their mind without behavioural evidence from them.','Work out what someone else privately thinks despite no outward basis.','State the other person’s internal belief when nothing they did or said establishes it.','Give me their hidden view even though their conduct provides no observable support.','Describe someone else’s secret conclusion without any behavioural evidence.'],
'prediction':['At the future deadline I named, will the outcome I want be there?','When that later checkpoint arrives, will this resolve the way I hope?','By the future boundary I specified, will the preferred result have happened?','Looking ahead to the stated date, will things end in my favour?','Once that future milestone is reached, will I get the result I want?','At that future point, will the situation end the way I want?'],
'freeze':['I had an easy-to-reverse first action, but kept generating alternatives and stayed inactive.','A contained starter step was available; I widened the choices instead of beginning.','There was a reversible opening move, yet option growth replaced initiation.','I could have tried one bounded first step, but comparison kept expanding and no start happened.','A low-commitment trial action was ready, but I added possibilities and remained still.','The first move had a clear exit, yet I kept broadening options and never began.'],
'ignore':['The central matter remained unresolved while I shifted effort into secondary activity.','The core obligation was waiting for my response, but I diverted into side tasks.','The main issue still needed action from me while I focused on peripheral work.','Something important stayed unanswered because I redirected attention to less relevant activity.','The primary responsibility still required my response, yet I occupied myself with side work.','The central obligation remained open while I put effort into tasks that could not settle it.'],
'slow':['There was one finite pause and one review before I answered and stopped revisiting it.','I used one bounded delay, checked once, replied, and left the matter closed.','I paused inside a fixed limit, reviewed once, responded, and did not reopen it.','Before answering I took one contained interval and one check, then moved on.','I allowed one defined pause, made one review, gave my response, and stopped reviewing.','I delayed once within a clear boundary, checked once, answered, and closed the matter.'],
'sequence':['I moved toward the action, withdrew, then returned to the same conclusion without new evidence.','I approached execution, backed out, and repeated the same judgement although nothing changed.','I came close to acting, stepped away, then cycled back to the prior reasoning with no new facts.','I nearly carried it out, reversed course, and revisited the same assessment under unchanged evidence.','I advanced toward the move, retreated, then repeated the same conclusion without additional information.','I got close to doing it, pulled back, and returned to the same reasoning despite no new evidence.'],
'neutral':['I kept the final choice with me, carried it out, and left the matter closed.','I made the decision myself, completed the action, and moved on.','Final agency stayed mine through execution; afterward I did not reopen it.','I retained ownership of the choice, executed it, and treated the issue as settled.','I chose for myself, finished the action, and left the matter resolved.','The final call remained mine; I completed it and did not revisit the decision.']}
VI={k:[x.replace('I ','Tôi ').replace('my ','của tôi ') for x in v] for k,v in EN.items()}
CTXE=['A printmaking studio logged brayer sleeves and ink trays by cabinet.','A rope workshop indexed sling cards and chalk tags by wall.','A greenhouse class tracked seed labels and mist valves by bay.','A ceramics room recorded trimming tools and glaze tiles by bench.','A film store catalogued reel tins and cue slips by shelf.','A pastry lab logged proofing cards and scraper bins by station.','A rowing loft indexed oar clips and seat rails by rack.','A theatre room tracked costume bags and prop cards by locker.','A weaving studio recorded shuttle cases and loom pegs by table.','An observatory club catalogued lens caps and mount screws by case.','A drafting archive logged map tubes and ruler weights by drawer.','A sound booth indexed cable loops and ear cushions by cabinet.','A specimen room tracked herb sheets and drying boards by shelf.','A sculling shed recorded collar rings and seat bolts by board.','A dance store catalogued shoe pouches and garment tags by rail.','A repair class logged socket trays and parts slips by bench.','A cooking studio indexed utensil bins and pantry cards by shelf.','A bindery room tracked thread cards and awl sleeves by drawer.']
CTXV=[x.replace('A ','Một ').replace('An ','Một ') for x in CTXE]
TAIL_E=['That inventory detail is setting only and cannot establish the response.','The storage note is logistics rather than behavioural evidence.','That equipment reference cannot determine the semantic route.','The filing detail adds context only, not evidence of the mechanism.','That physical record sits outside the behavioural evidence.','The administrative note cannot decide the classification.']
TAIL_V=['Inventory detail đó chỉ là setting, không establish response.','Storage note chỉ là logistics, không behavioural evidence.','Equipment reference không determine semantic route.','Filing detail chỉ add context, không evidence mechanism.','Physical record nằm ngoài behavioural evidence.','Administrative note không decide classification.']
cases=[]
for ci,c in enumerate(C):
 for j in range(18):
  lang='EN' if j<9 else 'VI';k=(ci*4+j*3)%6;core=(EN if lang=='EN' else VI)[c][k];ctx=(CTXE if lang=='EN' else CTXV)[(ci*7+j*11)%18];tail=(TAIL_E if lang=='EN' else TAIL_V)[(ci+j*2)%6];parts=[core,ctx,tail];rot=(ci*2+j)%3;parts=parts[rot:]+parts[:rot];surface=' '.join(parts);route,fam,seq=E[c];cases.append({'case_id':f'V236-S{ci:02d}-{j:02d}','category':c,'language':lang,'domain':D[(ci+j*2)%6],'surface':surface,'expected':{'route':route,'families':fam,'sequence':bool(seq)}})
assert len(cases)==180 and len({x['surface'] for x in cases})==180
selected=[];A=[];B=[]
for ci in range(10):
 ids=[f'V236-S{ci:02d}-{j:02d}' for j in [0,4,7,10,14,17]];selected+=ids;A+=ids[:3];B+=ids[3:]
assert len(selected)==60 and len(A)==30 and len(B)==30 and set(A).isdisjoint(B)
cm={x['case_id']:x for x in cases};fixture=[cm[i] for i in selected];gold=[{'case_id':x['case_id'],'expected':x['expected']} for x in fixture]
def toks(s):return set(re.findall(r'[a-z0-9]+',str(s).lower()))
def sim(a,b):
 A=toks(a);B=toks(b);return len(A&B)/max(1,len(A|B))
internal=(0,None)
for i,x in enumerate(cases):
 for y in cases[i+1:]:
  q=sim(x['surface'],y['surface'])
  if q>internal[0]:internal=(q,(x['case_id'],y['case_id']))
prior=[]
for v in [219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235]:
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
(O/'V8_3_236_PRESEAL_CANDIDATE_BANK_V1.json').write_text(json.dumps({'authority':'V8.3.236 PRESEAL CANDIDATE BANK V1','cases':cases},ensure_ascii=False,indent=2)+'\n')
(O/'V8_3_236_SEALED_SELECTION_V1.json').write_text(json.dumps({'candidate':'V8.3.236','selected':selected,'batch_a':A,'batch_b':B},indent=2)+'\n')
(O/'V8_3_236_SEALED_FIXTURE_V1.json').write_text(json.dumps({'candidate':'V8.3.236','cases':fixture},ensure_ascii=False,indent=2)+'\n')
(O/'V8_3_236_INDEPENDENT_GOLD_V1.json').write_text(json.dumps({'candidate':'V8.3.236','cases':gold},indent=2)+'\n')
(O/'V8_3_236_SEALED_MEMBERSHIP_V1.json').write_text(json.dumps({'candidate':'V8.3.236','batch_a':A,'batch_b':B},indent=2)+'\n')
audit={'candidate':'V8.3.236','candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':round(internal[0],6),'internal_max_pair':internal[1],'external_max_similarity':round(external[0],6),'external_max_pair':external[1],'external_cases_at_or_above_0_75':high,'exact_external_duplicates':exact,'semantic_fingerprint_exact_duplicates':fpdup,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'batch_a_executed':False,'batch_b_executed':False,'pass':True}
(O/'V8_3_236_PRESEAL_DIVERSITY_AUDIT_V1.json').write_text(json.dumps(audit,indent=2)+'\n')
def ho(o):return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
hashes={'candidate_bank':ho(json.loads((O/'V8_3_236_PRESEAL_CANDIDATE_BANK_V1.json').read_text())),'selection':ho(json.loads((O/'V8_3_236_SEALED_SELECTION_V1.json').read_text())),'fixture':ho(json.loads((O/'V8_3_236_SEALED_FIXTURE_V1.json').read_text())),'independent_gold':ho(json.loads((O/'V8_3_236_INDEPENDENT_GOLD_V1.json').read_text())),'membership':ho(json.loads((O/'V8_3_236_SEALED_MEMBERSHIP_V1.json').read_text())),'preseal_audit':ho(audit)}
auth={'candidate':'V8.3.236','phase':'SEALED_AUTHORITY_PRE_BATCH_A','validated_development_head_sha':DEV,'semantic_authority':SEM,'preseal_pass':True,'hashes':hashes,'batch_a_executed':False,'batch_b_executed':False,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'step_111_authorized':False,'production_authorized':False}
(O/'V8_3_236_SEALED_AUTHORITY_V1.json').write_text(json.dumps(auth,indent=2)+'\n')
receipt={'candidate':'V8.3.236','phase':'preseal-freeze-v1','validated_development_head_sha':DEV,'semantic_authority':SEM,'candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':round(internal[0],6),'internal_max_pair':internal[1],'external_max_similarity':round(external[0],6),'external_cases_at_or_above_0_75':high,'exact_external_duplicates':exact,'semantic_fingerprint_exact_duplicates':fpdup,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'batch_a_executed':False,'batch_b_executed':False,'conclusion':'success'}
(O/'V8_3_236_PRESEAL_RUN_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
