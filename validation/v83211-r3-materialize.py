import json,hashlib,pathlib,base64,gzip,zipfile,sys
root=pathlib.Path(sys.argv[1]).resolve(); carrier=root/'validation/v83211-r3-sealed'
def sha(b): return hashlib.sha256(b).hexdigest()
def canon(o): return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
m=json.loads((carrier/'MANIFEST.json').read_text())
parts=[]
for i,want in enumerate(m['chunk_sha256']):
    b=(carrier/f'part{i}.b64').read_text().strip().encode(); assert sha(b)==want,(i,sha(b),want); parts.append(b)
joined=b''.join(parts); assert sha(joined)==m['combined_base64_sha256']
gz=base64.b64decode(joined); assert sha(gz)==m['gzip_sha256']
bundle=json.loads(gzip.decompress(gz))
for k,want in m['object_hashes'].items(): assert sha(canon(bundle[k]))==want,(k,sha(canon(bundle[k])),want)
assert m['validated_development_head_sha']=='ec0646c126ffd60358013663c148f4ffd7080ca2'
assert m['semantic_authority']=='QCSemanticCoreV89'
assert len(bundle['candidate_bank']['cases'])==180 and len(bundle['fixture']['cases'])==60
assert len(bundle['selection']['batch_a'])==30 and len(bundle['selection']['batch_b'])==30
assert set(bundle['selection']['batch_a']).isdisjoint(bundle['selection']['batch_b'])
a=bundle['preseal_audit']; assert a['pass'] is True and a['internal_max_similarity']<.75 and a['external_cases_at_or_above_0_75']==0 and a['exact_external_duplicates']==0
assert a['runtime_executed_during_bank_or_selection'] is False and a['semantic_authority_loaded_during_bank_or_selection'] is False and a['selection_uses_runtime_output'] is False
names={'candidate_bank':'V8_3_211_R3_PRESEAL_CANDIDATE_BANK.json','selection':'V8_3_211_R3_SEALED_SELECTION.json','fixture':'V8_3_211_R3_SEALED_FIXTURE.json','independent_gold':'V8_3_211_R3_INDEPENDENT_GOLD.json','membership':'V8_3_211_R3_SEALED_MEMBERSHIP.json','preseal_audit':'V8_3_211_R3_PRESEAL_DIVERSITY_AUDIT.json','authority':'V8_3_211_R3_SEALED_AUTHORITY.json'}
for k,n in names.items():(carrier/n).write_text(json.dumps(bundle[k],ensure_ascii=False,indent=2)+'\n')
meta={'candidate':'V8.3.211','phase':'r3-transport-only','conclusion':'success','semantic_runtime_executed':False,'semantic_authority_loaded':False,'hashes_verified':True,'fixture_materialized':True,'validated_development_head_sha':m['validated_development_head_sha'],'semantic_authority':m['semantic_authority'],'carrier_commit':'28b739914d6a16836547437452d11206df6978b2','v210_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False}
(carrier/'V8_3_211_R3_TRANSPORT_METADATA.json').write_text(json.dumps(meta,indent=2)+'\n')
needed=['V8_3_172_V171_V1_FAILURE_REGRESSION','V8_3_172_V171_V1_PREVIOUS_PASS_REGRESSION','V8_3_171_V170_V1_FAILURE_REGRESSION','V8_3_171_V170_V1_PREVIOUS_PASS_REGRESSION','V8_3_169_V168_V1_FAILURE_REGRESSION','V8_3_169_V168_V1_PREVIOUS_PASS_REGRESSION','V8_3_168_V167_V1_FAILURE_REGRESSION','V8_3_168_V167_V1_PREVIOUS_PASS_REGRESSION']
for n in needed:
    p=root/'validation'/f'{n}.json.gz.b64'; (root/'validation'/f'{n}.json').write_bytes(gzip.decompress(base64.b64decode(p.read_text().strip())))
with zipfile.ZipFile(root/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip') as z:z.extractall(root)
src=(root/'validation/run-v83196-full-regression-sweep-v2.cjs').read_text()
chain="'psc-v83196-v195-v1-hypothetical-preservation-repair.js','psc-v83197-v196-sealed-a-bounded-repair.js','psc-v83198-v197-sealed-a-bounded-repair.js','psc-v83199-v198-sealed-a-bounded-repair.js','psc-v83200-v199-sealed-a-bounded-repair.js','psc-v83201-v200-sealed-a-bounded-repair.js','psc-v83201-v200-v1-preservation-precedence-repair.js','psc-v83202-v201-sealed-a-bounded-repair.js','psc-v83203-v202-sealed-a-bounded-repair.js','psc-v83204-v203-sealed-a-bounded-repair.js','psc-v83205-v204-sealed-a-bounded-repair.js','psc-v83206-v205-compositional-generalization.js','psc-v83206-v205-v1-preservation-repair.js','psc-v83207-v206-mechanism-cue-repair.js','psc-v83207-v206-v1-preservation-repair.js','psc-v83208-v207-mechanism-cue-repair.js','psc-v83208-v207-v1-preservation-repair.js','psc-v83209-v208-evidence-slot-composition.js','psc-v83209-v208-v1-preservation-repair.js','qc-evidence-extractor-v1-review-candidate.js','qc-evidence-extractor-v1r-review-candidate.js','qc-evidence-extractor-v1r2-review-candidate.js','psc-v83209-semantic-rule-table-v3-review-candidate.js','psc-v83209-v208-semantic-rule-table-promotion.js','qc-evidence-extractor-v1r3-v210-concept-coverage.js','psc-v83210-v209-semantic-rule-table-v4.js','qc-evidence-extractor-v1r4-v210-relational-preservation.js','psc-v83210-v209-v1-relational-preservation.js','qc-evidence-extractor-v2-v210-relational-semantics.js','psc-v83210-v210-semantic-rule-table-v5.js','qc-evidence-extractor-v2r-v210-multilingual-aliases.js','psc-v83210-v210-semantic-rule-table-v6.js','qc-evidence-extractor-v2s-v210-context-sanitizer.js','psc-v83210-v210-semantic-rule-table-v7.js','qc-evidence-extractor-v2t-v210-contextual-recall.js','psc-v83210-v210-semantic-rule-table-v8-parent-containment.js','qc-evidence-extractor-v3-v211-context-scoped.js','psc-v83211-v210-context-scoped-rule-table.js','qc-evidence-extractor-v3r-v211-preservation.js','psc-v83211-v210-preservation-containment.js','qc-evidence-extractor-v4-v211-relational-recall.js','psc-v83211-v210-v89-relational-recall.js'"
src=src.replace("'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];",chain+"];")
prefix=src.split("const files=fs.readdirSync('validation')")[0]
tail=r'''
if(!s.QCSemanticCoreV89)throw Error('QCSemanticCoreV89 missing');
const batch=(process.argv[2]||'A').toUpperCase(),root='validation/v83211-r3-sealed';
const F=JSON.parse(fs.readFileSync(root+'/V8_3_211_R3_SEALED_FIXTURE.json','utf8')),S=JSON.parse(fs.readFileSync(root+'/V8_3_211_R3_SEALED_SELECTION.json','utf8'));
const ids=new Set(batch==='A'?S.batch_a:S.batch_b),cases=F.cases.filter(c=>ids.has(c.case_id));let passed=0;const results=[];
for(const c of cases){const r=s.QCSemanticCoreV89.analyze(c.surface,c.domain),a={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence},e={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence},ok=JSON.stringify(a)===JSON.stringify(e);if(ok)passed++;results.push({case_id:c.case_id,mechanism:c.mechanism,language:c.language,domain:c.domain,pass:ok,expected:e,actual:a,surface:c.surface});}
const out={authority:'V8.3.211 R3 SEALED BATCH '+batch+' FIRST RUN',run_id:process.env.GITHUB_RUN_ID,run_attempt:process.env.GITHUB_RUN_ATTEMPT,total:cases.length,passed,failed:cases.length-passed,results};fs.writeFileSync('V8_3_211_R3_BATCH_'+batch+'_FIRST_RUN_RESULTS.json',JSON.stringify(out,null,2));console.log('Batch',batch,passed+'/'+cases.length);if(passed!==cases.length)process.exit(1);
'''
(carrier/'run-v211-r3-sealed.cjs').write_text(prefix+tail)
print(json.dumps(meta))
