import hashlib, json, pathlib, zipfile, io

ROOT=pathlib.Path('.')
OUT=ROOT/'validation/v83217-v1-sealed'
AUTH=OUT/'V8_3_217_SEALED_AUTHORITY_V1.json'
FILES={
 'candidate_bank':'V8_3_217_PRESEAL_CANDIDATE_BANK_V1.json',
 'selection':'V8_3_217_SEALED_SELECTION_V1.json',
 'fixture':'V8_3_217_SEALED_FIXTURE_V1.json',
 'independent_gold':'V8_3_217_INDEPENDENT_GOLD_V1.json',
 'membership':'V8_3_217_SEALED_MEMBERSHIP_V1.json',
 'preseal_audit':'V8_3_217_PRESEAL_DIVERSITY_AUDIT_V1.json',
}

def sha(b): return hashlib.sha256(b).hexdigest()
auth=json.loads(AUTH.read_text())
assert auth['validated_development_head_sha']=='456a88d01b671f0cb92a0be31f4d34d68f60d135'
assert auth['preseal_pass'] is True
verified={}
payload={}
for key,name in FILES.items():
 p=OUT/name
 b=p.read_bytes(); payload[name]=b
 got=sha(b); exp=auth['hashes'][key]
 assert got==exp,(key,got,exp)
 verified[key]=got

# Transport bundle contains only immutable frozen inputs/authority; no runtime JS.
buf=io.BytesIO()
with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED) as z:
 for name,b in payload.items(): z.writestr(name,b)
 z.writestr('V8_3_217_SEALED_AUTHORITY_V1.json',AUTH.read_bytes())
bundle=buf.getvalue()
bundle_path=OUT/'V8_3_217_FROZEN_TRANSPORT_BUNDLE_V1.zip'
bundle_path.write_bytes(bundle)
bundle_sha=sha(bundle)
(OUT/'V8_3_217_FROZEN_TRANSPORT_BUNDLE_V1_SHA256.txt').write_text(bundle_sha+'  '+bundle_path.name+'\n')

# Verify intact bundle and fail-closed corruption/type behavior without semantic execution.
with zipfile.ZipFile(io.BytesIO(bundle),'r') as z:
 assert z.testzip() is None
 names=set(z.namelist())
 assert names==set(payload)|{'V8_3_217_SEALED_AUTHORITY_V1.json'}
 for key,name in FILES.items(): assert sha(z.read(name))==auth['hashes'][key]

def accepted_as_frozen_json(blob,expected):
 try:
  json.loads(blob.decode('utf-8'))
 except Exception:
  return False
 return sha(blob)==expected
wrong_type_rejected=not accepted_as_frozen_json(b'not-json',auth['hashes']['fixture'])
random_binary_rejected=not accepted_as_frozen_json(bytes(range(32)),auth['hashes']['fixture'])
newline_modified_rejected=not accepted_as_frozen_json(payload[FILES['fixture']]+b'\n',auth['hashes']['fixture'])
assert wrong_type_rejected and random_binary_rejected and newline_modified_rejected

result={
 'candidate':'V8.3.217','phase':'transport-only','validated_development_head_sha':auth['validated_development_head_sha'],
 'frozen_hashes':verified,'bundle_sha256':bundle_sha,'zip_integrity':True,'bundle_content_pure':True,
 'wrong_type_rejected':wrong_type_rejected,'random_binary_rejected':random_binary_rejected,
 'newline_modified_rejected':newline_modified_rejected,'semantic_runtime_executed':False,
 'semantic_authority_loaded':False,'batch_a_executed':False,'batch_b_executed':False,'pass':True,
}
res=OUT/'V8_3_217_TRANSPORT_VERIFICATION_V1.json'
res.write_text(json.dumps(result,indent=2)+'\n')
# Dedicated transport checkpoint.
cp=ROOT/'PSC_V8_3_217_V1_TRANSPORT_CHECKPOINT.zip'
with zipfile.ZipFile(cp,'w',zipfile.ZIP_DEFLATED) as z:
 z.write(res,res.name); z.write(bundle_path,bundle_path.name); z.write(OUT/'V8_3_217_FROZEN_TRANSPORT_BUNDLE_V1_SHA256.txt','V8_3_217_FROZEN_TRANSPORT_BUNDLE_V1_SHA256.txt'); z.write(AUTH,AUTH.name)
cp_sha=sha(cp.read_bytes())
(ROOT/'PSC_V8_3_217_V1_TRANSPORT_CHECKPOINT_SHA256.txt').write_text(cp_sha+'  '+cp.name+'\n')
print(json.dumps(result))
