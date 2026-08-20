import json,hashlib,pathlib,base64,gzip,zipfile
root=pathlib.Path('validation/v83208-v1-sealed')
fixture=json.loads((root/'V8_3_208_SEALED_FIXTURE_V1.json').read_text())
sel=json.loads((root/'V8_3_208_SEALED_SELECTION_V1.json').read_text())
gold=json.loads((root/'V8_3_208_INDEPENDENT_GOLD_V1.json').read_text())
auth=json.loads((root/'V8_3_208_SEALED_AUTHORITY_V1.json').read_text())
membership=json.loads((root/'V8_3_208_SEALED_MEMBERSHIP_V1.json').read_text())
transport=json.loads((root/'V8_3_208_TRANSPORT_METADATA_V1.json').read_text())
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
for k,o in {'fixture':fixture,'selection':sel,'membership':membership,'independent_gold':gold}.items():assert hashlib.sha256(canon(o)).hexdigest()==auth['hashes'][k],k
assert auth['validated_development_head_sha']=='f787117690e4aa4e0095c70cc80afc6d982f8e88'
assert auth['semantic_authority']=='QCSemanticCoreV77R'
assert auth['v207_batch_a_rerun'] is False and auth['v207_batch_b_accessed'] is False
assert transport['conclusion']=='success' and transport['semantic_runtime_executed'] is False and transport['semantic_authority_loaded'] is False
assert len(fixture['cases'])==60 and len(sel['batch_a'])==30 and len(sel['batch_b'])==30 and set(sel['batch_a']).isdisjoint(sel['batch_b'])
assert not (root/'V8_3_208_BATCH_A_FIRST_RUN_RESULTS.json').exists()
assert not (root/'V8_3_208_BATCH_B_FIRST_RUN_RESULTS.json').exists()
names=['V8_3_172_V171_V1_FAILURE_REGRESSION','V8_3_172_V171_V1_PREVIOUS_PASS_REGRESSION','V8_3_171_V170_V1_FAILURE_REGRESSION','V8_3_171_V170_V1_PREVIOUS_PASS_REGRESSION','V8_3_169_V168_V1_FAILURE_REGRESSION','V8_3_169_V168_V1_PREVIOUS_PASS_REGRESSION','V8_3_168_V167_V1_FAILURE_REGRESSION','V8_3_168_V167_V1_PREVIOUS_PASS_REGRESSION']
for n in names:
 p=pathlib.Path('validation/'+n+'.json.gz.b64');pathlib.Path('validation/'+n+'.json').write_bytes(gzip.decompress(base64.b64decode(p.read_text().strip())))
with zipfile.ZipFile('PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip') as z:z.extractall('.')
template=pathlib.Path('validation/run-v83196-full-regression-sweep-v2.cjs').read_text()
chain="'psc-v83196-v195-v1-hypothetical-preservation-repair.js','psc-v83197-v196-sealed-a-bounded-repair.js','psc-v83198-v197-sealed-a-bounded-repair.js','psc-v83199-v198-sealed-a-bounded-repair.js','psc-v83200-v199-sealed-a-bounded-repair.js','psc-v83201-v200-sealed-a-bounded-repair.js','psc-v83201-v200-v1-preservation-precedence-repair.js','psc-v83202-v201-sealed-a-bounded-repair.js','psc-v83203-v202-sealed-a-bounded-repair.js','psc-v83204-v203-sealed-a-bounded-repair.js','psc-v83205-v204-sealed-a-bounded-repair.js','psc-v83206-v205-compositional-generalization.js','psc-v83206-v205-v1-preservation-repair.js','psc-v83207-v206-mechanism-cue-repair.js','psc-v83207-v206-v1-preservation-repair.js','psc-v83208-v207-mechanism-cue-repair.js','psc-v83208-v207-v1-preservation-repair.js'"
src=template.replace("'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];",chain+"];")
prefix=src.split("const files=fs.readdirSync('validation')")[0]
runner=prefix+"\nif(!s.QCSemanticCoreV77R)throw Error('V77R missing');\nconst batch=(process.argv[2]||'A').toUpperCase();const root='validation/v83208-v1-sealed';const F=JSON.parse(fs.readFileSync(root+'/V8_3_208_SEALED_FIXTURE_V1.json','utf8'));const S=JSON.parse(fs.readFileSync(root+'/V8_3_208_SEALED_SELECTION_V1.json','utf8'));const ids=new Set(batch==='A'?S.batch_a:S.batch_b);const cases=F.cases.filter(c=>ids.has(c.case_id));let passed=0;const results=[];for(const c of cases){const r=s.QCSemanticCoreV77R.analyze(c.surface,c.domain),a={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence},e={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence},ok=JSON.stringify(a)===JSON.stringify(e);if(ok)passed++;results.push({case_id:c.case_id,category:c.category,pass:ok,expected:e,actual:a,surface:c.surface,domain:c.domain});}const out={authority:'V8.3.208 V1 SEALED BATCH '+batch+' FIRST RUN',run_id:process.env.GITHUB_RUN_ID,run_attempt:process.env.GITHUB_RUN_ATTEMPT,total:cases.length,passed,failed:cases.length-passed,results};fs.writeFileSync('V8_3_208_BATCH_'+batch+'_FIRST_RUN_RESULTS.json',JSON.stringify(out,null,2));console.log('Batch',batch,passed+'/'+cases.length);if(passed!==cases.length)process.exit(1);\n"
(root/'run-v208-sealed.cjs').write_text(runner)
