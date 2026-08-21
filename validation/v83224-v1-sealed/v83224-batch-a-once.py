import json,hashlib,pathlib,subprocess,shutil,os,zipfile,ast
R=pathlib.Path('.');TARGET='93340ec0488207f31a48c82e7b916ff709f700ab';SEM='QCEvidenceExtractorV5AB -> QCSemanticCoreV101';O=R/'validation/v83224-v1-sealed';WORK=pathlib.Path('/tmp/v83224-batch-a')
ATT=O/'V8_3_224_BATCH_A_ATTEMPT_MARKER.json';FIRST=O/'V8_3_224_SEALED_FIRST_RUN_MARKER.json';RES=O/'V8_3_224_BATCH_A_RESULT_V1.json';STAT=O/'V8_3_224_BATCH_A_STATUS_V1.json'
def canon(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def hs(x):return hashlib.sha256(canon(x)).hexdigest()
def fsha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def sh(*a,cwd=None):return subprocess.run(list(a),cwd=cwd,text=True,check=True)
def status(**kw):
 d={'candidate':'V8.3.224','phase':'sealed-batch-a-first-run','run_id':os.environ.get('GITHUB_RUN_ID'),'run_attempt':os.environ.get('GITHUB_RUN_ATTEMPT'),'validated_development_head_sha':TARGET,'semantic_authority':SEM,'batch_b_executed':False,'v219_sealed_rerun':False,'v220_sealed_rerun':False,'v221_sealed_rerun':False,'v222_sealed_rerun':False,'v223_sealed_rerun':False,'v224_batch_a_rerun':False,'step_111_authorized':False,'production_authorized':False};d.update(kw);STAT.write_text(json.dumps(d,indent=2)+'\n');return d
def checkpoint():
 z=R/'PSC_V8_3_224_V1_BATCH_A_CHECKPOINT.zip'
 with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as q:
  for p in sorted(O.glob('V8_3_224_*.json')):q.write(p,p.name)
 (R/'PSC_V8_3_224_V1_BATCH_A_CHECKPOINT_SHA256.txt').write_text(fsha(z)+'  '+z.name+'\n')
try:
 assert ATT.exists() and FIRST.exists() and not RES.exists()
 att=json.loads(ATT.read_text());assert att['validated_development_head_sha']==TARGET and att['batch']=='A'
 A=json.loads((O/'V8_3_224_SEALED_AUTHORITY_V1.json').read_text());pf=json.loads((O/'V8_3_224_STATIC_SEALED_PREFLIGHT_V1.json').read_text());tr=json.loads((O/'V8_3_224_TRANSPORT_VERIFICATION_V1.json').read_text());assert A['preseal_pass'] is True and pf['pass'] is True and tr['pass'] is True
 names={'candidate_bank':'V8_3_224_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_224_SEALED_SELECTION_V1.json','fixture':'V8_3_224_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_224_INDEPENDENT_GOLD_V1.json','membership':'V8_3_224_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_224_PRESEAL_DIVERSITY_AUDIT_V1.json'}
 for k,n in names.items():assert hs(json.loads((O/n).read_text()))==A['hashes'][k]
 sh('git','fetch','--depth=1','origin',TARGET)
 if WORK.exists():shutil.rmtree(WORK)
 sh('git','worktree','add','--detach',str(WORK),TARGET);assert subprocess.check_output(['git','-C',str(WORK),'rev-parse','HEAD'],text=True).strip()==TARGET
 archive=WORK/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip';assert archive.exists()
 with zipfile.ZipFile(archive) as z:z.extractall(WORK)
 VAL=WORK/'validation';runtime=VAL/'v83224-v1-sealed-runtime';runtime.mkdir(exist_ok=True)
 for n in ['V8_3_224_SEALED_SELECTION_V1.json','V8_3_224_SEALED_FIXTURE_V1.json','V8_3_224_INDEPENDENT_GOLD_V1.json']:shutil.copy2(O/n,runtime/n)
 tree=ast.parse((VAL/'v83220-v98-regression-orchestrator.py').read_text());ext=None
 for node in ast.walk(tree):
  if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='ext' for t in node.targets):ext=ast.literal_eval(node.value);break
 ext += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js']
 base=(VAL/'run-v83196-full-regression-sweep-v2.cjs').read_text();needle="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];";base=base.replace(needle,"'psc-v83196-v195-v1-hypothetical-preservation-repair.js',"+','.join(repr(x) for x in ext)+'];',1);prefix=base.split("const files=fs.readdirSync('validation')")[0]
 runner=runtime/'run-v83224-a.cjs';tail=r'''
if(!s.QCSemanticCoreV101)throw Error('V101 missing');const root='validation/v83224-v1-sealed-runtime';const F=JSON.parse(fs.readFileSync(root+'/V8_3_224_SEALED_FIXTURE_V1.json'));const S=JSON.parse(fs.readFileSync(root+'/V8_3_224_SEALED_SELECTION_V1.json'));const G=JSON.parse(fs.readFileSync(root+'/V8_3_224_INDEPENDENT_GOLD_V1.json'));const gm=new Map(G.cases.map(x=>[x.case_id,x.expected]));const ids=new Set(S.batch_a);const cases=F.cases.filter(x=>ids.has(x.case_id));if(cases.length!==30)throw Error('A cardinality '+cases.length);let passed=0;const results=[];for(const c of cases){const r=s.QCSemanticCoreV101.analyze(c.surface,c.domain);const a={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};const e0=gm.get(c.case_id);const e={route:e0.route,families:[...(e0.families||[])].sort(),sequence:!!e0.sequence};const ok=JSON.stringify(a)===JSON.stringify(e);if(ok)passed++;results.push({case_id:c.case_id,category:c.category,language:c.language,domain:c.domain,pass:ok,expected:e,actual:a,surface:c.surface});}const out={authority:'V8.3.224 V1 SEALED BATCH A FIRST RUN',run_id:process.env.GITHUB_RUN_ID,run_attempt:process.env.GITHUB_RUN_ATTEMPT,validated_development_head_sha:'93340ec0488207f31a48c82e7b916ff709f700ab',semantic_authority:'QCEvidenceExtractorV5AB -> QCSemanticCoreV101',total:30,passed,failed:30-passed,results};fs.writeFileSync('V8_3_224_BATCH_A_RESULT_V1.json',JSON.stringify(out,null,2));console.log('V224 A',passed+'/30');if(passed!==30)process.exit(1);
''';runner.write_text(prefix+tail);cp=subprocess.run(['node',str(runner.relative_to(WORK))],cwd=WORK,text=True);src=WORK/'V8_3_224_BATCH_A_RESULT_V1.json'
 if src.exists():shutil.copy2(src,RES)
 if RES.exists():
  a=json.loads(RES.read_text());st=status(batch_a_attempt_consumed=True,batch_a_executed=True,batch_a_passed=a['passed'],batch_a_failed=a['failed'],semantic_runtime_executed=True,semantic_failure=bool(a['failed']),frozen_on_batch_a_failure=bool(a['failed']),conclusion='success' if a['passed']==30 else 'failure')
 else:st=status(batch_a_attempt_consumed=True,batch_a_executed=False,semantic_runtime_executed=False,semantic_failure=False,failure_layer='VALIDATION RUNNER / INFRASTRUCTURE',exact_error='runner produced no result',frozen_on_batch_a_failure=True,conclusion='failure')
except Exception as e:st=status(batch_a_attempt_consumed=True,batch_a_executed=False,semantic_runtime_executed=False,semantic_failure=False,failure_layer='VALIDATION RUNNER / INFRASTRUCTURE',exact_error=f'{type(e).__name__}: {e}',frozen_on_batch_a_failure=True,conclusion='failure')
finally:checkpoint()
print(json.dumps(st));raise SystemExit(0 if st['conclusion']=='success' else 1)
