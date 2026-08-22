from pathlib import Path
import subprocess
src=subprocess.check_output(['git','show','origin/v83245-v1-sealed-validation:validation/v83245-v1-sealed/v83245-preseal-freeze.py'],text=True)
src=src.replace("DEV='2015436433bede4e454739efe2ebae4807f800af';BASE='885608fce9e70a8818d1ebda23c786a81005a2fe';SEM='QCEvidenceExtractorV5AS -> QCSemanticCoreV118'","DEV='00bcd4681a61ef1ab0b229eb90af9e74102dc649';BASE='2015436433bede4e454739efe2ebae4807f800af';SEM='QCEvidenceExtractorV5AT -> QCSemanticCoreV119'",1)
src=src.replace("R=pathlib.Path('.');O=R/'validation/v83245-v1-sealed'","R=pathlib.Path('.');O=R/'validation/v83246-v1-sealed'",1)
src=src.replace('V245-S','V246-S').replace('V8_3_245','V8_3_246').replace('V8.3.245','V8.3.246')
insert="""
FRESH_CAT_EN=[
'A nautical-instrument conservatory separately stored azimuth mirrors, pelorus cards, brass sights, horizon shades and traverse sheets; this material inventory is inert to the measured behaviour.',
'A letterpress bindery separately catalogued frisket pins, chase wedges, roller gauges, tympan sheets and composing keys; these objects do not transfer decision authority.',
'A clock-restoration cabinet separately indexed mainspring sleeves, pallet stones, pivot broaches, dial feet and balance screws; this stock cannot convert constructed material into lived evidence.',
'A textile archive separately recorded bobbin cases, selvedge tags, heddle frames, warp combs and sample cards; this inventory cannot reveal a third party’s private state.',
'A meteorology store separately tracked sling psychrometers, sunshine cards, wind vanes, pressure drums and rain-measure tubes; these objects cannot answer a future-outcome request.',
'A leathercraft room separately logged skiving knives, edge slickers, pricking irons, strap cutters and buckle trays; these tools do not create or remove a stalled first move.',
'A tile-restoration bench separately stored grout rakes, sponge floats, spacer tins, glaze chips and mesh rolls; these supplies cannot resolve an unattended central task.',
'A woodwind service case separately held pad cups, spring pliers, cork strips, bore swabs and key-oil bottles; this equipment does not alter a bounded pause-review-close response.',
'A handloom studio separately indexed shuttle races, warp beams, lease rods, temple clips and reed gauges; this equipment adds no new information between approach and retreat.',
'A lens-repair cabinet separately catalogued aperture blades, focusing helicoids, shutter leaves, retaining rings and calibration targets; these parts do not change who retained the final choice.'
]
FRESH_CAT_VI=['Bối cảnh vật dụng hàng hải phụ này inert với response đang đo.','Bối cảnh letterpress phụ này không chuyển deciding authority.','Bối cảnh clock-restoration phụ không biến test material thành lived evidence.','Bối cảnh textile archive phụ không tiết lộ private state của người khác.','Bối cảnh meteorology phụ không trả lời future-outcome request.','Bối cảnh leathercraft phụ không tạo hay xoá stalled first move.','Bối cảnh tile-restoration phụ không giải quyết central task bị bỏ lại.','Bối cảnh woodwind service phụ không đổi bounded pause-review-close response.','Bối cảnh handloom phụ không tạo information mới giữa approach và retreat.','Bối cảnh lens-repair phụ không đổi người giữ final choice.']
FRESH_J_EN=[
'A separate cabinet label listed ivory-free compass dividers, slate pencils, linen ties and archive tabs by drawer.',
'A separate tray register listed ceramic ferrules, cotton cords, brass clips and vellum slips by compartment.',
'A separate shelf card listed cork spacers, steel rulers, wax blocks and paper seals by bay.',
'A separate locker note listed felt washers, wooden pegs, canvas straps and enamel tags by hook.',
'A separate bench ledger listed rubber bulbs, glass droppers, alloy screws and fibre pads by station.',
'A separate rack card listed bamboo pins, linen loops, copper rings and card sleeves by row.',
'A separate drawer note listed horn-free buttons, cotton tape, steel hooks and kraft labels by section.',
'A separate case inventory listed silicone caps, brass shims, wool pads and paper gauges by slot.',
'A separate archive slip listed wooden spacers, linen wraps, steel clips and card markers by box.'
]
FRESH_J_VI=['Một nhãn tủ phụ ghi compass divider, slate pencil, linen tie và archive tab theo ngăn.','Một tray register phụ ghi ceramic ferrule, cotton cord, brass clip và vellum slip theo compartment.','Một shelf card phụ ghi cork spacer, steel ruler, wax block và paper seal theo bay.','Một locker note phụ ghi felt washer, wooden peg, canvas strap và enamel tag theo hook.','Một bench ledger phụ ghi rubber bulb, glass dropper, alloy screw và fibre pad theo station.','Một rack card phụ ghi bamboo pin, linen loop, copper ring và card sleeve theo row.','Một drawer note phụ ghi button, cotton tape, steel hook và kraft label theo section.','Một case inventory phụ ghi silicone cap, brass shim, wool pad và paper gauge theo slot.','Một archive slip phụ ghi wooden spacer, linen wrap, steel clip và card marker theo box.']
"""
anchor='cases=[]\nfor ci,c in enumerate(C):'
if anchor not in src: raise SystemExit('cases loop anchor missing')
src=src.replace(anchor,insert+'\ncases=[]\nfor ci,c in enumerate(C):',1)
old="cases.append({'case_id':f'V246-S{ci:02d}-{j:02d}','category':c,'language':lang,'domain':D[(ci*3+j)%6],'surface':' '.join(parts),'expected':{'route':route,'families':fam,'sequence':bool(seq)}})"
new="fresh_cat=(FRESH_CAT_EN if lang=='EN' else FRESH_CAT_VI)[ci];fresh_j=(FRESH_J_EN if lang=='EN' else FRESH_J_VI)[idx];cases.append({'case_id':f'V246-S{ci:02d}-{j:02d}','category':c,'language':lang,'domain':D[(ci*3+j)%6],'surface':' '.join(parts)+' '+fresh_cat+' '+fresh_j,'expected':{'route':route,'families':fam,'sequence':bool(seq)}})"
if old not in src: raise SystemExit('surface append anchor missing')
src=src.replace(old,new,1)
# Include V245 in external-contamination history.
old_prior='for v in [219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244]:'
new_prior='for v in [219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245]:'
if old_prior not in src: raise SystemExit('prior list anchor missing')
src=src.replace(old_prior,new_prior,1)
compile(src,'v83246-preseal-adapted.py','exec')
exec(compile(src,'v83246-preseal-adapted.py','exec'))
