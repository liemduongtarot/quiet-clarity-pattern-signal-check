from pathlib import Path
src=Path('validation/v83255-v1-sealed/v83255-preseal-freeze.py').read_text()
old='for i in range(250):'
new='for i in range(400):'
assert src.count(old)==1
src=src.replace(old,new,1)
compile(src,'v83255-preseal-r2-generated.py','exec')
exec(compile(src,'v83255-preseal-r2-generated.py','exec'))
