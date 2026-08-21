import json,hashlib,pathlib,subprocess,shutil,os,zipfile,ast
REPO=pathlib.Path.cwd();TARGET='96955e1cf7538912104700e8dd6307ac4e67cb73';SEM='QCEvidenceExtractorV5AC -> QCSemanticCoreV102';SEALED=REPO/'validation/v83225-v1-sealed';WORK=pathlib.Path('/tmp/v83225-batch-a-authority')
ATTEMPT=SEALED/'V8_3_225_BATCH_A_ATTEMPT_MARKER.json';FIRST=SEALED/'V8_3_225_SEALED_FIRST_RUN_MARKER.json';RESULT=SEALED/'V8_3_225_BATCH_A_RESULT_V1.json';STATUS=SEALED/'V8_3_225_BATCH_A_STATUS_V1.json'
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def sha_obj(o):return hashlib.sha256(canon(o)).hexdigest()
def fsha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def sh(*a,cwd=None):return subprocess.run(list(a),cwd=cwd,text=True,check=True)
def status(**kw):
 d={'candidate':'V8.3.225','phase':'sealed-batch-a-first-run','run_id':os.environ.get('GITHUB_RUN_ID'),'run_attempt':os.environ.get('GITHUB_RUN_ATTEMPT'),'validated_development_head_sha':TARGET,'semantic_authority':SEM,'batch_b_executed':False,'v219_sealed_rerun':False,'v220_sealed_rerun':False,'v221_sealed_rerun':False,'v222_sealed_rerun':False,'v223_sealed_rerun':False,'v224_sealed_rerun':False,'v225_batch_a_rerun':False,'step_111_authorized':False,'production_authorized':False};d.update(kw);STATUS.write_text(json.dumps(d,indent=2)+'\n');return d
def checkpoint():
 z=REPO/'PSC_V8_3_225_V1_BATCH_A_CHECKPOINT.zip'
 if z.exists():z.unlink()
 with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as q:
  for n in ['V8_3_225_BATCH_A_RESULT_V1.json','V8_3_225_BATCH_A_STATUS_V1.json','V8_3_225_BATCH_A_ATTEMPT_MARKER.json','V8_3_225_SEALED_FIRST_RUN_MARKER.json','V8_3_225_SEALED_AUTHORITY_V1.json','V8_3_225_PRESEAL_DIVERSITY_AUDIT_V1.json','V8_3_225_SEALED_SELECTION_V1.json','V8_3_225_SEALED_FIXTURE_V1.json','V8_3_225_INDEPENDENT_GOLD_V1.json','V8_3_225_SEALED_MEMBERSHIP_V1.json','V8_3_225_TRANSPORT_VERIFICATION_V1.json','V8_3_225_STATIC_SEALED_PREFLIGHT_V1.json']:
   p=SEALED/n
   if p.exists():q.write(p,p.name)
 (REPO/'PSC_V8_3_225_V1_BATCH_A_CHECKPOINT_SHA256.txt').write_text(fsha(z)+'  '+z.name+'\n')
st=None
try:
 assert ATTEMPT.exists() and FIRST.exists() and not RESULT.exists()
 att=json.loads(ATTEMPT.read_text());first=json.loads(FIRST.read_text());assert att['validated_development_head_sha']==TARGET and att['batch']=='A' and first['validated_development_head_sha']==TARGET
 A=json.loads((SEALED/'V8_3_225_SEALED_AUTHORITY_V1.json').read_text());pf=json.loads((SEALED/'V8_3_225_STATIC_SEALED_PREFLIGHT_V1.json').read_text());tr=json.loads((SEALED/'V8_3_225_TRANSPORT_VERIFICATION_V1.json').read_text());assert A['validated_development_head_sha']==TARGET and A['semantic_authority']==SEM and A['preseal_pass'] is True and pf['pass'] is True and tr['pass'] is True
 files={'candidate_bank':'V8_3_225_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_225_SEALED_SELECTION_V1.json','fixture':'V8_3_225_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_225_INDEPENDENT_GOLD_V1.json','membership':'V8_3_225_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_225_PRESEAL_DIVERSITY_AUDIT_V1.json'}
 for k,n in files.items():assert sha_obj(json.loads((SEALED/n).read_text()))==A['hashes'][k],k
 sel=json.loads((SEALED/files['selection']).read_text());assert len(sel['batch_a'])==30 and len(sel['batch_b'])==30 and set(sel['batch_a']).isdisjoint(sel['batch_b'])
 sh('git','fetch','--depth=1','origin',TARGET)
 if WORK.exists():shutil.rmtree(WORK)
 sh('git','worktree','add','--detach',str(WORK),TARGET);assert subprocess.check_output(['git','-C',str(WORK),'rev-parse','HEAD'],text=True).strip()==TARGET
 archive=WORK/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip';assert archive.exists()
 with zipfile.ZipFile(archive) as z:z.extractall(WORK)
 assert (WORK/'PSC_V8_3_138_DEV/public/psc-v3.js').exists()
 VAL=WORK/'validation';runtime=VAL/'v83225-v1-sealed-runtime';runtime.mkdir(exist_ok=True)
 for fn in ['V8_3_225_SEALED_SELECTION_V1.json','V8_3_225_SEALED_FIXTURE_V1.json','V8_3_225_INDEPENDENT_GOLD_V1.json']:shutil.copy2(SEALED/fn,runtime/fn)
 tree=ast.parse((VAL/'v83220-v98-regression-orchestrator.py').read_text());EXT=None
 for node in ast.walk(tree):
  if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='ext' for t in node.targets):EXT=ast.literal_eval(node.value);break
 assert EXT and EXT[-2:]==['qc-evidence-extractor-v5y-v220-bounded-recall.js','psc-v83220-v219-v98-bounded-recall.js']
 EXT += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js','qc-evidence-extractor-v5ac-v225-residual-composition.js','psc-v83225-v224-v102-residual-composition.js']
 base=(VAL/'run-v83196-full-regression-sweep-v2.cjs').read_text();needle="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];";assert needle in base;base=base.replace(needle,"'psc-v83196-v195-v1-hypothetical-preservation-repair.js',"+','.join(repr(x) for x in EXT)+'];',1);marker="const files=fs.readdirSync('validation')";assert marker in base;prefix=base.split(marker)[0]
 runner=runtime/'run-v83225-batch-a.cjs';tail=r'''
if(!s.QCSemanticCoreV65R)throw Error('V65R missing');if(!s.QCEvidenceExtractorV5AC)throw Error('V5AC missing');if(!s.QCSemanticCoreV102)throw Error('V102 missing');
const root='validation/v83225-v1-sealed-runtime';const F=JSON.parse(fs.readFileSync(root+'/V8_3_225_SEALED_FIXTURE_V1.json'));const S=JSON.parse(fs.readFileSync(root+'/V8_3_225_SEALED_SELECTION_V1.json'));const G=JSON.parse(fs.readFileSync(root+'/V8_3_225_INDEPENDENT_GOLD_V1.json'));const gm=new Map(G.cases.map(x=>[x.case_id,x.expected]));const ids=new Set(S.batch_a);const cases=F.cases.filter(x=>ids.has(x.case_id));if(cases.length!==30)throw Error('A cardinality '+cases.length);let passed=0;const results=[];for(const c of cases){const r=s.QCSemanticCoreV102.analyze(c.surface,c.domain);const actual={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};const g=gm.get(c.case_id);if(!g)throw Error('missing gold '+c.case_id);const expected={route:g.route,families:[...(g.families||[])].sort(),sequence:!!g.sequence};const ok=JSON.stringify(actual)===JSON.stringify(expected);if(ok)passed++;results.push({case_id:c.case_id,category:c.category,language:c.language,domain:c.domain,pass:ok,expected,actual,surface:c.surface});}const out={authority:'V8.3.225 V1 SEALED BATCH A FIRST RUN',run_id:process.env.GITHUB_RUN_ID,run_attempt:process.env.GITHUB_RUN_ATTEMPT,validated_development_head_sha:'96955e1cf7538912104700e8dd6307ac4e67cb73',semantic_authority:'QCEvidenceExtractorV5AC -> QCSemanticCoreV102',total:30,passed,failed:30-passed,results};fs.writeFileSync('V8_3_225_BATCH_A_RESULT_V1.json',JSON.stringify(out,null,2));console.log('V225 A',passed+'/30');if(passed!==30)process.exit(1);
''';runner.write_text(prefix+tail);cp=subprocess.run(['node',str(runner.relative_to(WORK))],cwd=WORK,text=True);src=WORK/'V8_3_225_BATCH_A_RESULT_V1.json'
 if src.exists():shutil.copy2(src,RESULT)
 if RESULT.exists():
  a=json.loads(RESULT.read_text());st=status(batch_a_attempt_consumed=True,batch_a_executed=True,batch_a_passed=a['passed'],batch_a_failed=a['failed'],semantic_runtime_executed=True,semantic_failure=bool(a['failed']),frozen_on_batch_a_failure=bool(a['failed']),conclusion='success' if a['passed']==30 else 'failure')
 else:st=status(batch_a_attempt_consumed=True,batch_a_executed=False,semantic_runtime_executed=False,semantic_failure=False,failure_layer='VALIDATION RUNNER / INFRASTRUCTURE',exact_error='runner produced no result',frozen_on_batch_a_failure=True,conclusion='failure')
except Exception as e:st=status(batch_a_attempt_consumed=True,batch_a_executed=False,semantic_runtime_executed=False,semantic_failure=False,failure_layer='VALIDATION RUNNER / INFRASTRUCTURE',exact_error=f'{type(e).__name__}: {e}',frozen_on_batch_a_failure=True,conclusion='failure')
finally:checkpoint()
print(json.dumps(st));raise SystemExit(0 if st['conclusion']=='success' else 1)
