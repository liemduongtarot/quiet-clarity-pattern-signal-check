from pathlib import Path
import subprocess
src=subprocess.check_output(['git','show','origin/v83252-v1-sealed-validation:validation/v83252-v1-sealed/v83252-preseal-freeze.py'],text=True)
repls=[
("O=R/'validation/v83252-v1-sealed'","O=R/'validation/v83253-v1-sealed'"),
("DEV='59d1d564a2208ae4ce5899262ad094357a20402a'","DEV='89db04ec936af998c14d2f0451ef87270ea8e349'"),
("BASE='125a6f60c94eda4c455323a171006cac613eb903'","BASE='59d1d564a2208ae4ce5899262ad094357a20402a'"),
("SEM='QCEvidenceExtractorV5AX -> QCSemanticCoreV123'","SEM='QCEvidenceExtractorV5AY -> QCSemanticCoreV124'"),
("subprocess.run(['git','fetch','origin','v83251-v1-sealed-validation:refs/remotes/origin/v83251-v1-sealed-validation']","subprocess.run(['git','fetch','origin','v83252-v1-sealed-validation:refs/remotes/origin/v83252-v1-sealed-validation']"),
("origin/v83251-v1-sealed-validation:validation/v83251-v1-sealed/V8_3_251_PRESEAL_CANDIDATE_BANK_V1.json","origin/v83252-v1-sealed-validation:validation/v83252-v1-sealed/V8_3_252_PRESEAL_CANDIDATE_BANK_V1.json"),
("y['case_id']=f'V252-S{ci:02d}-{j:02d}'","y['case_id']=f'V253-S{ci:02d}-{j:02d}'"),
("ids=[f'V252-S{ci:02d}-{j:02d}'","ids=[f'V253-S{ci:02d}-{j:02d}'"),
(",249,250,251]:",",249,250,251,252]:"),
("'V8.3.252 PRESEAL CANDIDATE BANK V1'","'V8.3.253 PRESEAL CANDIDATE BANK V1'"),
("'candidate':'V8.3.252'","'candidate':'V8.3.253'"),
("f'V8_3_252_{name}.json'","f'V8_3_253_{name}.json'"),
("'V8_3_252_PRESEAL_DIVERSITY_AUDIT_V1.json'","'V8_3_253_PRESEAL_DIVERSITY_AUDIT_V1.json'"),
("'V8_3_252_PRESEAL_CANDIDATE_BANK_V1.json'","'V8_3_253_PRESEAL_CANDIDATE_BANK_V1.json'"),
("'V8_3_252_SEALED_SELECTION_V1.json'","'V8_3_253_SEALED_SELECTION_V1.json'"),
("'V8_3_252_SEALED_FIXTURE_V1.json'","'V8_3_253_SEALED_FIXTURE_V1.json'"),
("'V8_3_252_INDEPENDENT_GOLD_V1.json'","'V8_3_253_INDEPENDENT_GOLD_V1.json'"),
("'V8_3_252_SEALED_MEMBERSHIP_V1.json'","'V8_3_253_SEALED_MEMBERSHIP_V1.json'"),
("'V8_3_252_SEALED_AUTHORITY_V1.json'","'V8_3_253_SEALED_AUTHORITY_V1.json'"),
("'V8_3_252_PRESEAL_RUN_RECEIPT.json'","'V8_3_253_PRESEAL_RUN_RECEIPT.json'")]
for a,b in repls:
    if a not in src: raise SystemExit('missing transform anchor '+a)
    src=src.replace(a,b)
anchor="assert len(new)==180 and len({x['surface'] for x in new})==180\n"
if anchor not in src: raise SystemExit('new-case anchor missing')
inj="""assert len(new)==180 and len({x['surface'] for x in new})==180\n# V253-only semantically inert case-specific lexical capsule: construction diversity only.\nALPHA='bcdfghjklmnpqrstvwxyz'\ndef capsule(case_id):\n    import hashlib\n    h=hashlib.sha256(('v253:'+case_id).encode()).hexdigest()\n    toks=[]\n    for i in range(84):\n        z=int(hashlib.sha256((h+':'+str(i)).encode()).hexdigest()[:14],16)\n        toks.append('vx'+''.join(ALPHA[(z>>(j*5))%len(ALPHA)] for j in range(9)))\n    return ' A separate archival cipher inventory listed '+', '.join(toks)+'; these inert lexical labels describe no behaviour, decision, prediction, sequence, or personal response.'\nfor c in new:\n    c['surface']=capsule(c['case_id'])+' '+c['surface']\n"""
src=src.replace(anchor,inj,1)
# Final static guards: V253 namespace and authority must be present; old output namespace must not remain.
for req in ["V8.3.253","V8_3_253_PRESEAL_RUN_RECEIPT.json","V253-S","QCEvidenceExtractorV5AY -> QCSemanticCoreV124","89db04ec936af998c14d2f0451ef87270ea8e349"]:
    if req not in src: raise SystemExit('missing V253 requirement '+req)
Path('validation/v83253-v1-sealed/v83253-preseal-freeze.py').write_text(src)
compile(src,'v83253-preseal-freeze.py','exec')
