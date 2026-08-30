# Repository inspection

Inspection base: `main` at `9282f815e130736cd867449071c190147cd99a3a`.

## Findings

| Concern | Actual repository state |
| --- | --- |
| Application/framework | None on `main`; only the root `package.json` is tracked. |
| Package manager | No lockfile or package-manager declaration. The root manifest lists `pg` and `@vercel/oidc`, but no application imports or scripts exist. |
| Database/data layer | None. No schema, migrations, repository, or data models exist. |
| Authentication | None. `@vercel/oidc` is declared but unused and is not evidence of end-user authentication. |
| API/server | None. |
| Frontend | None on `main`. |
| Tests | None on `main`. Detached validation branches contain PSC-core validation harnesses only. |
| CI | None on `main`. Detached validation branches contain governed PSC validation workflows. |
| Account/user models | None. |
| Reading/result persistence | None. |
| Rate-limit/security utilities | None. |
| Existing app/access boundary | None. A new isolated `app/free-access-v1/` boundary is therefore the safest location. |

## Safe reuse

- Node.js/ES module convention from the root `package.json` (`"type": "module"`).
- Node 24, matching the repository's existing validation CI runtime convention.
- The repository's GitHub Actions platform, through a new independent workflow only.

The root dependencies are not reused: there is no lockfile, installed architecture, or end-user auth contract proving they belong to an application layer. Free Access v1 uses only Node built-ins.

## Protected and untouched

- `main` and its root `package.json`.
- All `validation/` content and V8.3.139–V8.3.146 assets/workflows.
- Product P1 and all Product P1 requalification outputs.
- C2, C2-L1, C2-L2, H2, pre-holdout, holdout, executor, staging, authorization, and Track A workflow/state paths.
- Existing `.github/workflows/v831*.yml` files.
- Untracked artifacts in the detached root checkout, which are user-owned and were not used as application source.

The only permitted repository-level addition is `.github/workflows/free-access-v1.yml`; all other Track B files live below `app/free-access-v1/`.
