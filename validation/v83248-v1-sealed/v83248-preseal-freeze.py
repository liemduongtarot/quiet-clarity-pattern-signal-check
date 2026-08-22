from pathlib import Path
import subprocess
# Reuse only the proven V247 construction mechanism, then add a new V248 lexical layer.
code=subprocess.check_output(['git','show','origin/v83247-v1-sealed-validation:validation/v83247-v1-sealed/v83247-preseal-freeze.py'],text=True)
code=code.replace("DEV='2253e333f2b319e122e2bfdf06ddbdd330ff7408';BASE='00bcd4681a61ef1ab0b229eb90af9e74102dc649';SEM='QCEvidenceExtractorV5AT -> QCSemanticCoreV119'","DEV='84b6c508defc82dd952d7cc2797e5a1f51a3f8d6';BASE='00bcd4681a61ef1ab0b229eb90af9e74102dc649';SEM='QCEvidenceExtractorV5AT -> QCSemanticCoreV119'",1)
code=code.replace("R=pathlib.Path('.');O=R/'validation/v83247-v1-sealed'","R=pathlib.Path('.');O=R/'validation/v83248-v1-sealed'",1)
code=code.replace('V247-S','V248-S').replace('V8_3_247','V8_3_248').replace('V8.3.247','V8.3.248')
# Extend history through V247.
code=code.replace("for v in [219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246]:","for v in [219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247]:")
# Add a V248-only context layer after the V247 generator has constructed its cases.
needle="compile(src,'v83248-preseal-adapted.py','exec')"
extra="""
_V248_CAT=[
' A seismology teaching cabinet separately stored geophone leads, timing crystals, survey pegs, waveform cards, damping pads, cable reels, level bubbles and station labels; this unrelated inventory cannot supply the missing closing behaviour.',
' A letterpress maintenance bay separately indexed roller bearers, quoins, furniture blocks, type-high gauges, wash-up tins, feed-board clips, frisket cords and chase labels; these items cannot take over the final deciding role.',
' A dye-sample archive separately catalogued mordant spoons, fibre swatches, rinse cards, pH strips, drying clips, sample jars, glass rods and batch tags; that material record cannot convert a constructed example into lived evidence.',
' A map-conservation vault separately listed linen hinges, wheat-paste pots, blotter packs, humidity tabs, polyester sleeves, repair tissues, bone folders and light-meter cards; these materials cannot reveal another person’s concealed belief.',
' A hydrology station separately logged staff gauges, current-meter cups, rainfall sheets, sample bottles, calibration weights, field slates, flow charts and marker flags; none of these records answers a future-outcome request.',
' A leather-tool library separately stored edge bevelers, stitching groovers, mauls, creasing wheels, strap cutters, wax cakes, buckle gauges and awl handles; these tools do not create or remove the stalled opening action.',
' A masonry survey locker separately indexed pointing keys, mortar cards, joint gauges, sample bags, line pins, brush heads, crack rulers and site tags; that equipment cannot resolve the central obligation left unattended.',
' A bassoon-service cabinet separately held mandrels, pad cups, spring hooks, bore swabs, cork strips, key rollers, feeler papers and thread spools; this maintenance stock does not alter the bounded pause-review-close response.',
' A weaving research room separately catalogued warp counters, heddle frames, lease rods, pirn winders, shuttle gauges, pattern cards, yarn cones and tension weights; this equipment adds no new evidence between approach and retreat.',
' A projection-equipment workshop separately stored lens collars, aperture plates, focus racks, lamp housings, alignment cards, retaining screws, test grids and dust covers; these parts do not change who kept and completed the final choice.'
]
_V248_J=[
' A separate accession ledger also listed cellulose tabs, copper washers, linen loops, graphite marks, ceramic spacers, steel clips, paper sleeves and wooden rulers under a different catalogue; this ledger is inert background only.',
' A separate crate note also recorded cotton webbing, alloy rings, cork sheets, glass vials, brass pins, fibre pads, kraft tags and wax seals by compartment; none of these objects supplies behavioural evidence.',
' A separate inventory slip also listed bamboo sticks, enamel markers, linen bands, steel hooks, paper gauges, wooden shims, ceramic beads and cotton ties by drawer; the slip cannot determine the measured semantic route.',
' A separate storage ticket also indexed brass tabs, wool pads, vellum strips, silicone caps, wooden pegs, archive labels, fibre washers and glass droppers by shelf; the ticket remains unrelated scenery.',
' A separate equipment card also logged paper bands, alloy clips, cotton wraps, cork guards, linen tags, steel rulers, ceramic blocks and wax markers by station; the card does not prove any response mechanism.',
' A separate shelf label also recorded copper loops, wooden gauges, paper seals, fibre tabs, glass rods, linen ties, brass shims and cotton sleeves by bay; these materials cannot classify behaviour.',
' A separate drawer register also listed ceramic ferrules, steel pins, cotton cords, kraft labels, silicone pads, wooden spacers, vellum slips and brass rings by section; the register adds context only.',
' A separate archive card also indexed felt washers, alloy hooks, paper tabs, linen sleeves, cork blocks, glass caps, cotton tape and wooden markers by box; this card carries no mechanism evidence.',
' A separate bench manifest also listed fibre strips, brass clips, bamboo rulers, paper envelopes, cotton loops, steel spacers, ceramic tabs and wax labels by slot; the manifest is inert to the measured response.',
' A separate storeroom sheet also recorded linen wraps, alloy pins, paper gauges, cork ties, wooden clips, glass markers, cotton bands and brass tags by rack; the sheet has no bearing on the response classification.'
]
for _c in cases:
 _ci=int(_c['case_id'].split('-S')[1].split('-')[0]);_j=int(_c['case_id'].rsplit('-',1)[1]);_c['surface']+=_V248_CAT[_ci]+_V248_J[_j%10]
"""
replacement="src=src.replace(\"assert len(cases)==180 and len({x['surface'] for x in cases})==180\","+repr(extra)+"+\"\\nassert len(cases)==180 and len({x['surface'] for x in cases})==180\",1); "+needle
if needle not in code: raise SystemExit('V248 final compile anchor missing')
code=code.replace(needle,replacement,1)
compile(code,'v83248-preseal-wrapper.py','exec')
exec(compile(code,'v83248-preseal-wrapper.py','exec'))
