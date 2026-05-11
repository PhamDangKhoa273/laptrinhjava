# BICAP Scripts

Operational scripts are grouped by purpose.

## Structure

| Folder | Purpose |
|---|---|
| `audit/` | Generated endpoint/API audit snapshots |
| `backup/` | Database and upload backup helpers |
| `database/` | SQL seed/patch utilities for local/demo data |
| `loadtest/` | k6, IoT simulator, and benchmark helpers |
| `smoke/` | Smoke-test scripts for local/prod checks |

## Notes

- Scripts are local/demo/operator helpers, not application source code.
- Prefer environment variables for secrets.
- Do not commit real credentials or production dumps.

## Common Commands

Run frontend verification from `frontend/`:

```powershell
npm run test
npm run build
npm audit --audit-level=moderate
```

Run the k6 wrapper from `scripts/loadtest/` when Docker is available:

```powershell
node run-k6.mjs
```
