import json,subprocess,pathlib
FROZEN='146afea9914ef23a28943178f6ab8f7b6c319057'
path='validation/v83215-v1-sealed/V8_3_215_V1_BATCH_A_FIRST_RUN_RESULTS.json'
raw=subprocess.check_output(['git','show',f'{FROZEN}:{path}'],text=True)
data=json.loads(raw)
fails=[r for r in data['results'] if not r['pass']]
out={'candidate':'V8.3.216 DEVELOPMENT','source':'frozen V8.3.215 sealed Batch A first-run evidence','frozen_commit':FROZEN,'sealed_run_id':data['run_id'],'total':data['total'],'passed':data['passed'],'failed':data['failed'],'failures':[{'case_id':r['case_id'],'mechanism':r['mechanism'],'language':r['language'],'domain':r['domain'],'expected':r['expected'],'actual':r['actual'],'surface':r['surface']} for r in fails]}
pathlib.Path('validation/V8_3_216_V215_V1_FAILURE_FORENSIC_IMMUTABLE.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'failed':len(fails),'ids':[r['case_id'] for r in fails],'mechanisms':[r['mechanism'] for r in fails]},ensure_ascii=False))
