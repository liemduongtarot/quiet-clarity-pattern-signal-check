import hashlib, json, pathlib, datetime

CONTRACT_VERSION='V8.3.254-EVIDENCE-PROVENANCE-V1'
CASE_REQUIRED=[
 'case_id','batch','run_id','run_attempt','execution_ordinal','executed_at_utc',
 'validated_development_head_sha','semantic_authority','source_runner_sha256',
 'candidate_bank_sha256','selection_sha256','fixture_sha256','gold_sha256',
 'membership_sha256','preseal_audit_sha256','schema_contract_sha256',
 'category','language','domain','surface_sha256','expected','actual','pass',
 'canonical_state_trace_ref','previous_record_sha256','record_sha256'
]
LEDGER_REQUIRED=['ledger_version','candidate','batch','run_id','run_attempt','reservation','entries','final_chain_sha256','sealed']

def canonical_bytes(obj):
    return json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()

def sha_obj(obj): return hashlib.sha256(canonical_bytes(obj)).hexdigest()
def sha_file(path): return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()
def utc_now(): return datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')

def record_hash_payload(record):
    d={k:v for k,v in record.items() if k!='record_sha256'}
    return sha_obj(d)

def finalize_case_record(record):
    missing=[k for k in CASE_REQUIRED if k!='record_sha256' and k not in record]
    if missing: raise ValueError('missing case provenance fields: '+','.join(missing))
    out=dict(record);out['record_sha256']=record_hash_payload(out)
    return out

def verify_case_record(record):
    missing=[k for k in CASE_REQUIRED if k not in record]
    if missing:return False,'missing:'+','.join(missing)
    if record['record_sha256']!=record_hash_payload(record):return False,'record-hash-mismatch'
    if record['batch'] not in ('A','B'):return False,'invalid-batch'
    if not isinstance(record['execution_ordinal'],int) or record['execution_ordinal']<1:return False,'invalid-ordinal'
    if record['canonical_state_trace_ref'] in (None,''):return False,'missing-state-trace-ref'
    return True,'ok'

def new_ledger(candidate,batch,run_id,run_attempt,reservation):
    return {'ledger_version':CONTRACT_VERSION,'candidate':candidate,'batch':batch,'run_id':str(run_id),'run_attempt':str(run_attempt),'reservation':reservation,'entries':[],'final_chain_sha256':reservation['reservation_sha256'],'sealed':False}

def append_case(ledger,record):
    if ledger.get('sealed'):raise ValueError('ledger sealed')
    ok,why=verify_case_record(record)
    if not ok:raise ValueError(why)
    expected_prev=ledger['final_chain_sha256']
    if record['previous_record_sha256']!=expected_prev:raise ValueError('ledger previous hash mismatch')
    if record['execution_ordinal']!=len(ledger['entries'])+1:raise ValueError('ledger ordinal mismatch')
    ledger['entries'].append(record);ledger['final_chain_sha256']=record['record_sha256']

def seal_ledger(ledger):
    if len(ledger['entries'])!=30:raise ValueError('ledger requires 30 case entries')
    ledger['sealed']=True
    ledger['ledger_sha256']=sha_obj({k:v for k,v in ledger.items() if k!='ledger_sha256'})
    return ledger

def verify_ledger(ledger):
    missing=[k for k in LEDGER_REQUIRED if k not in ledger]
    if missing:return False,'missing-ledger:'+','.join(missing)
    if not ledger['sealed']:return False,'ledger-not-sealed'
    if len(ledger['entries'])!=30:return False,'ledger-cardinality'
    prev=ledger['reservation'].get('reservation_sha256')
    if not prev:return False,'missing-reservation-hash'
    for i,r in enumerate(ledger['entries'],1):
        ok,why=verify_case_record(r)
        if not ok:return False,f'case-{i}:{why}'
        if r['execution_ordinal']!=i:return False,f'case-{i}:ordinal'
        if r['previous_record_sha256']!=prev:return False,f'case-{i}:chain'
        prev=r['record_sha256']
    if ledger['final_chain_sha256']!=prev:return False,'final-chain'
    calc=sha_obj({k:v for k,v in ledger.items() if k!='ledger_sha256'})
    if ledger.get('ledger_sha256')!=calc:return False,'ledger-hash-mismatch'
    return True,'ok'

def build_reservation(candidate,batch,run_id,run_attempt,development_sha,semantic_authority,source_runner_sha256):
    d={'candidate':candidate,'batch':batch,'run_id':str(run_id),'run_attempt':str(run_attempt),'reserved_at_utc':utc_now(),'validated_development_head_sha':development_sha,'semantic_authority':semantic_authority,'source_runner_sha256':source_runner_sha256,'reserved_before_semantic_execution':True}
    d['reservation_sha256']=sha_obj(d)
    return d
