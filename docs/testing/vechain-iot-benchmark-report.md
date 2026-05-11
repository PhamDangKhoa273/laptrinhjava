# VeChainThor / IoT Concurrency Benchmark Report

- tool used: k6
- scope: concurrent trace reads, concurrent IoT reads, shipment event writes
- status: partial run only, backend stability still needs a clean final pass

## What the system proves
- blockchain writes are persisted as DB records with retry metadata (`retryCount`, `lastRetryAt`, `governanceStatus`)
- worker-based retry exists for failed blockchain tx records
- trace reads are public and read-only
- IoT and shipment paths are separated from the request thread model by persistence + async retry design

## Captured benchmark evidence
- p95 trace reads: not valid in the final broken run, because the backend refused connections during the load window
- p95 IoT reads: not valid in the final broken run, because the backend refused connections during the load window
- p95 shipment events: not valid in the final broken run, because the backend refused connections during the load window
- fail ratio: 100% in the final broken run
- tx retry count: available in DB/worker model, but not meaningfully measured in the broken run
- worker lag: not captured from a clean run

## Honest status
- The concurrency architecture is in place, but the repository still needs one clean end-to-end benchmark pass with the backend staying up for the full duration.
- Until then, section 45 cannot honestly be marked complete.
- Recovery / incident response details are documented in `docs/backup-recovery-runbook.md`.

## Next required step
- stabilize backend startup and rerun the same k6 scenarios on a live server, then replace this report with real p95/fail/lag numbers.
