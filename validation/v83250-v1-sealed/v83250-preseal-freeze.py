from pathlib import Path
import subprocess
src=subprocess.check_output(['git','show','origin/v83249-v1-sealed-validation:validation/v83249-v1-sealed/v83249-preseal-freeze.py'],text=True)
src=src.replace("R=pathlib.Path('.');O=R/'validation/v83249-v1-sealed'","R=pathlib.Path('.');O=R/'validation/v83250-v1-sealed'",1)
src=src.replace("DEV='e1dd5fdb3286e88a1394051a01b414ddc131d4d9';BASE='84b6c508defc82dd952d7cc2797e5a1f51a3f8d6';SEM='QCEvidenceExtractorV5AU -> QCSemanticCoreV120'","DEV='514cbcb34fbe336033c8f8858a53415371137973';BASE='e1dd5fdb3286e88a1394051a01b414ddc131d4d9';SEM='QCEvidenceExtractorV5AV -> QCSemanticCoreV121'",1)
src=src.replace('V249-S','V250-S').replace('V8_3_249','V8_3_250').replace('V8.3.249','V8.3.250')
old="for v in [219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248]:"
new="for v in [219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249]:"
if old not in src: raise SystemExit('history anchor missing')
src=src.replace(old,new,1)
# Add two V250-only inert lexical layers to all 180 surfaces before diversity scoring.
insert="""
CAT3=[
'A freshwater taxonomy store separately held larval keys, sample pipettes, microscope trays, specimen labels, preservative bottles, sorting dishes, field notebooks, mesh screens, reference slides, measuring grids, archive sleeves and locality cards; this inventory cannot supply a missing closing behaviour.',
'A stone lettering workshop separately stored chisels, mallets, spacing gauges, rubbing papers, layout cords, polishing blocks, serif templates, pitch sticks, guide rulers, sample slates, marking pencils and bench tags; none of this equipment can take over the final decision.',
'A paper-fibre research lab separately catalogued pulp beaters, fibre screens, couching felts, drying rings, formation sheets, sample jars, pH papers, weight cards, sizing brushes, fibre labels, press boards and batch logs; these materials cannot convert invented material into lived evidence.',
'A film preservation store separately listed leader reels, splice tapes, inspection benches, humidity cards, core hubs, archive cans, shrink gauges, viewing lamps, edge codes, cotton gloves, condition slips and shelf labels; these objects cannot reveal another person’s private conclusion.',
'A river-monitoring cabin separately logged current meters, stage boards, sediment bottles, conductivity probes, marker flags, rain gauges, field sheets, sample ropes, calibration cards, flow maps, turbidity tubes and storage cases; none of these records answers a future-outcome request.',
'A cello repair bench separately indexed bridge knives, soundpost setters, peg shapers, rib clamps, purfling strips, scraper blades, varnish jars, neck gauges, lining clamps, thickness calipers, string reels and repair cards; these tools do not create or remove a stalled opening move.',
'A structural materials store separately catalogued core sleeves, joint gauges, crack cards, mortar samples, survey rulers, depth probes, site tags, mesh strips, sample tins, brush heads, condition sheets and line pins; this equipment cannot resolve a central obligation left unattended.',
'A mechanical clock service bench separately held arbor supports, mainspring clamps, jewel pushers, timing strips, pivot files, hand lifters, movement cushions, screw trays, oil cups, balance gauges, dial guards and service tags; these objects do not alter a bounded pause-review-close response.',
'A textile sampling studio separately logged warp cards, reed gauges, bobbin trees, yarn cones, tension weights, heddle hooks, shuttle races, pattern slates, lease rods, take-up markers, thread counters and sample envelopes; this equipment adds no new evidence between approach and retreat.',
'A microscope optics cabinet separately stored objective rings, stage clips, condenser irises, focus racks, calibration slides, retaining collars, alignment screws, light diaphragms, filter trays, lens tissues, test targets and service cards; these parts do not change who retained and completed the final choice.'
]
SC3=[
('shell morphology lab',['sorting dishes','hinge gauges','specimen boxes','locality slips','foam supports','caliper cards','reference plates','label pens','sample bags','drawer trays','inspection sheets','archive tags']),
('paper conservation bindery',['repair tissues','wheat paste','linen hinges','bone folders','blotter stacks','press boards','spine cloth','guard strips','thread reels','corner weights','label knives','storage sleeves']),
('mineral thin-section room',['slide boxes','polarising sheets','stage clips','grain cards','mounting resin','sample pencils','objective caps','light filters','reference charts','dust covers','section tags','storage trays']),
('brass instrument repair room',['pad papers','spring hooks','cork sheets','key rollers','bore swabs','feeler strips','mandrels','joint grease','thread spools','case blocks','repair cards','bench labels']),
('hydrographic drafting office',['tide sheets','parallel rulers','scale bars','chart weights','plotting pens','symbol stencils','depth cards','divider cases','route slips','archive tubes','grid films','cabinet labels']),
('museum costume store',['muslin covers','acid-free tags','stitch cards','humidity slips','cotton gloves','hanger forms','fabric rolls','repair tapes','mounting hooks','box labels','condition sheets','shelf cards']),
('seed viability laboratory',['germination trays','sample envelopes','humidity tins','seed sieves','weigh boats','species cards','desiccant packs','forceps','counting grids','label stakes','cabinet tags','storage jars']),
('precision model workshop',['track rulers','wheel gauges','coupler hooks','wire looms','turnout templates','platform cards','paint markers','scenery knives','ballast scoops','layout sheets','storage bins','bench labels']),
('horology study room',['pendulum models','escapement cards','movement cages','balance screws','gear trays','spring boxes','dial blanks','winding keys','timing charts','display mounts','case labels','jewel cards']),
('canvas rigging store',['bolt ropes','seam rubbers','palm guards','eyelet dies','canvas rolls','reefing cards','stitch samples','line gauges','thimble tins','clew templates','pattern chalk','rack tags']),
('printing technology room',['type cases','composing sticks','roller gauges','galley trays','proof sheets','spacing leads','chase keys','paper samples','press cards','ink knives','furniture blocks','cabinet labels']),
('geology specimen room',['core rulers','streak plates','field hammers','hand lenses','sample flags','specimen bags','grain cards','density bottles','magnet trays','section logs','survey pencils','archive boxes']),
('stage mechanics shop',['control rods','hinge wires','mask blanks','fabric pieces','joint pins','thread reels','paint cups','storage pegs','backdrop tabs','costume hooks','pattern cards','scene labels']),
('tea evaluation room',['tasting bowls','aroma lids','leaf trays','sample tins','infusion clocks','temperature cards','spoon rests','weigh boats','batch tags','storage envelopes','cleaning cloths','water sheets']),
('survey calibration room',['prism poles','plumb bobs','level staffs','tripod plates','distance tapes','marker nails','sighting cards','bubble vials','field books','target sheets','case labels','chain pins']),
('stained glass repair room',['lead knives','grozing pliers','came strips','solder blocks','pattern weights','glass chips','cartoon sheets','wax sticks','cutting guides','brush tins','panel tags','storage sleeves']),
('aerodynamic kite lab',['spar gauges','bridle cords','frame jigs','line reels','sailcloth rolls','balance weights','joint sleeves','tail tabs','wind cards','pattern papers','ferrules','storage hooks']),
('camera mechanism bench',['shutter leaves','aperture blades','lens spanners','focus screens','retaining rings','helicoid grease','timing testers','alignment cards','filter trays','dust brushes','case screws','calibration charts'])]
for _c in new:
 _m=re.search(r'-S(\\d+)-(\\d+)$',_c['case_id']);_ci,_j=map(int,_m.groups());_n,_it=SC3[_j];_scene='In a '+_n+', technicians independently catalogued '+', '.join(_it)+' by station; this inventory is physical scenery only and cannot determine the measured response.';_c['surface']=CAT3[_ci]+' '+_scene+' '+_c['surface']
"""
anchor="assert len(new)==180 and len({x['surface'] for x in new})==180"
if anchor not in src: raise SystemExit('surface completion anchor missing')
src=src.replace(anchor,insert+'\n'+anchor,1)
compile(src,'v83250-preseal-adapted.py','exec')
exec(compile(src,'v83250-preseal-adapted.py','exec'))
