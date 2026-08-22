from pathlib import Path
p=Path('validation/v83249-v1-sealed/v83249-preseal-freeze.py')
t=p.read_text()
anchor="TAIL=[f'A separate {name} inventory also remained physically present but semantically inert to the measured response.' for name,_ in SCENES]\n"
insert="""CAT2=[
'A soil chemistry teaching store separately catalogued extraction funnels, conductivity cells, nitrate strips, buffer bottles, texture charts, weighing boats, sample scoops, drying tins, reference soils, pH electrodes, reagent racks and notebook sleeves; this stock cannot supply a missing final action.',
'A letter-carving archive separately indexed chasing hammers, gravers, spacing dividers, layout squares, polishing stones, wax pencils, brass blanks, transfer papers, burnishers, bench dogs, guide strips and specimen plates; none of those tools assigns the conclusive decision.',
'A natural-dye study room separately stored madder samples, indigo vats, mordant cards, yarn swatches, rinse timers, colour fans, weighing spoons, fibre labels, drying lines, wash-test sheets, sample jars and batch ledgers; these materials do not make a hypothetical event autobiographical.',
'A sound-recording preservation vault separately recorded leader tape, reel hubs, azimuth gauges, head-cleaning sticks, archival boxes, humidity tags, playback cards, splice blocks, inspection lights, cotton gloves, storage reels and condition logs; these objects cannot reveal a third party’s private belief.',
'A mountain weather observatory separately logged snow rulers, aneroid barometers, radiation shields, wind socks, temperature screens, precipitation cans, cloud charts, observation books, marker stakes, calibration thermometers, pressure cards and site maps; those records cannot answer whether a future result will occur.',
'A furniture restoration shop separately indexed veneer knives, hide-glue pots, clamp blocks, cabinet scrapers, dowel gauges, shellac pads, joint templates, fret saws, edge planes, marking knives, sanding corks and repair labels; these tools do not create or remove a stalled first move.',
'A pavement materials laboratory separately catalogued aggregate sieves, asphalt cores, density blocks, compaction charts, crack rulers, sample tins, temperature probes, straightedges, mix cards, calibration weights, texture plates and site tags; this equipment cannot resolve a main responsibility left open.',
'A flute acoustics cabinet separately held embouchure gauges, pad shims, leak lights, spring hooks, cork strips, bore scopes, key rollers, feeler papers, cleaning rods, reference tubes, measurement cards and case tags; these objects do not alter one bounded pause followed by closure.',
'A textile tension laboratory separately recorded warp meters, take-up rollers, yarn counters, reed frames, shuttle gauges, bobbin racks, pattern drafts, lease cords, test swatches, force scales, timing cards and loom tags; none of this equipment adds evidence between an approach and a retreat.',
'An optical instrument archive separately stored prism mounts, iris diaphragms, focus helicoids, reticle plates, collimation targets, lens cells, filter rings, alignment jigs, dust caps, test lamps, retaining screws and service cards; these parts do not change ownership of the final completed choice.'
]
SCENES2=[
('herbarium mounting room',['gummed strips','specimen folders','plant presses','mounting sheets','label pens','linen hinges','forceps','drying papers','archive boards','sample weights','cabinet tags','inspection cards']),
('ceramic sculpture store',['loop tools','wire cutters','rib sets','armature rods','plaster bats','slip jars','sponge blocks','kiln shelves','texture stamps','clay knives','storage boards','catalogue labels']),
('navigation instrument class',['pelorus cards','azimuth mirrors','parallel rules','chart dividers','sighting vanes','compass roses','plotting sheets','scale rulers','course cards','brass clips','instrument cases','lesson tags']),
('archive box workshop',['board cutters','linen tapes','corner jigs','adhesive pots','bone folders','label frames','press weights','paper guards','thread reels','measuring squares','storage trays','batch slips']),
('reptile survey lab',['scale cards','sample tubes','field calipers','habitat sheets','temperature probes','capture bags','marker pens','species guides','weigh boxes','survey tapes','site labels','storage crates']),
('harpsichord service room',['jack gauges','plectra blanks','key bushings','voicing knives','string coils','bridge pins','tuning levers','felt strips','action rulers','case blocks','repair cards','tool rolls']),
('mosaic conservation store',['tessera trays','grout samples','mesh sheets','nippers','colour cards','setting blocks','adhesive jars','pointing tools','sample boards','brush tins','panel tags','storage racks']),
('camera darkroom archive',['negative sleeves','contact frames','densitometer strips','timer cards','focus finders','chemical bottles','film clips','wash trays','grain loupes','storage boxes','batch labels','light meters']),
('rope-making workshop',['strand gauges','lay cards','serving mallets','splice fids','tension hooks','fibre reels','thimble samples','wax tins','measuring cords','storage pegs','pattern sheets','rack tags']),
('metal casting classroom',['sprue cutters','mould flasks','riddle screens','wax gates','pouring cards','crucible tongs','sand scoops','pattern boards','vent wires','sample tags','bench brushes','storage bins']),
('marine chart store',['tide tables','sounding leads','coast pilots','chart weights','divider cases','plotting rulers','route cards','depth pencils','compass sheets','archive tubes','index slips','cabinet labels']),
('reed basket studio',['soaking tubs','splitters','weave gauges','rim forms','awl handles','reed coils','pattern cards','clamp pegs','cutting knives','drying racks','sample tags','storage hooks']),
('letterpress proof room',['ink slabs','roller bearers','proof papers','registration pins','type-high gauges','wash tins','galley labels','chase keys','paper stacks','packing sheets','press cards','cabinet tags']),
('shell collection store',['specimen boxes','caliper gauges','locality cards','sorting trays','soft brushes','sample bags','number tags','foam supports','reference books','drawer labels','inspection slips','storage racks']),
('watercolour materials archive',['pan sets','wash brushes','stretching boards','masking tapes','colour charts','paper blocks','mixing wells','sponge trays','pencil tins','sample sheets','portfolio tags','shelf labels']),
('woodturning classroom',['gouge racks','tool rests','caliper pairs','faceplates','chuck jaws','abrasive strips','wax blocks','blank gauges','sharpening cards','sample spindles','bench tags','storage bins']),
('field entomology cabinet',['pinning boards','specimen tubes','sweep nets','label cards','wing gauges','forceps','storage boxes','collection bags','site maps','sample pencils','tray liners','drawer tags']),
('film projector repair room',['gate plates','sprocket gauges','lamp houses','focus rails','shutter discs','alignment cards','lens collars','belt sets','timing sheets','retaining clips','test reels','service labels'])]
TAIL2=[f'The additional {name} register is independent physical scenery and does not supply evidence for the measured response.' for name,_ in SCENES2]
"""
if anchor not in t: raise SystemExit('TAIL anchor missing')
t=t.replace(anchor,insert+anchor,1)
old="surface=CAT[ci]+' '+scene+' '+x['surface']+' '+TAIL[j]"
new="name2,items2=SCENES2[j];scene2=f\"In a {name2}, staff independently listed {', '.join(items2)} by cabinet; this separate inventory cannot determine the measured route.\";surface=CAT[ci]+' '+CAT2[ci]+' '+scene+' '+scene2+' '+x['surface']+' '+TAIL[j]+' '+TAIL2[j]"
if old not in t: raise SystemExit('surface anchor missing')
t=t.replace(old,new,1)
p.write_text(t)
