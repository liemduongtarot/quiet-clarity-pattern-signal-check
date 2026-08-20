from pathlib import Path
src=Path('validation/v83209-generalization-challenge-generator.py').read_text()
needle="assert len({c['surface'] for c in cases})==400"
patch="""\n# Ensure linguistic uniqueness with natural, semantically irrelevant context rather than identifiers.\n_times=['Earlier that morning','Later that afternoon','After lunch','Before dinner','Near the end of the day','During a routine break','At the start of the week','Midway through the day']\n_places=['while I was at home','while I was at work','after checking my calendar','after a routine message arrived','while reviewing ordinary admin']\nseen={}\nfor idx,c in enumerate(cases):\n    s=c['surface']; count=seen.get(s,0)\n    if count:\n        c['surface']=s+' '+_times[idx%len(_times)]+' '+_places[(idx//len(_times))%len(_places)]+'.'\n    seen[s]=count+1\nassert len({c['surface'] for c in cases})==400\n"""
if needle not in src: raise SystemExit('generator patch point missing')
src=src.replace(needle,patch,1)
exec(compile(src,'v83209-generalization-challenge-generator-v1r','exec'))
