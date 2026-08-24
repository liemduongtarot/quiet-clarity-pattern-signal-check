from pathlib import Path
import sys
p=Path(sys.argv[1] if len(sys.argv)>1 else 'candidate/client/candidate.html')
s=p.read_text(encoding='utf-8')
old="let decision=PSCUIAuthorityV83137.resolveSituationGate(QCSemanticCoreV4,S.sit,bad(S.sit)),route=decision.route,k=decision.gate;"
new="let legacyGate=bad(S.sit),decision=PSCUIAuthorityV83137.resolveSituationGate(QCSemanticCoreV4,S.sit,legacyGate);if(legacyGate==='vague'&&decision.route&&decision.route.action==='continue')decision={route:decision.route,gate:'vague',authority:'v83256-approved-vague-precheck'};let route=decision.route,k=decision.gate;"
assert s.count(old)==1, 'situation gate anchor changed unexpectedly'
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
