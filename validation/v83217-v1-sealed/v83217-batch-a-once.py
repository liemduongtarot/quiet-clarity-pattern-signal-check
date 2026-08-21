import json,hashlib,pathlib,subprocess,shutil,os,zipfile

REPO=pathlib.Path.cwd()
TARGET='456a88d01b671f0cb92a0be31f4d34d68f60d135'
SEALED=REPO/'validation'/'v83217-v1-sealed'
WORK=pathlib.Path('/tmp/v83217-batch-a-authority')
ATTEMPT=SEALED/'V8_3_217_BATCH_A_ATTEMPT_MARKER.json'
FIRST=SEALED/'V8_3_217_SEALED_FIRST_RUN_MARKER.json'
RESULT=SEALED/'V8_3_217_BATCH_A_RESULT_V1.json'

EXT=[
'psc-v83197-v196-sealed-a-bounded-repair.js','psc-v83198-v197-sealed-a-bounded-repair.js','psc-v83199-v198-sealed-a-bounded-repair.js','psc-v83200-v199-sealed-a-bounded-repair.js','psc-v83201-v200-sealed-a-bounded-repair.js','psc-v83201-v200-v1-preservation-precedence-repair.js','psc-v83202-v201-sealed-a-bounded-repair.js','psc-v83203-v202-sealed-a-bounded-repair.js','psc-v83204-v203-sealed-a-bounded-repair.js','psc-v83205-v204-sealed-a-bounded-repair.js','psc-v83206-v205-compositional-generalization.js','psc-v83206-v205-v1-preservation-repair.js','psc-v83207-v206-mechanism-cue-repair.js','psc-v83207-v206-v1-preservation-repair.js','psc-v83208-v207-mechanism-cue-repair.js','psc-v83208-v207-v1-preservation-repair.js','psc-v83209-v208-evidence-slot-composition.js','psc-v83209-v208-v1-preservation-repair.js','qc-evidence-extractor-v1-review-candidate.js','qc-evidence-extractor-v1r-review-candidate.js','qc-evidence-extractor-v1r2-review-candidate.js','psc-v83209-semantic-rule-table-v3-review-candidate.js','psc-v83209-v208-semantic-rule-table-promotion.js','qc-evidence-extractor-v1r3-v210-concept-coverage.js','psc-v83210-v209-semantic-rule-table-v4.js','qc-evidence-extractor-v1r4-v210-relational-preservation.js','psc-v83210-v209-v1-relational-preservation.js','qc-evidence-extractor-v2-v210-relational-semantics.js','psc-v83210-v210-semantic-rule-table-v5.js','qc-evidence-extractor-v2r-v210-multilingual-aliases.js','psc-v83210-v210-semantic-rule-table-v6.js','qc-evidence-extractor-v2s-v210-context-sanitizer.js','psc-v83210-v210-semantic-rule-table-v7.js','qc-evidence-extractor-v2t-v210-contextual-recall.js','psc-v83210-v210-semantic-rule-table-v8-parent-containment.js','qc-evidence-extractor-v3-v211-context-scoped.js','psc-v83211-v210-context-scoped-rule-table.js','qc-evidence-extractor-v3r-v211-preservation.js','psc-v83211-v210-preservation-containment.js','qc-evidence-extractor-v4-v211-relational-recall.js','psc-v83211-v210-v89-relational-recall.js','qc-evidence-extractor-v5-v212-scope-propagation.js','psc-v83212-v211-v90-scope-propagation.js','qc-evidence-extractor-v5r-v212-delegated-decision-preservation.js','psc-v83212-v211-v91-delegated-decision-preservation.js','qc-evidence-extractor-v5s-v212-relational-recall.js','psc-v83212-v211-v92-relational-recall.js','qc-evidence-extractor-v5t-v213-relational-paraphrase-recall.js','psc-v83213-v212-v93-relational-paraphrase-recall.js','qc-evidence-extractor-v5u-v214-sealed-recall.js','psc-v83214-v213-v94-sealed-recall.js','qc-evidence-extractor-v5u2-v214-clarification-containment.js','psc-v83214-v213-v94r-clarification-containment.js','qc-evidence-extractor-v5v-v215-compositional-recall.js','psc-v83215-v214-v95-compositional-recall.js','qc-evidence-extractor-v5w-v216-sealed-recall.js','psc-v83216-v215-v96-sealed-recall.js','qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js']

def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def sha_obj(o):return hashlib.sha256(canon(o)).hexdigest()
def fsha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def sh(*a,cwd=None):return subprocess.run(list(a),cwd=cwd,text=True,check=True)

# The reservation markers must already be durably committed by the workflow before semantic loading.
if not ATTEMPT.exists() or not FIRST.exists():raise SystemExit('durable Batch A reservation markers missing')
if RESULT.exists():raise SystemExit('Batch A result already exists; refusing rerun')
att=json.loads(ATTEMPT.read_text()); first=json.loads(FIRST.read_text())
assert att['candidate']=='V8.3.217' and att['batch']=='A' and att['validated_development_head_sha']==TARGET
assert first['candidate']=='V8.3.217' and first['reserved_batch']=='A' and first['validated_development_head_sha']==TARGET
assert att.get('semantic_runtime_executed') is False and first.get('semantic_runtime_executed') is False

# Revalidate the exact frozen preconditions after marker persistence, before loading semantic authority.
auth=json.loads((SEALED/'V8_3_217_SEALED_AUTHORITY_V1.json').read_text())
audit=json.loads((SEALED/'V8_3_217_PRESEAL_DIVERSITY_AUDIT_V1.json').read_text())
selection=json.loads((SEALED/'V8_3_217_SEALED_SELECTION_V1.json').read_text())
fixture=json.loads((SEALED/'V8_3_217_SEALED_FIXTURE_V1.json').read_text())
gold=json.loads((SEALED/'V8_3_217_INDEPENDENT_GOLD_V1.json').read_text())
membership=json.loads((SEALED/'V8_3_217_SEALED_MEMBERSHIP_V1.json').read_text())
transport=json.loads((SEALED/'V8_3_217_TRANSPORT_VERIFICATION_V1.json').read_text())
preflight=json.loads((SEALED/'V8_3_217_STATIC_SEALED_PREFLIGHT_V1.json').read_text())
assert auth['validated_development_head_sha']==TARGET and auth['semantic_authority']=='QCSemanticCoreV97'
assert auth['step_111_authorized'] is False and auth['production_authorized'] is False and auth['preseal_pass'] is True
checks={'candidate_bank':json.loads((SEALED/'V8_3_217_PRESEAL_CANDIDATE_BANK_V1.json').read_text()),'selection':selection,'fixture':fixture,'independent_gold':gold,'membership':membership,'preseal_audit':audit}
for k,o in checks.items():assert sha_obj(o)==auth['hashes'][k],k
assert audit['pass'] is True and transport['pass'] is True and preflight['pass'] is True
assert transport['semantic_runtime_executed'] is False and preflight['semantic_runtime_executed'] is False
assert len(selection['batch_a'])==30 and len(selection['batch_b'])==30 and set(selection['batch_a']).isdisjoint(selection['batch_b'])
memA={x['case_id'] for x in membership['cases'] if x['batch']=='A'}
assert memA==set(selection['batch_a']) and len(memA)==30

# Pin exact DEVELOPMENT source.
sh('git','fetch','--depth=1','origin',TARGET)
if WORK.exists():shutil.rmtree(WORK)
sh('git','worktree','add','--detach',str(WORK),TARGET)
assert subprocess.check_output(['git','-C',str(WORK),'rev-parse','HEAD'],text=True).strip()==TARGET
VAL=WORK/'validation';runtime=VAL/'v83217-v1-sealed-runtime';runtime.mkdir(exist_ok=True)
for fn in ['V8_3_217_SEALED_SELECTION_V1.json','V8_3_217_SEALED_FIXTURE_V1.json','V8_3_217_INDEPENDENT_GOLD_V1.json']:
 shutil.copy2(SEALED/fn,runtime/fn)

# Reuse only the proven loader prefix from the exact DEVELOPMENT SHA, then append the exact V97 chain.
base=(VAL/'run-v83196-full-regression-sweep-v2.cjs').read_text()
needle="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];";assert needle in base
base=base.replace(needle,','.join(repr(x) for x in EXT)+'];',1)
marker="const files=fs.readdirSync('validation')";assert marker in base
prefix=base.split(marker)[0]
runner=runtime/'run-v83217-batch-a-once.cjs'
tail=r'''
if(!s.QCEvidenceExtractorV5X)throw Error('QCEvidenceExtractorV5X missing');
if(!s.QCSemanticCoreV97)throw Error('QCSemanticCoreV97 missing');
const root='validation/v83217-v1-sealed-runtime';
const F=JSON.parse(fs.readFileSync(root+'/V8_3_217_SEALED_FIXTURE_V1.json','utf8'));
const S=JSON.parse(fs.readFileSync(root+'/V8_3_217_SEALED_SELECTION_V1.json','utf8'));
const G=JSON.parse(fs.readFileSync(root+'/V8_3_217_INDEPENDENT_GOLD_V1.json','utf8'));
const gold=new Map(G.cases.map(x=>[x.case_id,x.expected]));
const ids=new Set(S.batch_a),cases=F.cases.filter(c=>ids.has(c.case_id));
if(cases.length!==30)throw Error('Batch A cardinality '+cases.length);
let passed=0;const results=[];
for(const c of cases){
 const r=s.QCSemanticCoreV97.analyze(c.surface,c.domain);
 const a={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};
 const ge=gold.get(c.case_id);if(!ge)throw Error('missing gold '+c.case_id);
 const e={route:ge.route,families:[...(ge.families||[])].sort(),sequence:!!ge.sequence};
 const ok=JSON.stringify(a)===JSON.stringify(e);if(ok)passed++;
 results.push({case_id:c.case_id,category:c.category,language:c.language,domain:c.domain,pass:ok,expected:e,actual:a,surface:c.surface});
}
const out={authority:'V8.3.217 V1 SEALED BATCH A FIRST RUN',run_id:process.env.GITHUB_RUN_ID,run_attempt:process.env.GITHUB_RUN_ATTEMPT,validated_development_head_sha:'456a88d01b671f0cb92a0be31f4d34d68f60d135',semantic_authority:'QCEvidenceExtractorV5X -> QCSemanticCoreV97',total:cases.length,passed,failed:cases.length-passed,results};
fs.writeFileSync('V8_3_217_BATCH_A_RESULT_V1.json',JSON.stringify(out,null,2));
console.log('V8.3.217 Batch A',passed+'/'+cases.length);if(passed!==cases.length)process.exit(1);
'''
runner.write_text(prefix+tail)
cp=subprocess.run(['node',str(runner.relative_to(WORK))],cwd=WORK,text=True)
src=WORK/'V8_3_217_BATCH_A_RESULT_V1.json'
if src.exists():shutil.copy2(src,RESULT)
a=json.loads(RESULT.read_text()) if RESULT.exists() else None
status={'candidate':'V8.3.217','phase':'sealed-batch-a-first-run','run_id':os.environ.get('GITHUB_RUN_ID'),'run_attempt':os.environ.get('GITHUB_RUN_ATTEMPT'),'validated_development_head_sha':TARGET,'semantic_authority':'QCEvidenceExtractorV5X -> QCSemanticCoreV97','batch_a_executed':a is not None,'batch_a_passed':a.get('passed') if a else None,'batch_a_failed':a.get('failed') if a else None,'batch_b_executed':False,'frozen_on_batch_a_failure':bool(a and a.get('failed',0)>0),'v216_sealed_rerun':False,'step_111_authorized':False,'production_authorized':False,'conclusion':'success' if a and a.get('passed')==30 and a.get('failed')==0 else 'failure'}
(SEALED/'V8_3_217_BATCH_A_STATUS_V1.json').write_text(json.dumps(status,indent=2)+'\n')

st=REPO/'V8_3_217_BATCH_A_CHECKPOINT';shutil.rmtree(st,ignore_errors=True);st.mkdir()
for p in [RESULT,SEALED/'V8_3_217_BATCH_A_STATUS_V1.json',ATTEMPT,FIRST,SEALED/'V8_3_217_SEALED_AUTHORITY_V1.json',SEALED/'V8_3_217_PRESEAL_DIVERSITY_AUDIT_V1.json',SEALED/'V8_3_217_SEALED_SELECTION_V1.json',SEALED/'V8_3_217_SEALED_FIXTURE_V1.json',SEALED/'V8_3_217_INDEPENDENT_GOLD_V1.json',SEALED/'V8_3_217_SEALED_MEMBERSHIP_V1.json',SEALED/'V8_3_217_TRANSPORT_VERIFICATION_V1.json',SEALED/'V8_3_217_STATIC_SEALED_PREFLIGHT_V1.json']:
 if p.exists():shutil.copy2(p,st/p.name)
(st/'SHA256_MANIFEST.txt').write_text(''.join(f'{fsha(p)}  {p.name}\n' for p in sorted(st.iterdir()) if p.is_file()))
z=REPO/'PSC_V8_3_217_V1_BATCH_A_CHECKPOINT.zip'
if z.exists():z.unlink()
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as q:
 for p in sorted(st.iterdir()):q.write(p,p.name)
(REPO/'PSC_V8_3_217_V1_BATCH_A_CHECKPOINT_SHA256.txt').write_text(f'{fsha(z)}  {z.name}\n')
print(json.dumps(status))
raise SystemExit(0 if status['conclusion']=='success' else 1)
