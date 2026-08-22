from pathlib import Path
import json,zipfile,ast,subprocess
archive=Path('PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip');assert archive.exists()
with zipfile.ZipFile(archive) as z:z.extractall('.')
base=Path('validation/run-v83196-full-regression-sweep-v2.cjs').read_text();needle="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];";assert needle in base
tree=ast.parse(Path('validation/v83220-v98-regression-orchestrator.py').read_text());ext=None
for node in ast.walk(tree):
 if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='ext' for t in node.targets):ext=ast.literal_eval(node.value);break
assert ext
ext += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js','qc-evidence-extractor-v5ac-v225-residual-composition.js','psc-v83225-v224-v102-residual-composition.js','qc-evidence-extractor-v5ad-v226-full-input-witness.js','psc-v83226-v225-v103-full-input-witness.js','qc-evidence-extractor-v5ae-v227-residual-witness.js','psc-v83227-v226-v104-residual-witness.js','qc-evidence-extractor-v5af-v228-witness-completion.js','psc-v83228-v227-v105-witness-completion.js','qc-evidence-extractor-v5ag-v230-concept-generalization.js','psc-v83230-v229-v106-concept-generalization.js']
base=base.replace(needle,"'psc-v83196-v195-v1-hypothetical-preservation-repair.js',"+','.join(repr(x) for x in ext)+'];',1);marker="const files=fs.readdirSync('validation')";prefix=base.split(marker)[0]
runner=Path('validation/run-v83230-v229-residual-diagnostic.cjs');tail=r'''
if(!s.QCSemanticCoreV106)throw Error('V106 missing');const C=JSON.parse(fs.readFileSync('validation/V8_3_230_V229_A_FROZEN_CARRIER.json')).cases;const results=[];let passed=0;for(const c of C){const r=s.QCSemanticCoreV106.analyze(c.surface,c.domain);const actual={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};const expected={route:c.expected.route,families:[...(c.expected.families||[])].sort(),sequence:!!c.expected.sequence};const ok=JSON.stringify(actual)===JSON.stringify(expected);if(ok)passed++;results.push({case_id:c.case_id,category:c.category,language:c.language,source_first_run_pass:c.source_first_run_pass,pass:ok,expected,actual,surface:c.surface});}fs.writeFileSync('validation/V8_3_230_V229_A_V106_DIAGNOSTIC_RESULTS.json',JSON.stringify({total:30,passed,failed:30-passed,results},null,2));console.log(passed+'/30');
''';runner.write_text(prefix+tail);cp=subprocess.run(['node',str(runner)],text=True);assert cp.returncode==0
r=json.loads(Path('validation/V8_3_230_V229_A_V106_DIAGNOSTIC_RESULTS.json').read_text());fails=[x for x in r['results'] if not x['pass']];assert len(fails)==2
Path('validation/V8_3_230_V106_RESIDUAL_FAILURES.json').write_text(json.dumps({'candidate':'V8.3.230','semantic_authority':'QCEvidenceExtractorV5AG -> QCSemanticCoreV106','v229_total':30,'v229_passed':28,'v229_failed':2,'failures':fails,'sealed_validation_executed':False,'v229_sealed_rerun':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps(fails,ensure_ascii=False))
