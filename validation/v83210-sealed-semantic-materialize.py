import json,hashlib,pathlib,base64,gzip,zipfile
root=pathlib.Path('validation/v83210-v1-sealed')
auth=json.loads((root/'V8_3_210_SEALED_AUTHORITY_V1.json').read_text())
transport=json.loads((root/'V8_3_210_TRANSPORT_METADATA_V1.json').read_text())
def canon(o): return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
assert auth['validated_development_head_sha']=='3b38e1a445230428e4b48c7a19335ba3a9bfa568'
assert auth['development_checkpoint_inner_sha256']=='7689959df9d1fc22d309e19c76ea15531a19d006b07d132ddd2c7c63f803d21a'
assert auth['semantic_authority']=='QCSemanticCoreV86'
assert auth['v209_batch_a_rerun'] is False and auth['v209_batch_b_accessed'] is False
assert transport['conclusion']=='success' and transport['semantic_runtime_executed'] is False and transport['semantic_authority_loaded'] is False and transport['hashes_verified'] is True
fixture=json.loads((root/'V8_3_210_SEALED_FIXTURE_V1.json').read_text())
sel=json.loads((root/'V8_3_210_SEALED_SELECTION_V1.json').read_text())
gold=json.loads((root/'V8_3_210_INDEPENDENT_GOLD_V1.json').read_text())
membership=json.loads((root/'V8_3_210_SEALED_MEMBERSHIP_V1.json').read_text())
audit=json.loads((root/'V8_3_210_PRESEAL_DIVERSITY_AUDIT_V1.json').read_text())
for hk,obj in [('fixture',fixture),('selection',sel),('independent_gold',gold),('membership',membership),('preseal_audit',audit)]:
    assert hashlib.sha256(canon(obj)).hexdigest()==auth['hashes'][hk],hk
assert len(fixture['cases'])==60 and len(sel['batch_a'])==30 and len(sel['batch_b'])==30 and set(sel['batch_a']).isdisjoint(sel['batch_b'])
assert not (root/'V8_3_210_BATCH_A_FIRST_RUN_RESULTS.json').exists()
assert not (root/'V8_3_210_BATCH_B_FIRST_RUN_RESULTS.json').exists()
names=['V8_3_172_V171_V1_FAILURE_REGRESSION','V8_3_172_V171_V1_PREVIOUS_PASS_REGRESSION','V8_3_171_V170_V1_FAILURE_REGRESSION','V8_3_171_V170_V1_PREVIOUS_PASS_REGRESSION','V8_3_169_V168_V1_FAILURE_REGRESSION','V8_3_169_V168_V1_PREVIOUS_PASS_REGRESSION','V8_3_168_V167_V1_FAILURE_REGRESSION','V8_3_168_V167_V1_PREVIOUS_PASS_REGRESSION']
for n in names:
    p=pathlib.Path('validation/'+n+'.json.gz.b64');pathlib.Path('validation/'+n+'.json').write_bytes(gzip.decompress(base64.b64decode(p.read_text().strip())))
with zipfile.ZipFile('PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip') as z:z.extractall('.')
template=pathlib.Path('validation/run-v83196-full-regression-sweep-v2.cjs').read_text()
chain="'psc-v83196-v195-v1-hypothetical-preservation-repair.js','psc-v83197-v196-sealed-a-bounded-repair.js','psc-v83198-v197-sealed-a-bounded-repair.js','psc-v83199-v198-sealed-a-bounded-repair.js','psc-v83200-v199-sealed-a-bounded-repair.js','psc-v83201-v200-sealed-a-bounded-repair.js','psc-v83201-v200-v1-preservation-precedence-repair.js','psc-v83202-v201-sealed-a-bounded-repair.js','psc-v83203-v202-sealed-a-bounded-repair.js','psc-v83204-v203-sealed-a-bounded-repair.js','psc-v83205-v204-sealed-a-bounded-repair.js','psc-v83206-v205-compositional-generalization.js','psc-v83206-v205-v1-preservation-repair.js','psc-v83207-v206-mechanism-cue-repair.js','psc-v83207-v206-v1-preservation-repair.js','psc-v83208-v207-mechanism-cue-repair.js','psc-v83208-v207-v1-preservation-repair.js','psc-v83209-v208-evidence-slot-composition.js','psc-v83209-v208-v1-preservation-repair.js','qc-evidence-extractor-v1-review-candidate.js','qc-evidence-extractor-v1r-review-candidate.js','qc-evidence-extractor-v1r2-review-candidate.js','psc-v83209-semantic-rule-table-v3-review-candidate.js','psc-v83209-v208-semantic-rule-table-promotion.js','qc-evidence-extractor-v1r3-v210-concept-coverage.js','psc-v83210-v209-semantic-rule-table-v4.js','qc-evidence-extractor-v1r4-v210-relational-preservation.js','psc-v83210-v209-v1-relational-preservation.js','qc-evidence-extractor-v2-v210-relational-semantics.js','psc-v83210-v210-semantic-rule-table-v5.js','qc-evidence-extractor-v2r-v210-multilingual-aliases.js','psc-v83210-v210-semantic-rule-table-v6.js','qc-evidence-extractor-v2s-v210-context-sanitizer.js','psc-v83210-v210-semantic-rule-table-v7.js','qc-evidence-extractor-v2t-v210-contextual-recall.js','psc-v83210-v210-semantic-rule-table-v8-parent-containment.js'"
src=template.replace("'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];",chain+"];")
prefix=src.split("const files=fs.readdirSync('validation')")[0]
runner=prefix+"\nif(!s.QCSemanticCoreV86)throw Error('V86 missing');\nconst batch=(process.argv[2]||'A').toUpperCase();const root='validation/v83210-v1-sealed';const F=JSON.parse(fs.readFileSync(root+'/V8_3_210_SEALED_FIXTURE_V1.json','utf8'));const S=JSON.parse(fs.readFileSync(root+'/V8_3_210_SEALED_SELECTION_V1.json','utf8'));const ids=new Set(batch==='A'?S.batch_a:S.batch_b);const cases=F.cases.filter(c=>ids.has(c.case_id));let passed=0;const results=[];for(const c of cases){const r=s.QCSemanticCoreV86.analyze(c.surface,c.domain),a={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence},e={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence},ok=JSON.stringify(a)===JSON.stringify(e);if(ok)passed++;results.push({case_id:c.case_id,category:c.category,language:c.language,pass:ok,expected:e,actual:a,surface:c.surface,domain:c.domain});}const out={authority:'V8.3.210 V1 SEALED BATCH '+batch+' FIRST RUN',run_id:process.env.GITHUB_RUN_ID,run_attempt:process.env.GITHUB_RUN_ATTEMPT,total:cases.length,passed,failed:cases.length-passed,results};fs.writeFileSync('V8_3_210_BATCH_'+batch+'_FIRST_RUN_RESULTS.json',JSON.stringify(out,null,2));console.log('Batch',batch,passed+'/'+cases.length);if(passed!==cases.length)process.exit(1);\n"
(root/'run-v210-sealed.cjs').write_text(runner)
print('V8.3.210 semantic runner materialized for exact QCSemanticCoreV86')
