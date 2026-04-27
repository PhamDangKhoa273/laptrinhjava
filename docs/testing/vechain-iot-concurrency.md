# VeChainThor / IoT concurrency evidence

## What exists in code
- `BlockchainService` stores canonical blockchain transactions in DB before/around submission.
- `BlockchainTransaction` keeps `retryCount`, `lastRetryAt`, `governanceStatus`.
- `BlockchainTxWorker` retries FAILED / RETRY_SCHEDULED items on a schedule.
- `IoTService` persists sensor readings and alerts through repositories, so ingest is DB-backed and safe under concurrent requests.
- Public trace reads are served by trace controllers/services and are read-only.

## Async / queue model
- Request thread writes a transaction record first.
- Worker thread replays failed transactions.
- Retry metadata is persisted, so retries are idempotent at the record level.
- If an event fails repeatedly, the record remains in FAILED / RETRY_SCHEDULED for operator review.

## Benchmark plan
Use one of these tools:
- k6 for HTTP concurrency
- JMeter for mixed read/write load
- Gatling if you want JVM-native scripts

### Scenarios
1. Concurrent trace reads
   - GET `/api/v1/public/trace?traceCode=...`
   - target: read-heavy burst

2. Concurrent IoT writes
   - POST `/api/v1/iot/ingest`
   - target: sensor burst under load

3. Concurrent order / shipment events
   - POST / PATCH order and shipment endpoints
   - target: state-change burst under mixed traffic

### Metrics to capture
- p95 latency
- fail ratio
- tx retry count
- worker lag (oldest FAILED / RETRY_SCHEDULED age)

## Minimal report template
- tool used:
- duration:
- virtual users:
- p95 trace reads:
- p95 IoT writes:
- p95 order/shipment:
- fail ratio:
- tx retry count:
- worker lag:
- notes:

## Honest status
This repository now has the runtime hooks for retryable blockchain writes and IoT ingest, but you still need to run the load tool to produce real benchmark numbers.
