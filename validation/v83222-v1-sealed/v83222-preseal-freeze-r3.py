from pathlib import Path
src=Path('validation/v83222-v1-sealed/v83222-preseal-freeze.py').read_text()
old_stride="ctx=(CTXE if lang=='EN' else CTXV)[(j*3+ci)%18]"
new_stride="ctx=(CTXE if lang=='EN' else CTXV)[(j*2+ci)%18]"
old_path="p=f'validation/v832{v}-v1-sealed/V8_3_{v}_PRESEAL_CANDIDATE_BANK_V1.json'"
new_path="p=f'validation/v83{v}-v1-sealed/V8_3_{v}_PRESEAL_CANDIDATE_BANK_V1.json'"
assert old_stride in src and old_path in src
src=src.replace(old_stride,new_stride,1).replace(old_path,new_path,1)
exec(compile(src,'v83222-preseal-freeze-r3.py','exec'))
