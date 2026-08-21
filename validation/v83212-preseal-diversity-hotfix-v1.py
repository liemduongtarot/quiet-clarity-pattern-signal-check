from pathlib import Path

p = Path('validation/v83212-sealed-v1-generator.py')
src = p.read_text()
old = "base=arr[(i+mi)%6]"
new = "base=arr[(i+mi+(i//6))%6]"
assert src.count(old) == 1, 'unexpected V8.3.212 sealed generator source shape'
patched = src.replace(old, new)
exec(compile(patched, str(p) + ':diversity-hotfix-v1', 'exec'), {'__name__': '__main__'})
