import hashlib,json,pathlib,zipfile,io,traceback
ROOT=pathlib.Path('.'); OUT=ROOT/'validation/v83217-v1-sealed'; AUTH=OUT/'V8_3_217_SEALED_AUTHORITY_V1.json'
FILES={'candidate_bank':'V8_3_217_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_217_SEALED_SELECTION_V1.json','fixture':'V8_3_217_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_217_INDEPENDENT_GOLD_V1.json','membership':'V8_3_217_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_217_PRESEAL_DIVERSITY_AUDIT_V1.json'}
raw_sha=lambda b:hashlib.sha256(b).hexdigest()
def canonical_sha_obj(o):
 return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
result={'candidate':'V8.3.217','phase':'transport-only-r4-canonical-hash','semantic_runtime_executed':False,'semantic_authority_loaded':False,'batch_a_executed':False,'batch_b_executed':False,'checks':{},'errors':[],'pass':False}
try:
 auth=json.loads(AUTH.read_text()); result['validated_development_head_sha']=auth.get('validated_development_head_sha')
 result['checks']['development_sha']=auth.get('validated_development_head_sha')=='456a88d01b671f0cb92a0be31f4d34d68f60d135'; result['checks']['preseal_pass']=auth.get('preseal_pass') is True
 payload={}; canonical={}; raw={}; details={}
 for key,name in FILES.items():
  p=OUT/name; exists=p.exists(); detail={'file':name,'exists':exists,'expected_canonical':auth['hashes'].get(key)}
  if exists:
   b=p.read_bytes(); obj=json.loads(b.decode('utf-8')); payload[name]=b; detail['actual_canonical']=canonical_sha_obj(obj); detail['canonical_match']=detail['actual_canonical']==detail['expected_canonical']; detail['raw_sha256']=raw_sha(b)
  else: detail.update({'actual_canonical':None,'canonical_match':False,'raw_sha256':None})
  details[key]=detail
 result['hash_details']=details; result['checks']['all_frozen_files_exist']=all(x['exists'] for x in details.values()); result['checks']['all_frozen_canonical_hashes_match']=all(x['canonical_match'] for x in details.values())
 if not all(result['checks'].values()): raise AssertionError('frozen authority/canonical-hash prerequisite failed')
 for key,d in details.items(): canonical[key]=d['actual_canonical']; raw[key]=d['raw_sha256']
 buf=io.BytesIO()
 with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED) as z:
  for name,b in payload.items():z.writestr(name,b)
  z.writestr(AUTH.name,AUTH.read_bytes())
 bundle=buf.getvalue(); bundle_path=OUT/'V8_3_217_FROZEN_TRANSPORT_BUNDLE_V1.zip'; bundle_path.write_bytes(bundle); bundle_sha=raw_sha(bundle)
 (OUT/'V8_3_217_FROZEN_TRANSPORT_BUNDLE_V1_SHA256.txt').write_text(bundle_sha+'  '+bundle_path.name+'\n')
 with zipfile.ZipFile(io.BytesIO(bundle),'r') as z:
  zip_ok=z.testzip() is None; names_ok=set(z.namelist())==set(payload)|{AUTH.name}; content_ok=all(canonical_sha_obj(json.loads(z.read(name).decode('utf-8')))==auth['hashes'][key] for key,name in FILES.items())
 def accepted(blob,expected):
  try:o=json.loads(blob.decode('utf-8'))
  except Exception:return False
  return canonical_sha_obj(o)==expected
 wrong=not accepted(b'not-json',auth['hashes']['fixture']); random=not accepted(bytes(range(32)),auth['hashes']['fixture']); newline=not (raw_sha(payload[FILES['fixture']]+b'\n')==raw[ 'fixture'])
 result.update({'frozen_canonical_hashes':canonical,'frozen_raw_file_sha256':raw,'bundle_sha256':bundle_sha,'zip_integrity':zip_ok,'bundle_content_pure':names_ok and content_ok,'wrong_type_rejected':wrong,'random_binary_rejected':random,'newline_modified_raw_transport_rejected':newline})
 result['checks'].update({'zip_integrity':zip_ok,'bundle_content_pure':names_ok and content_ok,'wrong_type_rejected':wrong,'random_binary_rejected':random,'newline_modified_raw_transport_rejected':newline}); result['pass']=all(result['checks'].values())
 if result['pass']:
  res_tmp=OUT/'V8_3_217_TRANSPORT_VERIFICATION_V1.json'; res_tmp.write_text(json.dumps(result,indent=2)+'\n'); cp=ROOT/'PSC_V8_3_217_V1_TRANSPORT_CHECKPOINT.zip'
  with zipfile.ZipFile(cp,'w',zipfile.ZIP_DEFLATED) as z:
   z.write(res_tmp,res_tmp.name);z.write(bundle_path,bundle_path.name);z.write(OUT/'V8_3_217_FROZEN_TRANSPORT_BUNDLE_V1_SHA256.txt','V8_3_217_FROZEN_TRANSPORT_BUNDLE_V1_SHA256.txt');z.write(AUTH,AUTH.name)
  (ROOT/'PSC_V8_3_217_V1_TRANSPORT_CHECKPOINT_SHA256.txt').write_text(raw_sha(cp.read_bytes())+'  '+cp.name+'\n')
except Exception as e:
 result['errors'].append(type(e).__name__+': '+str(e));result['trace_tail']=traceback.format_exc().splitlines()[-4:]
finally:
 (OUT/'V8_3_217_TRANSPORT_VERIFICATION_V1.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
if not result['pass']:raise SystemExit(1)
