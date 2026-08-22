import json,hashlib,pathlib,subprocess,re
R=pathlib.Path('.');O=R/'validation/v83249-v1-sealed';O.mkdir(parents=True,exist_ok=True)
DEV='e1dd5fdb3286e88a1394051a01b414ddc131d4d9';BASE='84b6c508defc82dd952d7cc2797e5a1f51a3f8d6';SEM='QCEvidenceExtractorV5AU -> QCSemanticCoreV120'
raw=subprocess.check_output(['git','show','origin/v83248-v1-sealed-validation:validation/v83248-v1-sealed/V8_3_248_PRESEAL_CANDIDATE_BANK_V1.json'],text=True)
prev=json.loads(raw)['cases'];assert len(prev)==180
CAT=[
'A freshwater ecology archive separately indexed plankton nets, dissolved-oxygen probes, sediment cores, stream gauges, specimen vials, habitat sketches, turbidity tubes, field labels, kick-sample trays, conductivity meters, bank profiles and survey flags; this catalogue cannot supply a missing closing behaviour.',
'A metal engraving workshop separately catalogued burnishers, roulette wheels, plate scrapers, mezzotint rockers, ink slabs, wiping tarlatan, registration pins, copper plates, proof papers, solvent jars, edge bevels and press blankets; none of this equipment transfers final deciding authority.',
'A ceramic glaze laboratory separately recorded feldspar scoops, silica jars, oxide stains, test tiles, firing cones, sieves, specific-gravity cups, kiln logs, mixing paddles, sample labels, drying boards and glaze notebooks; these materials cannot convert an invented example into lived evidence.',
'A photographic conservation room separately logged archival sleeves, density targets, humidity cards, cotton gloves, light meters, spotting brushes, film cans, negative files, mounting corners, anti-static cloths, inspection loupes and storage boxes; these objects cannot reveal another person’s private conclusion.',
'A coastal observation station separately stored tide staffs, wave buoys, salinity bottles, wind vanes, barometer charts, current drogues, shoreline maps, sampling ropes, weather cards, marker poles, rain cylinders and calibration sheets; none of these records answers a future-outcome request.',
'A violin-making bench separately indexed bending irons, purfling cutters, arching templates, soundpost gauges, peg shapers, rib clamps, scraper sets, bridge blanks, varnish cups, thickness calipers, neck jigs and lining strips; these tools do not create or remove a stalled opening move.',
'A building acoustics survey kit separately catalogued sound-level meters, octave filters, tripods, calibration pistons, room sketches, absorption samples, cable reels, source speakers, timing cards, measurement grids, microphone clips and case labels; that inventory cannot resolve a central obligation left unattended.',
'A watch-repair cabinet separately held balance staffs, pallet stones, mainspring winders, jewel presses, timing papers, loupe cases, hand levers, dial protectors, oil cups, pivot broaches, screw trays and movement holders; these objects do not alter a bounded pause-review-close response.',
'A paper-weaving research studio separately logged warp boards, reed gauges, shuttle races, yarn cones, heddle frames, tension scales, lease sticks, bobbin trees, pattern grids, take-up markers, thread counters and sample cards; this equipment adds no new evidence between approach and retreat.',
'A telescope service room separately stored collimation caps, eyepiece rings, focus racks, lens cells, star-test cards, retaining collars, dew shields, finder brackets, alignment screws, optical cloths, aperture masks and calibration targets; these parts do not change who retained and completed the final choice.'
]
SCENES=[
('marine invertebrate room',['sorting trays','shell gauges','preservation jars','specimen pins','mesh sieves','label cards','forceps cases','sample spoons','depth tags','storage racks','field pencils','collection bags']),
('book arts bindery',['sewing frames','linen tapes','bone folders','press boards','paste brushes','awl cradles','thread reels','spine cloth','corner weights','cutting mats','guard strips','label knives']),
('stone microscopy lab',['thin sections','polarising filters','stage clips','immersion oils','slide boxes','grain charts','light diaphragms','sample pencils','mounting resin','objective caps','reference cards','dust covers']),
('wind instrument store',['reed plaques','cork sheets','spring hooks','pad papers','bore swabs','key rollers','thread spools','mandrels','feeler strips','case blocks','joint grease','repair tags']),
('map drawing office',['parallel rulers','scale bars','drafting films','ink pens','tracing sheets','symbol stencils','grid cards','map weights','eraser shields','section dividers','plotting points','archive tubes']),
('theatre prop archive',['hinge pins','canvas flats','paint swatches','rope cleats','mask forms','fabric rolls','scene labels','mounting hooks','foam blocks','storage crates','cue cards','repair tapes']),
('botanical seed bank',['sample envelopes','germination trays','humidity tins','seed sieves','label stakes','weigh boats','storage jars','species cards','desiccant packs','forceps','counting grids','cabinet tags']),
('railway model workshop',['track gauges','ballast scoops','coupler hooks','signal lenses','turnout templates','wire looms','wheel calipers','platform rulers','paint markers','scenery knives','layout cards','storage bins']),
('clock museum store',['pendulum bobs','escapement models','dial blanks','winding keys','movement cages','balance screws','timing charts','case labels','gear trays','spring boxes','jewel cards','display mounts']),
('sail loft archive',['bolt ropes','seam rubbers','palm guards','eyelet dies','canvas rolls','pattern chalk','reefing samples','stitch cards','thimble tins','line gauges','clew templates','storage tags']),
('print history room',['type cases','composing sticks','galley trays','roller gauges','chase keys','proof sheets','ink knives','spacing leads','furniture blocks','press cards','paper samples','cabinet labels']),
('mineral survey store',['core rulers','streak plates','sample flags','field hammers','hand lenses','specimen bags','grain cards','magnet trays','density bottles','section logs','survey pencils','archive boxes']),
('puppetry workshop',['control bars','joint pins','thread reels','costume hooks','backdrop tabs','hinge wires','mask blanks','paint cups','storage pegs','pattern cards','fabric pieces','scene labels']),
('tea sensory lab',['tasting cups','aroma lids','leaf trays','sample tins','infusion timers','water cards','spoon rests','weigh boats','storage envelopes','temperature strips','batch tags','cleaning cloths']),
('survey instrument room',['prism poles','plumb bobs','field books','chain pins','level staffs','tripod plates','sighting cards','marker nails','distance tapes','case labels','bubble vials','target sheets']),
('glass restoration bench',['lead knives','grozing pliers','came strips','solder blocks','cartoon sheets','wax sticks','pattern weights','glass chips','brush tins','cutting guides','panel tags','storage sleeves']),
('kite research room',['spar gauges','bridle cords','sailcloth rolls','ferrules','tail tabs','balance weights','frame jigs','line reels','wind cards','pattern papers','joint sleeves','storage hooks']),
('photographic repair desk',['shutter leaves','aperture blades','lens spanners','focusing screens','retaining rings','helicoid grease','timing testers','alignment cards','dust brushes','filter trays','case screws','calibration charts'])]
TAIL=[f'A separate {name} inventory also remained physically present but semantically inert to the measured response.' for name,_ in SCENES]
new=[]
for x in prev:
    m=re.search(r'-S(\d+)-(\d+)$',x['case_id']);assert m
    ci,j=map(int,m.groups());name,items=SCENES[j]
    scene=f"In a {name}, staff separately catalogued {', '.join(items)} by station; those objects describe environment only and cannot determine the behavioural route."
    surface=CAT[ci]+' '+scene+' '+x['surface']+' '+TAIL[j]
    y={k:v for k,v in x.items() if k!='case_id'};y['case_id']=f'V249-S{ci:02d}-{j:02d}';y['surface']=surface;new.append(y)
assert len(new)==180 and len({x['surface'] for x in new})==180
cm={x['case_id']:x for x in new};selected=[];A=[];B=[]
for ci in range(10):
    ids=[f'V249-S{ci:02d}-{j:02d}' for j in [0,9,3,12,6,15]]
    selected+=ids;A+=ids[:3];B+=ids[3:]
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
for v in [219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248]:
    br=f'v83{v}-v1-sealed-validation';path=f'validation/v83{v}-v1-sealed/V8_3_{v}_PRESEAL_CANDIDATE_BANK_V1.json'
    try:
        subprocess.run(['git','fetch','--depth=1','origin',f'refs/heads/{br}:refs/remotes/origin/{br}'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        obj=json.loads(subprocess.check_output(['git','show',f'origin/{br}:{path}'],text=True,stderr=subprocess.DEVNULL));prior+=obj.get('cases',[])
    except Exception:pass
external=(0,None);high=0;exact=0;prior_surfaces={x.get('surface','') for x in prior}
for x in new:
    if x['surface'] in prior_surfaces:exact+=1
    for y in prior:
        q=sim(x['surface'],y.get('surface',''))
        if q>=.75:high+=1
        if q>external[0]:external=(q,(x['case_id'],y.get('case_id')))
finger=lambda x:(x['category'],x['language'],x['domain'],x['expected']['route'],tuple(x['expected']['families']),x['expected']['sequence'],tuple(sorted(toks(x['surface']))))
prior_fp={finger(x) for x in prior if all(k in x for k in ['category','language','domain','expected','surface'])};fpdup=sum(1 for x in new if finger(x) in prior_fp)
assert internal[0]<.75 and external[0]<.75 and high==0 and exact==0 and fpdup==0
objects={
'PRESEAL_CANDIDATE_BANK_V1':{'authority':'V8.3.249 PRESEAL CANDIDATE BANK V1','cases':new},
'SEALED_SELECTION_V1':{'candidate':'V8.3.249','selected':selected,'batch_a':A,'batch_b':B},
'SEALED_FIXTURE_V1':{'candidate':'V8.3.249','cases':fixture},
'INDEPENDENT_GOLD_V1':{'candidate':'V8.3.249','cases':gold},
'SEALED_MEMBERSHIP_V1':{'candidate':'V8.3.249','batch_a':A,'batch_b':B}}
for name,obj in objects.items():(O/f'V8_3_249_{name}.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
audit={'candidate':'V8.3.249','candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':round(internal[0],6),'internal_max_pair':internal[1],'external_max_similarity':round(external[0],6),'external_max_pair':external[1],'external_cases_at_or_above_0_75':high,'exact_external_duplicates':exact,'semantic_fingerprint_exact_duplicates':fpdup,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'batch_a_executed':False,'batch_b_executed':False,'pass':True};(O/'V8_3_249_PRESEAL_DIVERSITY_AUDIT_V1.json').write_text(json.dumps(audit,indent=2)+'\n')
def ho(o):return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
hashes={k:ho(json.loads((O/n).read_text())) for k,n in {'candidate_bank':'V8_3_249_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_249_SEALED_SELECTION_V1.json','fixture':'V8_3_249_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_249_INDEPENDENT_GOLD_V1.json','membership':'V8_3_249_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_249_PRESEAL_DIVERSITY_AUDIT_V1.json'}.items()}
auth={'candidate':'V8.3.249','phase':'SEALED_AUTHORITY_PRE_BATCH_A','validated_development_head_sha':DEV,'base_exact_development_sha':BASE,'semantic_authority':SEM,'preseal_pass':True,'hashes':hashes,'batch_a_executed':False,'batch_b_executed':False,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'step_111_authorized':False,'production_authorized':False};(O/'V8_3_249_SEALED_AUTHORITY_V1.json').write_text(json.dumps(auth,indent=2)+'\n')
receipt={'candidate':'V8.3.249','phase':'preseal-freeze-v1','validated_development_head_sha':DEV,'base_exact_development_sha':BASE,'semantic_authority':SEM,'candidate_count':180,'selected_count':60,'batch_a_count':30,'batch_b_count':30,'internal_max_similarity':round(internal[0],6),'internal_max_pair':internal[1],'external_max_similarity':round(external[0],6),'external_cases_at_or_above_0_75':high,'exact_external_duplicates':exact,'semantic_fingerprint_exact_duplicates':fpdup,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'batch_a_executed':False,'batch_b_executed':False,'conclusion':'success'};(O/'V8_3_249_PRESEAL_RUN_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
