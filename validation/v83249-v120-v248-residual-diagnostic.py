import ast,json,pathlib,subprocess,zipfile
R=pathlib.Path('.');V=R/'validation'
carrier=json.loads((V/'V8_3_248_A_FROZEN_CARRIER.json').read_text())
archive=R/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip'
assert archive.exists()
with zipfile.ZipFile(archive) as z:z.extractall(R)
assert (R/'PSC_V8_3_138_DEV/public/psc-v3.js').exists()
tree=ast.parse((V/'v83220-v98-regression-orchestrator.py').read_text());EXT=None
for node in ast.walk(tree):
    if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='ext' for t in node.targets):
        EXT=ast.literal_eval(node.value);break
assert EXT and EXT[-2:]==['qc-evidence-extractor-v5y-v220-bounded-recall.js','psc-v83220-v219-v98-bounded-recall.js']
EXT += ['qc-evidence-extractor-v5z-v222-compositional-generalization.js','psc-v83222-v221-v99-compositional-generalization.js','qc-evidence-extractor-v5aa-v223-precedence-generalization.js','psc-v83223-v222-v100-precedence-generalization.js','qc-evidence-extractor-v5ab-v224-compositional-recall.js','psc-v83224-v223-v101-compositional-recall.js','qc-evidence-extractor-v5ac-v225-residual-composition.js','psc-v83225-v224-v102-residual-composition.js','qc-evidence-extractor-v5ad-v226-full-input-witness.js','psc-v83226-v225-v103-full-input-witness.js','qc-evidence-extractor-v5ae-v227-residual-witness.js','psc-v83227-v226-v104-residual-witness.js','qc-evidence-extractor-v5af-v228-witness-completion.js','psc-v83228-v227-v105-witness-completion.js','qc-evidence-extractor-v5ag-v230-concept-generalization.js','psc-v83230-v229-v106-concept-generalization.js','qc-evidence-extractor-v5ah-v231-isolated-concepts.js','psc-v83231-v230-v107-isolated-concepts.js','qc-evidence-extractor-v5ai-v232-residual-isolated-generalization.js','psc-v83232-v231-v108-residual-isolated-generalization.js','qc-evidence-extractor-v5aj-v234-residual-generalization.js','psc-v83234-v233-v109-residual-generalization.js','qc-evidence-extractor-v5ak-v235-final-residuals.js','psc-v83235-v234-v110-final-residuals.js','qc-evidence-extractor-v5al-v236-contextual-mechanisms.js','psc-v83236-v235-v111-contextual-mechanisms.js','qc-evidence-extractor-v5am-v237-final-compositional.js','psc-v83237-v236-v112-final-compositional.js','qc-evidence-extractor-v5an-v238-frozen-residuals.js','psc-v83238-v237-v113-frozen-residuals.js','qc-evidence-extractor-v5ao-v239-v238-residuals.js','psc-v83239-v238-v114-v238-residuals.js','qc-evidence-extractor-v5ap-v241-v240-residuals.js','psc-v83241-v240-v115-residuals.js','qc-evidence-extractor-v5aq-v242-v241-residuals.js','psc-v83242-v241-v116-residuals.js','qc-evidence-extractor-v5ar-v243-v242-residuals.js','psc-v83243-v242-v117-residuals.js','qc-evidence-extractor-v5as-v245-v244-residuals.js','psc-v83245-v244-v118-residuals.js','qc-evidence-extractor-v5at-v246-v245-residuals.js','psc-v83246-v245-v119-residuals.js','qc-evidence-extractor-v5au-v249-v248-residuals.js','psc-v83249-v248-v120-residuals.js']
base=(V/'run-v83196-full-regression-sweep-v2.cjs').read_text();needle="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];";assert needle in base
base=base.replace(needle,"'psc-v83196-v195-v1-hypothetical-preservation-repair.js',"+','.join(repr(x) for x in EXT)+'];',1)
prefix=base.split("const files=fs.readdirSync('validation')")[0]
tail=r'''
if(!s.QCEvidenceExtractorV5AU)throw Error('V5AU missing');if(!s.QCSemanticCoreV120)throw Error('V120 missing');
const F=JSON.parse(fs.readFileSync('validation/V8_3_248_A_FROZEN_CARRIER.json'));let passed=0;const results=[];for(const c of F.results){const r=s.QCSemanticCoreV120.analyze(c.surface,c.domain);const actual={route:r.input_route.id,families:[...(r.families||[])].sort(),sequence:!!r.sequence};const e=c.expected;const expected={route:e.route,families:[...(e.families||[])].sort(),sequence:!!e.sequence};const ok=JSON.stringify(actual)===JSON.stringify(expected);if(ok)passed++;results.push({...c,pass:ok,actual});}fs.writeFileSync('validation/V8_3_249_V248_RESIDUAL_DIAGNOSTIC_RESULTS.json',JSON.stringify({total:results.length,passed,failed:results.length-passed,results},null,2));console.log('V248 diagnostic',passed+'/'+results.length);for(const x of results.filter(x=>!x.pass))console.log(JSON.stringify(x));
'''
runner=V/'run-v83249-v248-residual-diagnostic.cjs';runner.write_text(prefix+tail)
subprocess.run(['node',str(runner)],check=True)
