import json,hashlib,pathlib,subprocess,shutil,os,zipfile,ast
REPO=pathlib.Path.cwd();TARGET='89db04ec936af998c14d2f0451ef87270ea8e349';SEM='QCEvidenceExtractorV5AY -> QCSemanticCoreV124';SEALED=REPO/'validation/v83253-v1-sealed';WORK=pathlib.Path('/tmp/v83253-batch-b-authority');ROOT='validation/v83253-v1-sealed-runtime'
ATTEMPT=SEALED/'V8_3_253_BATCH_B_ATTEMPT_MARKER.json';FIRST=SEALED/'V8_3_253_SEALED_FIRST_RUN_MARKER.json';RESULT=SEALED/'V8_3_253_BATCH_B_RESULT_V1.json';STATUS=SEALED/'V8_3_253_BATCH_B_STATUS_V1.json'
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def sha_obj(o):return hashlib.sha256(canon(o)).hexdigest()
def fsha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def sh(*a,cwd=None):return subprocess.run(list(a),cwd=cwd,text=True,check=True)
def status(**kw):
 d={'candidate':'V8.3.253','phase':'sealed-batch-b-first-run','run_id':os.environ.get('GITHUB_RUN_ID'),'run_attempt':os.environ.get('GITHUB_RUN_ATTEMPT'),'validated_development_head_sha':TARGET,'semantic_authority':SEM,'batch_a_executed':True,'v251_sealed_rerun':False,'v253_batch_b_rerun':False,'step_111_authorized':False,'production_authorized':False};d.update(kw);STATUS.write_text(json.dumps(d,indent=2)+'\n');return d
def checkpoint():
 z=REPO/'PSC_V8_3_253_V1_BATCH_B_CHECKPOINT.zip'
 if z.exists():z.unlink()
 with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as q:
  for n in ['V8_3_253_BATCH_B_RESULT_V1.json','V8_3_253_BATCH_B_STATUS_V1.json','V8_3_253_BATCH_B_ATTEMPT_MARKER.json','V8_3_253_SEALED_FIRST_RUN_MARKER.json','V8_3_253_SEALED_AUTHORITY_V1.json','V8_3_253_PRESEAL_DIVERSITY_AUDIT_V1.json','V8_3_253_SEALED_SELECTION_V1.json','V8_3_253_SEALED_FIXTURE_V1.json','V8_3_253_INDEPENDENT_GOLD_V1.json','V8_3_253_SEALED_MEMBERSHIP_V1.json','V8_3_253_TRANSPORT_VERIFICATION_V1.json','V8_3_253_STATIC_SEALED_PREFLIGHT_V1.json']:
   p=SEALED/n
   if p.exists():q.write(p,p.name)
 (REPO/'PSC_V8_3_253_V1_BATCH_B_CHECKPOINT_SHA256.txt').write_text(fsha(z)+'  '+z.name+'\n')
st=None
try:
 assert ATTEMPT.exists() and FIRST.exists() and not RESULT.exists()
 att=json.loads(ATTEMPT.read_text());first=json.loads(FIRST.read_text());assert att['validated_development_head_sha']==TARGET and att['batch']=='B' and first['validated_development_head_sha']==TARGET
 a_status=json.loads((SEALED/'V8_3_253_BATCH_A_STATUS_V1.json').read_text());a_result=json.loads((SEALED/'V8_3_253_BATCH_A_RESULT_V1.json').read_text());assert a_status['conclusion']=='success' and a_status['batch_a_passed']==30 and a_status['batch_a_failed']==0 and a_result['passed']==30 and a_result['failed']==0
 A=json.loads((SEALED/'V8_3_253_SEALED_AUTHORITY_V1.json').read_text());pf=json.loads((SEALED/'V8_3_253_STATIC_SEALED_PREFLIGHT_V1.json').read_text());tr=json.loads((SEALED/'V8_3_253_TRANSPORT_VERIFICATION_V1.json').read_text())
 assert A['validated_development_head_sha']==TARGET and A['semantic_authority']==SEM and A['preseal_pass'] is True and pf['pass'] is True and tr['pass'] is True
 assert pf['exact_v5ay_path']=='validation/qc-evidence-extractor-v5ay-v253-v252-residual.js' and pf['exact_v124_path']=='validation/psc-v83253-v252-v124-residual.js'
 files={'candidate_bank':'V8_3_253_PRESEAL_CANDIDATE_BANK_V1.json','selection':'V8_3_253_SEALED_SELECTION_V1.json','fixture':'V8_3_253_SEALED_FIXTURE_V1.json','independent_gold':'V8_3_253_INDEPENDENT_GOLD_V1.json','membership':'V8_3_253_SEALED_MEMBERSHIP_V1.json','preseal_audit':'V8_3_253_PRESEAL_DIVERSITY_AUDIT_V1.json'}
 for k,n in files.items():assert sha_obj(json.loads((SEALED/n).read_text()))==A['hashes'][k],k
 sel=json.loads((SEALED/files['selection']).read_text());assert len(sel['batch_a'])==30 and len(sel['batch_b'])==30 and set(sel['batch_a']).isdisjoint(sel['batch_b'])
 sh('git','fetch','--depth=1','origin',TARGET)
 if WORK.exists():shutil.rmtree(WORK)
 sh('git','worktree','add','--detach',str(WORK),TARGET);assert subprocess.check_output(['git','-C',str(WORK),'rev-parse','HEAD'],text=True).strip()==TARGET
 archive=WORK/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip';assert archive.exists()
 with zipfile.ZipFile(archive) as z:z.extractall(WORK)
 assert (WORK/'PSC_V8_3_138_DEV/public/psc-v3.js').exists()
 VAL=WORK/'validation';runtime=WORK/ROOT;runtime.mkdir(parents=True,exist_ok=True)
 for fn in ['V8_3_253_SEALED_SELECTION_V1.json','V8_3_253_SEALED_FIXTURE_V1.json','V8_3_253_INDEPENDENT_GOLD_V1.json']:shutil.copy2(SEALED/fn,runtime/fn)
 tree=ast.parse((VAL/'v83220-v98-regression-orchestrator.py').read_text());EXT=None
 for node in ast.walk(tree):
  if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='ext' for t in node.targets):EXT=ast.literal_eval(node.value);break
 assert EXT and EXT[-2:]==['qc-evidence-extractor-v5y-v220-bounded-recall.js','psc-v83220-v219-v98-bounded-recall.js']
 EXT += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js','qc-evidence-extractor-v5ac-v225-residual-composition.js','psc-v83225-v224-v102-residual-composition.js','qc-evidence-extractor-v5ad-v226-full-input-witness.js','psc-v83226-v225-v103-full-input-witness.js','qc-evidence-extractor-v5ae-v227-residual-witness.js','psc-v83227-v226-v104-residual-witness.js','qc-evidence-extractor-v5af-v228-witness-completion.js','psc-v83228-v227-v105-witness-completion.js','qc-evidence-extractor-v5ag-v230-concept-generalization.js','psc-v83230-v229-v106-concept-generalization.js','qc-evidence-extractor-v5ah-v231-isolated-concepts.js','psc-v83231-v230-v107-isolated-concepts.js','qc-evidence-extractor-v5ai-v232-residual-isolated-generalization.js','psc-v83232-v231-v108-residual-isolated-generalization.js','qc-evidence-extractor-v5aj-v234-residual-generalization.js','psc-v83234-v233-v109-residual-generalization.js','qc-evidence-extractor-v5ak-v235-final-residuals.js','psc-v83235-v234-v110-final-residuals.js','qc-evidence-extractor-v5al-v236-contextual-mechanisms.js','psc-v83236-v235-v111-contextual-mechanisms.js','qc-evidence-extractor-v5am-v237-final-compositional.js','psc-v83237-v236-v112-final-compositional.js','qc-evidence-extractor-v5an-v238-frozen-residuals.js','psc-v83238-v237-v113-frozen-residuals.js','qc-evidence-extractor-v5ao-v239-v238-residuals.js','psc-v83239-v238-v114-v238-residuals.js','qc-evidence-extractor-v5ap-v241-v240-residuals.js','psc-v83241-v240-v115-residuals.js','qc-evidence-extractor-v5aq-v242-v241-residuals.js','psc-v83242-v241-v116-residuals.js','qc-evidence-extractor-v5ar-v243-v242-residuals.js','psc-v83243-v242-v117-residuals.js','qc-evidence-extractor-v5as-v245-v244-residuals.js','psc-v83245-v244-v118-residuals.js','qc-evidence-extractor-v5at-v246-v245-residuals.js','psc-v83246-v245-v119-residuals.js','qc-evidence-extractor-v5au-v249-v248-residuals.js','psc-v83249-v248-v120-residuals.js','qc-evidence-extractor-v5av-v250-v249-residuals.js','psc-v83250-v249-v121-residuals.js','qc-evidence-extractor-v5aw-v251-v250-b-residuals.js','psc-v83251-v250-v122-b-residuals.js','qc-evidence-extractor-v5ax-v252-v251-residuals.js','psc-v83252-v251-v123-residuals.js','qc-evidence-extractor-v5ay-v253-v252-residual.js','psc-v83253-v252-v124-residual.js']
 base=(VAL/'run-v83196-full-regression-sweep-v2.cjs').read_text();needle="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];";assert needle in base;base=base.replace(needle,"'psc-v83196-v195-v1-hypothetical-preservation-repair.js',"+','.join(repr(x) for x in EXT)+'];',1);prefix=base.split("const files=fs.readdirSync('validation')")[0]
 runner=runtime/'run-v83253-batch-b.cjs';tail=r'''
if(!s.QCEvidenceExtractorV5AY)throw Error('V5AY missing');if(!s.QCSemanticCoreV124)throw Error('V124 missing');
const root='validation/v83253-v1-sealed-runtime';const F=JSON.parse(fs.readFileSync(root+'/V8_3_253_SEALED_FIXTURE_V1.json'));const S=JSON.parse(fs.readFileSync(root+'/V8_3_253_SEALED_SELECTION_V1.json'));const G=JSON.parse(fs.readFileSync(root+'/V8_3_253_INDEPENDENT_GOLD_V1.json'));const gm=new Map(G.cases.map(x=>[x.case_id,x.expected]));const ids=new Set(S.batch_b);const cases=F.cases.filter(x=>ids.has(x.case_id));if(cases.length!==30)throw Error('B cardinality '+cases.length);let passed=0;const results=[];for(const c of cases){const r=s.QCSemanticCoreV124.analyze(c.surface,c.domain);const actual={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};const g=gm.get(c.case_id);if(!g)throw Error('missing gold '+c.case_id);const expected={route:g.route,families:[...(g.families||[])].sort(),sequence:!!g.sequence};const ok=JSON.stringify(actual)===JSON.stringify(expected);if(ok)passed++;results.push({case_id:c.case_id,category:c.category,language:c.language,domain:c.domain,pass:ok,expected,actual,surface:c.surface});}const out={authority:'V8.3.253 V1 SEALED BATCH B FIRST RUN',run_id:process.env.GITHUB_RUN_ID,run_attempt:process.env.GITHUB_RUN_ATTEMPT,validated_development_head_sha:'89db04ec936af998c14d2f0451ef87270ea8e349',semantic_authority:'QCEvidenceExtractorV5AY -> QCSemanticCoreV124',total:30,passed,failed:30-passed,results};fs.writeFileSync('V8_3_253_BATCH_B_RESULT_V1.json',JSON.stringify(out,null,2));console.log('V253 B',passed+'/30');if(passed!==30)process.exit(1);
'''
 runner.write_text(prefix+tail)
 cp=subprocess.run(['node',str(runner.relative_to(WORK))],cwd=WORK,text=True);src=WORK/'V8_3_253_BATCH_B_RESULT_V1.json'
 if src.exists():shutil.copy2(src,RESULT)
 if RESULT.exists():
  a=json.loads(RESULT.read_text());st=status(batch_b_attempt_consumed=True,batch_b_executed=True,batch_b_passed=a['passed'],batch_b_failed=a['failed'],semantic_runtime_executed=True,semantic_failure=bool(a['failed']),frozen_on_batch_a_failure=bool(a['failed']),conclusion='success' if a['passed']==30 else 'failure')
 else:st=status(batch_b_attempt_consumed=True,batch_b_executed=False,semantic_runtime_executed=False,semantic_failure=False,failure_layer='VALIDATION RUNNER / INFRASTRUCTURE',exact_error='runner produced no result',frozen_on_batch_a_failure=True,conclusion='failure')
except Exception as e:st=status(batch_b_attempt_consumed=True,batch_b_executed=False,semantic_runtime_executed=False,semantic_failure=False,failure_layer='VALIDATION RUNNER / INFRASTRUCTURE',exact_error=f'{type(e).__name__}: {e}',frozen_on_batch_a_failure=True,conclusion='failure')
finally:checkpoint()
print(json.dumps(st));raise SystemExit(0 if st['conclusion']=='success' else 1)
