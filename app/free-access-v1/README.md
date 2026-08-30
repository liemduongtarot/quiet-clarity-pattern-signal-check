# PSC Free Access v1

An isolated Track B application layer. It enforces verified-user access, atomic quota reservation, idempotent reading creation, durable history, and the canonical **4 successful persisted results per rolling 30-day cycle** policy.

This application does not import, construct, or execute PSC core code. All reading creation goes through the deterministic `MockPSCExecutor`, which implements:

```text
executePSC(request) -> PSCExecutionResult
```

## Runtime

- Node.js 24 or newer
- No third-party runtime or test dependencies
- SQLite through Node's built-in `node:sqlite`

From this directory:

```sh
npm test
npm run qualify
FREE_ACCESS_DEV_AUTH=1 FREE_ACCESS_AUTH_SECRET="replace-with-at-least-32-characters" npm start
```

The server exposes `POST /api/readings`, `GET /api/quota`, `GET /api/readings`, and `GET /api/readings/:id`. API requests require a signed bearer identity whose `email_verified` claim is `true`. The optional development identity issuer is disabled unless `FREE_ACCESS_DEV_AUTH=1`.

Policy is configured with `FREE_ACCESS_MAX_RESULTS`, `FREE_ACCESS_CYCLE_DAYS`, `FREE_ACCESS_RESERVATION_TTL_SECONDS`, `FREE_ACCESS_RATE_LIMIT_MAX`, and `FREE_ACCESS_RATE_LIMIT_WINDOW_SECONDS`.

Qualification artifacts are written under `qualification/`. Passing qualification creates a frozen source manifest, report, `.tgz` package, and SHA-256 sidecar. The package is a pre-integration artifact only.
