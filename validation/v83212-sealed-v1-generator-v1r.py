from pathlib import Path
src=Path('validation/v83212-sealed-v1-generator.py').read_text()
old="base=arr[(i+mi)%6]"
new="base=arr[(i+mi+i//6)%6]"
if old not in src: raise SystemExit('V212 preseal diversification patch marker missing')
src=src.replace(old,new,1)
exec(compile(src,'v83212-sealed-v1-generator-v1r','exec'))
