from pathlib import Path
import subprocess,hashlib,json
src=subprocess.check_output(['git','show','origin/v83253-v1-sealed-validation:validation/v83253-batch-a-self-contained.py'],text=True)
# Mechanical version/evidence transition only; semantic authority remains V5AY/V124.
repls=[
 ("TARGET='89db04ec936af998c14d2f0451ef87270ea8e349'","TARGET='238cdba6ee2d4d17bcde19de2d895a7087983345'"),
 ("SEALED=REPO/'validation/v83253-v1-sealed'","SEALED=REPO/'validation/v83254-v1-sealed'"),
 ("WORK=pathlib.Path('/tmp/v83253-batch-a-authority')","WORK=pathlib.Path('/tmp/v83254-batch-a-authority')"),
 ("ROOT='validation/v83253-v1-sealed-runtime'","ROOT='validation/v83254-v1-sealed-runtime'"),
 ('V8_3_253','V8_3_254'),('V8.3.253','V8.3.254'),('v83253','v83254'),('PSC_V8_3_253','PSC_V8_3_254'),
 ("'v251_sealed_rerun':False,'v252_batch_a_rerun':False","'v253_sealed_rerun':False,'v254_batch_a_rerun':False")]
for a,b in repls: src=src.replace(a,b)
# Broad namespace replacement must not mutate inherited semantic filenames.
src=src.replace('qc-evidence-extractor-v5ay-v254-v252-residual.js','qc-evidence-extractor-v5ay-v253-v252-residual.js')
src=src.replace('psc-v83254-v252-v124-residual.js','psc-v83253-v252-v124-residual.js')
# V254 has no semantic child; keep exact V253 semantic filenames in loader chain.
# Add provenance files to checkpoint.
old="'V8_3_254_STATIC_SEALED_PREFLIGHT_V1.json']"
new="'V8_3_254_STATIC_SEALED_PREFLIGHT_V1.json','V8_3_254_BATCH_A_RESERVATION_V1.json','V8_3_254_BATCH_A_CASE_PROVENANCE_V1.json','V8_3_254_BATCH_A_EXECUTION_LEDGER_V1.json','V8_3_254_SEMANTIC_FINGERPRINTS_V1.json','V8_3_254_CONTAMINATION_DUPLICATE_AUDIT_V1.json','V8_3_254_EVIDENCE_PROVENANCE_CONTRACT_COPY_V1.json','V8_3_254_SEMANTIC_SOURCE_IDENTITY_REPORT_V1.json','V8_3_254_RUNTIME_CONFIG_SCHEMA_MANIFEST_V1.json']"
if old not in src: raise SystemExit('checkpoint anchor missing')
src=src.replace(old,new,1)
# Insert provenance augmentation after semantic result is copied, before status is frozen.
anchor=" if RESULT.exists():\n  a=json.loads(RESULT.read_text());st=status("
if anchor not in src: raise SystemExit('result provenance anchor missing')
block=""" if RESULT.exists():
  import importlib.util
  a=json.loads(RESULT.read_text())
  spec=importlib.util.spec_from_file_location('v254prov',WORK/'validation/v83254-evidence-provenance.py');prov=importlib.util.module_from_spec(spec);spec.loader.exec_module(prov)
  reservation=json.loads((SEALED/'V8_3_254_BATCH_A_RESERVATION_V1.json').read_text());ledger=prov.new_ledger('V8.3.254','A',os.environ.get('GITHUB_RUN_ID'),os.environ.get('GITHUB_RUN_ATTEMPT'),reservation)
  matrec=json.loads((SEALED/'V8_3_254_RUNNER_MATERIALIZATION_V1.json').read_text());auth=json.loads((SEALED/'V8_3_254_SEALED_AUTHORITY_V1.json').read_text())
  contract_sha=prov.sha_file(WORK/'validation/V8_3_254_EVIDENCE_PROVENANCE_CONTRACT_V1.json');records=[]
  for ordinal,row in enumerate(a['results'],1):
   rec=prov.finalize_case_record({'case_id':row['case_id'],'batch':'A','run_id':str(os.environ.get('GITHUB_RUN_ID')),'run_attempt':str(os.environ.get('GITHUB_RUN_ATTEMPT')),'execution_ordinal':ordinal,'executed_at_utc':prov.utc_now(),'validated_development_head_sha':TARGET,'semantic_authority':SEM,'source_runner_sha256':matrec['runner_sha256'],'candidate_bank_sha256':auth['hashes']['candidate_bank'],'selection_sha256':auth['hashes']['selection'],'fixture_sha256':auth['hashes']['fixture'],'gold_sha256':auth['hashes']['independent_gold'],'membership_sha256':auth['hashes']['membership'],'preseal_audit_sha256':auth['hashes']['preseal_audit'],'schema_contract_sha256':contract_sha,'category':row['category'],'language':row['language'],'domain':row['domain'],'surface_sha256':hashlib.sha256(row['surface'].encode()).hexdigest(),'expected':row['expected'],'actual':row['actual'],'pass':bool(row['pass']),'canonical_state_trace_ref':'V8_3_254_BATCH_A_RESULT_V1.json#'+row['case_id'],'previous_record_sha256':ledger['final_chain_sha256']})
   prov.append_case(ledger,rec);records.append(rec)
  prov.seal_ledger(ledger);ok,why=prov.verify_ledger(ledger);assert ok,why
  (SEALED/'V8_3_254_BATCH_A_CASE_PROVENANCE_V1.json').write_text(json.dumps({'candidate':'V8.3.254','batch':'A','records':records},ensure_ascii=False,indent=2)+'\\n')
  (SEALED/'V8_3_254_BATCH_A_EXECUTION_LEDGER_V1.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\\n')
  st=status("""
src=src.replace(anchor,block,1)
# Strengthen status with provenance flags by extending conclusion calls.
src=src.replace("conclusion='success' if a['passed']==30 else 'failure')","case_provenance_recorded=True,execution_ledger_sealed=True,conclusion='success' if a['passed']==30 else 'failure')",1)
# Required/static guards.
required=['V8_3_254_BATCH_A_CASE_PROVENANCE_V1.json','V8_3_254_BATCH_A_EXECUTION_LEDGER_V1.json','V8_3_254_BATCH_A_RESERVATION_V1.json','v83254-evidence-provenance.py','execution_ordinal','previous_record_sha256','schema_contract_sha256','QCSemanticCoreV124.analyze','238cdba6ee2d4d17bcde19de2d895a7087983345']
missing=[x for x in required if x not in src]
if missing: raise SystemExit('missing V254 provenance runner literals '+repr(missing))
forbidden=['QCSemanticCoreV125','QCEvidenceExtractorV5AZ','V8_3_253_BATCH_A_RESULT_V1.json','validation/v83253-v1-sealed-runtime']
stale=[x for x in forbidden if x in src]
if stale: raise SystemExit('stale/semantic-change literals '+repr(stale))
compile(src,'validation/v83254-batch-a-self-contained.py','exec')
p=Path('validation/v83254-batch-a-self-contained.py');p.write_text(src)
rec={'candidate':'V8.3.254','phase':'provenance-enabled-runner-materialization','validated_development_head_sha':'238cdba6ee2d4d17bcde19de2d895a7087983345','parent_development_sha':'89db04ec936af998c14d2f0451ef87270ea8e349','semantic_authority':'QCEvidenceExtractorV5AY -> QCSemanticCoreV124','runner_sha256':hashlib.sha256(src.encode()).hexdigest(),'provenance_capture':True,'append_only_ledger':True,'case_level_hash_chain':True,'semantic_change':False,'expected_gold_changed':False,'pass':True,'sealed_semantics_executed':False,'step_111_authorized':False}
Path('validation/v83254-v1-sealed/V8_3_254_RUNNER_MATERIALIZATION_V1.json').write_text(json.dumps(rec,indent=2)+'\n');print(json.dumps(rec))
