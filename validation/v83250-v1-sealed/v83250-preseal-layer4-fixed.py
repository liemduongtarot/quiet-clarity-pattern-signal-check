from pathlib import Path
p=Path('validation/v83250-v1-sealed/v83250-preseal-layer4.py')
code=p.read_text()
anchor='CAT4=['
if anchor not in code: raise SystemExit('CAT4 anchor missing')
code=code.replace(anchor,'insert="""\nCAT4=[',1)
compile(code,'v83250-preseal-layer4-fixed-runtime.py','exec')
exec(compile(code,'v83250-preseal-layer4-fixed-runtime.py','exec'))
