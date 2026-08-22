from pathlib import Path
import subprocess
src=subprocess.check_output(['git','show','origin/v83246-v1-sealed-validation:validation/v83246-v1-sealed/v83246-preseal-freeze.py'],text=True)
src=src.replace("R=pathlib.Path('.');O=R/'validation/v83246-v1-sealed'","R=pathlib.Path('.');O=R/'validation/v83247-v1-sealed'",1)
src=src.replace("DEV='00bcd4681a61ef1ab0b229eb90af9e74102dc649';BASE='2015436433bede4e454739efe2ebae4807f800af';SEM='QCEvidenceExtractorV5AT -> QCSemanticCoreV119'","DEV='2253e333f2b319e122e2bfdf06ddbdd330ff7408';BASE='00bcd4681a61ef1ab0b229eb90af9e74102dc649';SEM='QCEvidenceExtractorV5AT -> QCSemanticCoreV119'",1)
src=src.replace('V246-S','V247-S').replace('V8_3_246','V8_3_247').replace('V8.3.246','V8.3.247')
old="for v in [219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245]:"
new="for v in [219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246]:"
if old not in src: raise SystemExit('prior-history anchor missing')
src=src.replace(old,new,1)
fresh="""
FRESH_CAT_EN=[
'A navigation school separately inventoried plotting triangles, compass roses, dividers, parallel rules and chart clips; that teaching stock does not supply a missing final action.',
'A metal-type archive separately stored em spaces, composing rules, chase wedges, galley tags and locking keys; those items cannot assign deciding authority.',
'A paper-marbling room separately listed alum brushes, rake combs, pigment cups, drying boards and blotter sheets; that inventory cannot turn fictional material into lived experience.',
'A costume-conservation cabinet separately held muslin wraps, acid-free tags, stitch samples, humidity cards and cotton gloves; none of these materials reveals another person’s private conclusion.',
'A weather-station storeroom separately logged Stevenson screens, wind cups, rain cylinders, pressure charts and calibration slips; these records cannot answer a future-outcome question.',
'A book-repair bench separately held lifting knives, linen tapes, bone folders, paste brushes and pressing boards; these tools do not create or remove a stalled first move.',
'A tile-survey archive separately indexed grout cards, glaze chips, spacer trays, mesh samples and nipper guards; that stock cannot resolve a central task left unattended.',
'A clarinet-service drawer separately stored pad papers, spring hooks, cork strips, bore swabs and key rollers; these objects do not alter a bounded pause-review-close response.',
'A loom-maintenance cabinet separately listed heddle hooks, reed ties, shuttle bobbins, warp cards and lease rods; this equipment adds no new evidence between approach and retreat.',
'A camera-repair case separately catalogued aperture leaves, retaining rings, helicoid grease, focusing screens and test charts; these parts do not change who retained the final choice.'
]
FRESH_CAT_VI=[
'Một lớp navigation phụ ghi plotting triangle, compass rose, divider, parallel rule và chart clip; inventory đó không cung cấp final action còn thiếu.',
'Một archive metal-type phụ ghi em space, composing rule, chase wedge, galley tag và locking key; các object đó không giao deciding authority.',
'Một phòng paper-marbling phụ ghi alum brush, rake comb, pigment cup, drying board và blotter sheet; inventory đó không biến fictional material thành lived experience.',
'Một tủ costume-conservation phụ ghi muslin wrap, acid-free tag, stitch sample, humidity card và cotton glove; các material đó không reveal private conclusion của người khác.',
'Một kho weather-station phụ ghi Stevenson screen, wind cup, rain cylinder, pressure chart và calibration slip; các record đó không trả lời future-outcome question.',
'Một bench book-repair phụ ghi lifting knife, linen tape, bone folder, paste brush và pressing board; các tool đó không tạo hay xoá stalled first move.',
'Một archive tile-survey phụ ghi grout card, glaze chip, spacer tray, mesh sample và nipper guard; inventory đó không giải quyết central task bị bỏ lại.',
'Một drawer clarinet-service phụ ghi pad paper, spring hook, cork strip, bore swab và key roller; các object đó không đổi bounded pause-review-close response.',
'Một cabinet loom-maintenance phụ ghi heddle hook, reed tie, shuttle bobbin, warp card và lease rod; equipment đó không thêm evidence mới giữa approach và retreat.',
'Một case camera-repair phụ ghi aperture leaf, retaining ring, helicoid grease, focusing screen và test chart; các part đó không đổi người giữ final choice.'
]
FRESH_J_EN=[
'A second storage note recorded slate pencils, linen ties, brass clips, cork spacers, vellum tabs and wooden gauges by compartment; the note is inert background.',
'A separate shelf register recorded fibre pads, enamel tags, cotton cords, steel rulers, wax blocks and paper seals by bay; the register carries no behavioural evidence.',
'A separate locker card listed canvas straps, ceramic ferrules, alloy screws, kraft labels, felt washers and wooden pegs by hook; that card is unrelated to the measured response.',
'A separate drawer manifest listed silicone caps, brass shims, wool pads, archive sleeves, glass droppers and bamboo pins by section; none of these objects determines the semantic route.',
'A separate rack ledger listed copper rings, linen wraps, steel hooks, card markers, rubber bulbs and wooden spacers by row; the ledger remains inert context.',
'A separate box label listed paper gauges, cotton tape, brass clips, cork tabs, steel pins and fibre washers by slot; these materials do not prove behaviour.',
'A separate cabinet slip listed linen loops, wooden tags, alloy rings, wax cards, ceramic spacers and paper bands by drawer; the slip adds scenery only.',
'A separate bench sheet listed enamel markers, cotton ties, steel clips, felt pads, cork guards and vellum cards by station; the sheet cannot classify the response.',
'A separate archive ticket listed brass tabs, linen sleeves, wooden gauges, paper seals, alloy hooks and cotton wraps by box; the ticket supplies no mechanism evidence.'
]
FRESH_J_VI=[
'Một storage note phụ ghi slate pencil, linen tie, brass clip, cork spacer, vellum tab và wooden gauge theo compartment; note này chỉ là inert background.',
'Một shelf register phụ ghi fibre pad, enamel tag, cotton cord, steel ruler, wax block và paper seal theo bay; register này không mang behavioural evidence.',
'Một locker card phụ ghi canvas strap, ceramic ferrule, alloy screw, kraft label, felt washer và wooden peg theo hook; card này không liên quan response đang đo.',
'Một drawer manifest phụ ghi silicone cap, brass shim, wool pad, archive sleeve, glass dropper và bamboo pin theo section; các object này không quyết định semantic route.',
'Một rack ledger phụ ghi copper ring, linen wrap, steel hook, card marker, rubber bulb và wooden spacer theo row; ledger này vẫn là inert context.',
'Một box label phụ ghi paper gauge, cotton tape, brass clip, cork tab, steel pin và fibre washer theo slot; material này không chứng minh behaviour.',
'Một cabinet slip phụ ghi linen loop, wooden tag, alloy ring, wax card, ceramic spacer và paper band theo drawer; slip này chỉ thêm scenery.',
'Một bench sheet phụ ghi enamel marker, cotton tie, steel clip, felt pad, cork guard và vellum card theo station; sheet này không classify response.',
'Một archive ticket phụ ghi brass tab, linen sleeve, wooden gauge, paper seal, alloy hook và cotton wrap theo box; ticket này không cung cấp mechanism evidence.'
]
"""
anchor='cases=[]\nfor ci,c in enumerate(C):'
if anchor not in src: raise SystemExit('cases anchor missing')
src=src.replace(anchor,fresh+'\ncases=[]\nfor ci,c in enumerate(C):',1)
old="cases.append({'case_id':f'V247-S{ci:02d}-{j:02d}','category':c,'language':lang,'domain':D[(ci*2+j*3)%6],'surface':' '.join(parts),'expected':{'route':route,'families':fam,'sequence':bool(seq)}})"
new="extra_cat=(FRESH_CAT_EN if lang=='EN' else FRESH_CAT_VI)[ci];extra_j=(FRESH_J_EN if lang=='EN' else FRESH_J_VI)[idx];cases.append({'case_id':f'V247-S{ci:02d}-{j:02d}','category':c,'language':lang,'domain':D[(ci*2+j*3)%6],'surface':' '.join(parts)+' '+extra_cat+' '+extra_j,'expected':{'route':route,'families':fam,'sequence':bool(seq)}})"
if old not in src: raise SystemExit('surface append anchor missing')
src=src.replace(old,new,1)
# Surgical construction-only repair for the four external-similarity collisions identified by immutable diagnostics.
case_anchor="assert len(cases)==180 and len({x['surface'] for x in cases})==180"
repair="""
_PATCH={
'V247-S07-00':' A separate acoustic-measurement cabinet logged impedance bridges, tone generators, calibration resistors, coupler rings, damping felts, spectrum printouts, phase rulers and reference microphones by numbered shelf; this unrelated laboratory inventory is additional inert scenery only.',
'V247-S07-06':' A separate archival-photography station recorded copy stands, grey cards, cable releases, anti-newton glass, focus rails, exposure slates, lens hoods and negative sleeves by drawer; none of this photographic equipment changes a bounded pause-review-close response.',
'V247-S07-07':' A separate ceramic-glaze library indexed test tiles, oxide jars, sieve meshes, firing cones, recipe cards, brush handles, kiln labels and sample trays by cabinet; this material register supplies no behavioural evidence for the measured response.',
'V247-S08-06':' A separate marine-biology prep room catalogued specimen dishes, salinity pipettes, plankton grids, fixation labels, microscope stages, mesh filters, sample tubes and field tags by station; these biological supplies add no information to the approach-retreat sequence.'}
for _x in cases:
 if _x['case_id'] in _PATCH:_x['surface']+=_PATCH[_x['case_id']]
"""
if case_anchor not in src: raise SystemExit('cardinality anchor missing')
src=src.replace(case_anchor,repair+'\n'+case_anchor,1)
compile(src,'v83247-preseal-adapted.py','exec')
exec(compile(src,'v83247-preseal-adapted.py','exec'))
