import json,hashlib,pathlib,zipfile,tempfile,shutil,re,subprocess

ROOT=pathlib.Path('.')
BASE='456a88d01b671f0cb92a0be31f4d34d68f60d135'
VAL=ROOT/'validation'
ARCHIVE=ROOT/'PSC_V8_3_139_FINAL_LOCAL_READINESS_EXTERNAL_BUILD_PENDING_CHECKPOINT (1).zip'
SEM=['qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js']

def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def show(path):return subprocess.check_output(['git','show',f'{BASE}:{path}'])

checks={}
# V8.3.218 starts from exact V8.3.217 DEVELOPMENT authority; semantic files must remain byte-identical.
for n in SEM:
 p=VAL/n
 checks['semantic_unchanged_'+n]=p.exists() and p.read_bytes()==show('validation/'+n)

checks['archive_exists']=ARCHIVE.exists()
required_public=[]
base_runner=(VAL/'run-v83196-full-regression-sweep-v2.cjs').read_text()
m=re.search(r"const base=\[(.*?)\];",base_runner,re.S)
if not m:raise SystemExit('cannot parse base loader list')
required_public=re.findall(r"'([^']+\.js)'",m.group(1))
checks['base_loader_list_nonempty']=len(required_public)>0

with tempfile.TemporaryDirectory() as td:
 t=pathlib.Path(td)
 if ARCHIVE.exists():
  with zipfile.ZipFile(ARCHIVE) as z:z.extractall(t)
 pub=t/'PSC_V8_3_138_DEV'/'public'
 missing=[n for n in required_public if not (pub/n).exists()]
 checks['materialized_public_tree_exists']=pub.is_dir()
 checks['all_base_public_loader_files_materialized']=not missing
 checks['psc_v3_materialized']=(pub/'psc-v3.js').exists()

# All validated V97 extension files are already present in validation; the failure was only public-tree materialization.
required_tail=['psc-v83196-v195-v1-hypothetical-preservation-repair.js','qc-evidence-extractor-v5t-v213-relational-paraphrase-recall.js','psc-v83213-v212-v93-relational-paraphrase-recall.js','qc-evidence-extractor-v5u-v214-sealed-recall.js','psc-v83214-v213-v94-sealed-recall.js','qc-evidence-extractor-v5u2-v214-clarification-containment.js','psc-v83214-v213-v94r-clarification-containment.js','qc-evidence-extractor-v5v-v215-compositional-recall.js','psc-v83215-v214-v95-compositional-recall.js','qc-evidence-extractor-v5w-v216-sealed-recall.js','psc-v83216-v215-v96-sealed-recall.js','qc-evidence-extractor-v5x-v217-relational-recall.js','psc-v83217-v216-v97-relational-recall.js']
missing_tail=[n for n in required_tail if not (VAL/n).exists()]
checks['v97_tail_files_present']=not missing_tail

result={'candidate':'V8.3.218','phase':'bounded-runner-materialization-recovery','base_development_authority_sha':BASE,'semantic_authority':'QCEvidenceExtractorV5X -> QCSemanticCoreV97','change_scope':'validation-runner materialization only','checks':checks,'missing_public_files':missing,'missing_tail_files':missing_tail,'semantic_runtime_executed':False,'semantic_authority_loaded':False,'v217_batch_a_rerun':False,'v217_batch_b_rerun':False,'expected_gold_changed':False,'step_111_authorized':False,'production_authorized':False}
result['pass']=all(checks.values())
(VAL/'V8_3_218_BOUNDED_RECOVERY_RECEIPT.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
raise SystemExit(0 if result['pass'] else 1)
