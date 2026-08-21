import json, pathlib, subprocess, shutil, zipfile, hashlib

ROOT=pathlib.Path('.')
BASE_SHA='9d946d3ddf8b98c2b3f80e1b5b849b12415381c2'
SEM_SHA='456a88d01b671f0cb92a0be31f4d34d68f60d135'
WORK=pathlib.Path('/tmp/v83219-loader-recovery')

EXT=[
'psc-v83197-v196-sealed-a-bounded-repair.js','psc-v83198-v197-sealed-a-bounded-repair.js','psc-v83199-v198-sealed-a-bounded-repair.js','psc-v83200-v199-sealed-a-bounded-repair.js','psc-v83201-v200-sealed-a-bounded-repair.js','psc-v83201-v200-v1-preservation-precedence-repair.js','psc-v83202-v201-sealed-a-bounded-repair.js','psc-v83203-v202-sealed-a-bounded-repair.js','psc-v83204-v203-sealed-a-bounded-repair.js','psc-v83205-v204-sealed-a-bounded-repair.js','psc-v83206-v205-compositional-generalization.js','psc-v83206-v205-v1-preservation-repair.js','psc-v83207-v206-mechanism-cue-repair.js','psc-v83207-v206-v1-preservation-repair.js','psc-v83208-v207-mechanism-cue-repair.js','psc-v83208-v207-v1-preservation-repair.js','psc-v83209-v208-evidence-slot-composition.js','psc-v83209-v208-v1-preservation-repair.js','qc-evidence-extractor-v1-review-candidate.js','qc-evidence-extractor-v1r-review-candidate.js','qc-evidence-extractor-v1r2-review-candidate.js','psc-v83209-semantic-rule-table-v3-review-candidate.js','psc-v83209-v208-semantic-rule-table-promotion.js','qc-evidence-extractor-v1r3-v210-concept-coverage.js','psc-v83210-v209-semantic-rule-table-v4.js','qc-evidence-extractor-v1r4-v210-relational-preservation.js','psc-v83210-v209-v1-relational-preservation.js','qc-evidence-extractor-v2-v210-relational-semantics.js','psc-v83210-v210-semantic-rule-table-v5.js','qc-evidence-extractor-v2r-v210-multilingual-aliases.js','psc-v83210-v210-semantic-rule-table-v6.js','qc-evidence-extractor-v2s-v210-context-sanitizer.js','psc-v83210-v210-semantic-rule-table-v7.js','qc-evidence-extractor-v2t-v210-contextual-recall.js','psc-v83210-v210-semantic-rule-table-v8-parent-containment.js','qc-evidence-extractor-v3-v211-context-scoped.js','psc-v83211-v210-context-scoped-rule-table.js','qc-evidence-extractor-v3r-v211-preservation.js','psc-v83211-v210-preservation-containment.js','qc-evidence-extractor-v4-v211-relational-recall.js','psc-v83211-v210-v89-relational-recall.js','qc-evidence-extractor-v5-v212-scope-propagation.js','psc-v83212-v211-v90-scope-propagation.js','qc-evidence-extractor-v5r-v212-delegated-decision-preservation.js','psc-v83212-v211-v91-delegated-decision-preservation.js','qc-evidence-extractor-v5s-v212-relational-recall.js','psc-v83212-v211-v92-relational-recall.js','qc-evidence-extractor-v5t-v213-relational-paraphrase-recall.js','psc-v83213-v212-v93-relational-paraphrase-recall.js','qc-evidence-extractor-v5u-v214-sealed-recall.js','psc-v83214-v213-v94-sealed-recall.js','qc-evidence-extractor-v5u2-v214-clarification-containment.js','psc-v83214-v213-v94r-clarification-containment.js','qc-evidence-extractor-v5v-v215-compositional-recall.js','psc-v83215-v214-v95-compositional-recall.js','qc-evidence-extractor-v5w-v216-sealed-recall.js','psc-v83216-v215-v96-sealed-recall.js','qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js']

def sh(*a,cwd=None): return subprocess.run(list(a),cwd=cwd,text=True,check=True,capture_output=True)
def sha(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()

# Pin the exact V8.3.219 DEVELOPMENT base, which itself is derived from exact V8.3.218 DEVELOPMENT authority.
sh('git','fetch','--depth=1','origin',BASE_SHA)
if WORK.exists(): shutil.rmtree(WORK)
sh('git','worktree','add','--detach',str(WORK),BASE_SHA)
assert subprocess.check_output(['git','-C',str(WORK),'rev-parse','HEAD'],text=True).strip()==BASE_SHA

# Semantic source identity must remain byte-identical to the exact semantic base SHA.
for fn in ['validation/qc-evidence-extractor-v5x-v217-relational-recall.js','validation/psc-v83217-v216-v97-relational-recall.js']:
    current=(WORK/fn).read_bytes()
    original=subprocess.check_output(['git','show',f'{SEM_SHA}:{fn}'])
    assert current==original, fn

# Materialize the public tree required by the historical loader prefix.
archive=WORK/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip'
assert archive.exists()
with zipfile.ZipFile(archive) as z: z.extractall(WORK)
pub=WORK/'PSC_V8_3_138_DEV/public'
assert pub.is_dir() and (pub/'psc-v3.js').exists()

# Build the loader-only validation from exact V196 validated prefix while preserving V196 tail.
val=WORK/'validation'
base=(val/'run-v83196-full-regression-sweep-v2.cjs').read_text()
needle="'psc-v83196-v195-v1-hypothetical-preservation-repair.js'];"
assert needle in base
replacement="'psc-v83196-v195-v1-hypothetical-preservation-repair.js',"+','.join(repr(x) for x in EXT)+'];'
base=base.replace(needle,replacement,1)
marker="const files=fs.readdirSync('validation')"
assert marker in base
prefix=base.split(marker)[0]
# Mechanical proof only: no sealed fixture/gold and no case execution.
tail=r'''
if(!s.QCSemanticCoreV65R)throw Error('QCSemanticCoreV65R missing before V197+ validation');
if(!s.QCEvidenceExtractorV5X)throw Error('QCEvidenceExtractorV5X missing');
if(!s.QCSemanticCoreV97)throw Error('QCSemanticCoreV97 missing');
console.log(JSON.stringify({v65r:true,v5x:true,v97:true}));
'''
runner=val/'run-v83219-loader-chain-validation.cjs'
runner.write_text(prefix+tail)
cp=subprocess.run(['node',str(runner.relative_to(WORK))],cwd=WORK,text=True,capture_output=True)
assert cp.returncode==0, cp.stderr
proof=json.loads(cp.stdout.strip().splitlines()[-1])
assert proof=={'v65r':True,'v5x':True,'v97':True}

# Order and final-tail assertions.
assert replacement.index("'psc-v83196-v195-v1-hypothetical-preservation-repair.js'") < replacement.index("'psc-v83197-v196-sealed-a-bounded-repair.js'")
assert EXT[-2:]==['qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js']
for fn in EXT: assert (val/fn).exists(), fn

receipt={
 'candidate':'V8.3.219','phase':'bounded-development-loader-chain-validation',
 'base_development_authority_sha':BASE_SHA,'semantic_base_sha':SEM_SHA,
 'semantic_authority':'QCEvidenceExtractorV5X -> QCSemanticCoreV97',
 'repair_scope':'sealed-runner loader-chain materialization/append logic only',
 'checks':{
  'public_tree_materialized':True,'psc_v3_exists':True,'v196_tail_preserved':True,
  'qcs_semantic_core_v65r_available_before_v197_plus':True,'v197_plus_exact_order':True,
  'final_tail_v5x_to_v97_exact':True,'v5x_available':True,'v97_available':True,
  'semantic_sources_byte_identical':True,'sealed_fixture_or_gold_used':False,
  'v217_sealed_rerun':False,'v218_sealed_rerun':False,'expected_gold_changed':False},
 'semantic_case_execution':False,'sealed_run_consumed':False,'pass':True,
 'step_111_authorized':False,'production_authorized':False}
out=ROOT/'validation/V8_3_219_BOUNDED_LOADER_RECOVERY_RECEIPT.json'
out.write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
