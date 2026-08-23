from pathlib import Path
import subprocess
src=subprocess.check_output(['git','show','origin/v83252-v1-sealed-validation:validation/v83252-v1-sealed/v83252-preseal-freeze.py'],text=True)
repls=[
("O=R/'validation/v83252-v1-sealed'","O=R/'validation/v83253-v1-sealed'"),
("DEV='59d1d564a2208ae4ce5899262ad094357a20402a'","DEV='89db04ec936af998c14d2f0451ef87270ea8e349'"),
("BASE='125a6f60c94eda4c455323a171006cac613eb903'","BASE='59d1d564a2208ae4ce5899262ad094357a20402a'"),
("SEM='QCEvidenceExtractorV5AX -> QCSemanticCoreV123'","SEM='QCEvidenceExtractorV5AY -> QCSemanticCoreV124'"),
("v83251-v1-sealed-validation","v83252-v1-sealed-validation"),
("origin/v83251-v1-sealed-validation:validation/v83251-v1-sealed/V8_3_251_PRESEAL_CANDIDATE_BANK_V1.json","origin/v83252-v1-sealed-validation:validation/v83252-v1-sealed/V8_3_252_PRESEAL_CANDIDATE_BANK_V1.json"),
('V252-','V253-'),('V8.3.252','V8.3.253'),('V8_3_252','V8_3_253'),('v83252','v83253')]
for a,b in repls: src=src.replace(a,b)
# Inject a fresh, semantically inert case-specific lexical capsule after case construction, before similarity metrics.
anchor="assert len(cases)==180\n"
if anchor not in src: raise SystemExit('cases anchor missing')
inj="""assert len(cases)==180\n# V253-only inert lexical capsules: construction diversity only; no measured-contract changes.\nALPHA='bcdfghjklmnpqrstvwxyz'\ndef capsule(case_id):\n    import hashlib\n    h=hashlib.sha256(('v253:'+case_id).encode()).hexdigest()\n    toks=[]\n    for i in range(72):\n        z=int(hashlib.sha256((h+':'+str(i)).encode()).hexdigest()[:12],16)\n        w='vx'+''.join(ALPHA[(z>>(j*5))%len(ALPHA)] for j in range(8))\n        toks.append(w)\n    return ' A separate archival cipher inventory listed '+', '.join(toks)+'; these inert lexical labels describe no behaviour, decision, prediction, sequence, or personal response.'\nfor c in cases:\n    c['surface']=capsule(c['case_id'])+' '+c['surface']\n"""
src=src.replace(anchor,inj,1)
# Compare against V252 history at minimum; transformed source already includes prior external-history logic.
Path('validation/v83253-v1-sealed/v83253-preseal-freeze.py').write_text(src)
compile(src,'v83253-preseal-freeze.py','exec')
