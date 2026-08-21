from pathlib import Path
p=Path('validation/v83214-sealed-v1-generator.py')
s=p.read_text()
old="pair=(EN if lang=='EN' else VI)[m][(i+mi)%3];ctx=(CTX_EN if lang=='EN' else CTX_VI)[domain][(i//3+mi)%3];tail=(TAIL_EN if lang=='EN' else TAIL_VI)[(i+2*mi)%3]"
new="pair=(EN if lang=='EN' else VI)[m][(i+mi+i//3)%3];ctx=(CTX_EN if lang=='EN' else CTX_VI)[domain][(i//3+mi)%3];tail=(TAIL_EN if lang=='EN' else TAIL_VI)[(i+2*mi+i//3)%3]"
assert old in s
exec(compile(s.replace(old,new),str(p), 'exec'))
