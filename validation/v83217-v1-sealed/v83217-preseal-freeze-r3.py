from pathlib import Path

src = Path('validation/v83217-v1-sealed/v83217-preseal-freeze.py').read_text()

needle = "bank={'authority':'V8.3.217 V1 PRESEAL CANDIDATE BANK','seed':SEED,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'selection_uses_runtime_output':False,'cases':cs}"
repair = """for _case in cs:\n if _case['case_id']=='V217-S09-14':\n  _case['surface']=_case['surface'].replace('Một túi courier mang bản sao giấy tờ.','Visitor control desk đối chiếu badge serial với lobby access roster.').replace('Records management lập index thùng storage theo retention code.','Procurement archive gắn purchase-order checksum vào vendor packet.')\n""" + needle

if needle not in src:
    raise SystemExit('missing candidate-bank construction anchor')
src = src.replace(needle, repair, 1)
src = src.replace("'phase':'preseal-freeze-v1'", "'phase':'preseal-freeze-r3'", 1)
exec(compile(src, 'v83217-preseal-freeze-r3.py', 'exec'))
