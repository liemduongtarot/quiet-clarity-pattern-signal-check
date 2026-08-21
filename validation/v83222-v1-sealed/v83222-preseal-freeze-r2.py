from pathlib import Path
src=Path('validation/v83222-v1-sealed/v83222-preseal-freeze.py').read_text()
old="ctx=(CTXE if lang=='EN' else CTXV)[(j*3+ci)%18]"
new="ctx=(CTXE if lang=='EN' else CTXV)[(j*2+ci)%18]"
assert old in src
src=src.replace(old,new,1)
exec(compile(src,'v83222-preseal-freeze-r2.py','exec'))
