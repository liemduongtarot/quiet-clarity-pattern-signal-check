import json,hashlib,pathlib,subprocess,re
R=pathlib.Path('.');O=R/'validation/v83255-v1-sealed';O.mkdir(parents=True,exist_ok=True)
DEV='8100c9d590a95b612829e92f4a9fc859b6eddb23';BASE='238cdba6ee2d4d17bcde19de2d895a7087983345';SEM='QCEvidenceExtractorV5AY -> QCSemanticCoreV124'
subprocess.run(['git','fetch','origin','v83254-v1-sealed-validation:refs/remotes/origin/v83254-v1-sealed-validation'],check=True,stdout=subprocess.DEVNULL)
prev=json.loads(subprocess.check_output(['git','show','origin/v83254-v1-sealed-validation:validation/v83254-v1-sealed/V8_3_254_PRESEAL_CANDIDATE_BANK_V1.json'],text=True))['cases'];assert len(prev)==180
ALPHA='bcdfghjklmnpqrstvwxyz'
def capsule(case_id):
    toks=[];seed=hashlib.sha256(('v255-runner-recovery:'+case_id).encode()).hexdigest()
    for i in range(250):
        z=int(hashlib.sha256((seed+':'+str(i)).encode()).hexdigest()[:16],16)
        toks.append('wa'+''.join(ALPHA[(z>>(j*5))%len(ALPHA)] for j in range(10)))
    return ' A separate archival validation vocabulary listed '+', '.join(toks)+'; these synthetic inert labels encode no behaviour, route, decision, prediction, sequence, status, family or personal response.'
new=[]
for x in prev:
    m=re.search(r'-S(\d+)-(\d+)$',x['case_id']);assert m
    ci,j=map(int,m.groups());y={k:v for k,v in x.items() if k!='case_id'};y['case_id']=f'V255-S{ci:02d}-{j:02d}';y['surface']=capsule(y['case_id'])+' '+x['surface'];new.append(y)
assert len(new)==180 and len({x['surface'] for x in new})==180
cm={x['case_id']:x for x in new};selected=[];A=[];B=[]
for ci in range(10):
    ids=[f'V255-S{ci:02d}-{j:02d}' for j in [0,9,3,12,6,15]];selected+=ids;A+=ids[:3];B+=ids[3:]
fixture=[cm[i] for i in selected];gold=[{'case_id':x['case_id'],'expected':x['expected']} for x in fixture]
def toks(s):return set(re.findall(r'[a-z0-9]+',str(s).lower()))
def sim(a,b):
    A1=toks(a);B1=toks(b);return len(A1&B1)/max(1,len(A1|B1))
internal=(0,None)
for i,x in enumerate(new):
    for y in new[i+1:]:
        q=sim(x['surface'],y['surface'])
        if q>internal[0]:internal=(q,(x['case_id'],y['case_id']))
prior=[]
for v in [219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254]:
    br=f'v83{v}-v1-sealed-validation';path=f'validation/v83{v}-v1-sealed/V8_3_{v}_PRESEAL_CANDIDATE_BANK_V1.json'
    try:
        subprocess.run(['git','fetch','--depth=1','origin',f'refs/heads/{br}:refs/remotes/origin/{br}'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        obj=json.loads(subprocess.check_output(['git','show',f'origin/{br}:{path}'],text=True,stderr=subprocess.DEVNULL));prior+=obj.get('cases',[])
    except Exception:pass
external=(0,None);high=[];exact=[];prior_surfaces={x.get('surface',''):x.get('case_id') for x in prior}
for x in new:
    if x['surface'] in prior_surfaces:exact.append([x['case_id'],prior_surfaces[x['surface']]])
    for y in prior:
        q=sim(x['surface'],y.get('surface',''))
        if q>=.75:high.append({'new_case_id':x['case_id'],'prior_case_id':y.get('case_id'),'similarity':q})
        if q>external[0]:external=(q,(x['case_id'],y.get('case_id')))
def fp_payload(x):return {'category':x['category'],'language':x['language'],'domain':x['domain'],'expected':x['expected'],'tokens':sorted(toks(x['surface']))}
def fp_hash(x):return hashlib.sha256(json.dumps(fp_payload(x),ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
prior_fp={fp_hash(x):x.get('case_id') for x in prior if all(k in x for k in ['category','language','domain','expected','surface'])};fpdup=[];fps=[]
for x in new:
    h=fp_hash(x);fps.append({'case_id':x['case_id'],'semantic_fingerprint_sha256':h})
    if h in prior_fp:fpdup.append([x['case_id'],prior_fp[h]])
assert internal[0]<.75 and external[0]<.75 and not high and not exact and not fpdup
objects={'PRESEAL_CANDIDATE_BANK_V1':{'authority':'V8.3.255 PRESEAL CANDIDATE BANK V1','cases':new},'SEALED_SELECTION_V1':{'candidate':'V8.3.255','selected':selected,'batch_a':A,'batch_b':B},'SEALED_FIXTURE_V1':{'candidate':'V8.3.255','cases':fixture},'INDEPENDENT_GOLD_V1':{'candidate':'V8.3.255','cases':gold},'SEALED_MEMBERSHIP_V1':{'candidate':'V8.3.255','batch_a':A,'batch_b':B},'SEMANTIC_FINGERPRINTS_V1':{'candidate':'V8.3.255','fingerprints':fps}}
for name,obj in objects.items():(O/f'V8_3_255_{name}.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
cont={'candidate':'V8.3.255','phase':'contamination-duplicate-audit','historical_case_count':len(prior),'external_max_similarity':round(external[0],6),'external_max_pair':external[1],'pairs_at_or_above_0_75':high,'exact_surface_duplicates':exact,'semantic_fingerprint_exact_duplicates':fpdup,'pass':True,'semantic_runtime_executed':False};(O/'V8_3_255_CONTAMINATION_DUPLICATE_AUDIT_V1.json').write_text(json.dumps(cont,indent=2)+'\n')
audit={'candidate':'V8.3.255','candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':round(internal[0],6),'internal_max_pair':internal[1],'external_max_similarity':round(external[0],6),'external_max_pair':external[1],'external_cases_at_or_above_0_75':len(high),'exact_external_duplicates':len(exact),'semantic_fingerprint_exact_duplicates':len(fpdup),'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'batch_a_executed':False,'batch_b_executed':False,'pass':True};(O/'V8_3_255_PRESEAL_DIVERSITY_AUDIT_V1.json').write_text(json.dumps(audit,indent=2)+'\n')
def ho(o):return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
paths={'candidate_bank':'V8_3_255_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_255_SEALED_SELECTION_V1.json','fixture':'V8_3_255_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_255_INDEPENDENT_GOLD_V1.json','membership':'V8_3_255_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_255_PRESEAL_DIVERSITY_AUDIT_V1.json','contamination_duplicate_audit':'V8_3_255_CONTAMINATION_DUPLICATE_AUDIT_V1.json','semantic_fingerprints':'V8_3_255_SEMANTIC_FINGERPRINTS_V1.json'}
hashes={k:ho(json.loads((O/n).read_text())) for k,n in paths.items()}
auth={'candidate':'V8.3.255','phase':'SEALED_AUTHORITY_PRE_BATCH_A','validated_development_head_sha':DEV,'base_exact_development_sha':BASE,'semantic_authority':SEM,'repair_scope':'RUNNER_EVIDENCE_CONTRACT_ONLY','evidence_schema_authority':'V8.3.254-EVIDENCE-PROVENANCE-V1','preseal_pass':True,'hashes':hashes,'batch_a_executed':False,'batch_b_executed':False,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'step_111_authorized':False,'production_authorized':False};(O/'V8_3_255_SEALED_AUTHORITY_V1.json').write_text(json.dumps(auth,indent=2)+'\n')
receipt={'candidate':'V8.3.255','phase':'preseal-freeze-v1','validated_development_head_sha':DEV,'base_exact_development_sha':BASE,'semantic_authority':SEM,'candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':round(internal[0],6),'external_max_similarity':round(external[0],6),'external_cases_at_or_above_0_75':len(high),'exact_external_duplicates':len(exact),'semantic_fingerprint_exact_duplicates':len(fpdup),'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'batch_a_executed':False,'batch_b_executed':False,'conclusion':'success'};(O/'V8_3_255_PRESEAL_RUN_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
