import json,hashlib,pathlib,zipfile,io
R=pathlib.Path('.');O=R/'validation/v83220-v1-sealed';A=json.loads((O/'V8_3_220_SEALED_AUTHORITY_V1.json').read_text())
FILES={'candidate_bank':'V8_3_220_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_220_SEALED_SELECTION_V1.json','fixture':'V8_3_220_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_220_INDEPENDENT_GOLD_V1.json','membership':'V8_3_220_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_220_PRESEAL_DIVERSITY_AUDIT_V1.json'}
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def csha(o):return hashlib.sha256(canon(o)).hexdigest()
def raw(b):return hashlib.sha256(b).hexdigest()
assert A['validated_development_head_sha']=='06ac0e51c958f5c64dcb97f91d66b122d3048bf8' and A['semantic_authority']=='QCEvidenceExtractorV5Y -> QCSemanticCoreV98' and A['preseal_pass'] is True
payload={};details={}
for k,n in FILES.items():
 b=(O/n).read_bytes();o=json.loads(b.decode());got=csha(o);assert got==A['hashes'][k],k;payload[n]=b;details[k]={'canonical_sha256':got,'raw_sha256':raw(b)}
buf=io.BytesIO()
with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED) as z:
 for n,b in payload.items():z.writestr(n,b)
 z.writestr('V8_3_220_SEALED_AUTHORITY_V1.json',(O/'V8_3_220_SEALED_AUTHORITY_V1.json').read_bytes())
bundle=buf.getvalue();bp=O/'V8_3_220_FROZEN_TRANSPORT_BUNDLE_V1.zip';bp.write_bytes(bundle);bsha=raw(bundle)
(O/'V8_3_220_FROZEN_TRANSPORT_BUNDLE_V1_SHA256.txt').write_text(bsha+'  '+bp.name+'\n')
with zipfile.ZipFile(io.BytesIO(bundle)) as z:
 assert z.testzip() is None and set(z.namelist())==set(payload)|{'V8_3_220_SEALED_AUTHORITY_V1.json'}
 for k,n in FILES.items():assert csha(json.loads(z.read(n).decode()))==A['hashes'][k]
result={'candidate':'V8.3.220','phase':'transport-only','validated_development_head_sha':A['validated_development_head_sha'],'semantic_authority':A['semantic_authority'],'frozen_hashes':details,'bundle_sha256':bsha,'zip_integrity':True,'bundle_content_pure':True,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'batch_a_executed':False,'batch_b_executed':False,'v217_sealed_rerun':False,'v218_sealed_rerun':False,'v219_sealed_rerun':False,'pass':True}
res=O/'V8_3_220_TRANSPORT_VERIFICATION_V1.json';res.write_text(json.dumps(result,indent=2)+'\n')
cp=R/'PSC_V8_3_220_V1_TRANSPORT_CHECKPOINT.zip'
with zipfile.ZipFile(cp,'w',zipfile.ZIP_DEFLATED) as z:
 for p in [res,bp,O/'V8_3_220_FROZEN_TRANSPORT_BUNDLE_V1_SHA256.txt',O/'V8_3_220_SEALED_AUTHORITY_V1.json']:z.write(p,p.name)
(R/'PSC_V8_3_220_V1_TRANSPORT_CHECKPOINT_SHA256.txt').write_text(raw(cp.read_bytes())+'  '+cp.name+'\n');print(json.dumps(result))
