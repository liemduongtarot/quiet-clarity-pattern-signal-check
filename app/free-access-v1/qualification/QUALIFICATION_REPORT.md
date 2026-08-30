# Free Access v1 qualification report

Verdict: **PASS**

- Branch: `app/psc-free-access-v1`
- Base: `main` at `9282f815e130736cd867449071c190147cd99a3a`
- Tests: 33 passed, 0 failed (12 canonical; 15 adversarial; 3 API/UI; 3 isolation)
- Maximum successful uses observed in one active cycle: 4/4
- Fifth attempt blocked before inference: true
- System-failure uses consumed: 0
- System-failure reservations remaining: 0
- Mock executions in limit proof: 4
- Live PSC executions: 0
- Track A governed files changed: 0
- Main changed: 0
- Integration state: **STOPPED BEFORE PSC-CORE INTEGRATION**

The qualified lifecycle is `reserve → execute mock → validate → persist → commit`. Reading history and reopen use the persisted result and never execute inference.
