# Backup / Recovery / Runbook

Last updated: 2026-04-26 — aligned with Phase 7 deployment hardening.

## 1) Recovery objectives

Recommended reviewer-facing targets for a single-host Docker Compose deployment:

- **RPO:** 24 hours for database/uploads when daily backups are enabled.
- **RTO:** 1–2 hours for restore to a prepared host with Docker, images, and `.env.prod` available.
- **Critical durable data:** MySQL schema/data and uploaded media.
- **Rebuildable state:** Redis cache/rate-limit/session-adjacent runtime state unless explicitly configured as durable business state.

## 2) Production data inventory

| Data | Default location | Backup priority | Notes |
| --- | --- | --- | --- |
| MySQL | `mysql_data` Docker volume or managed DB | Critical | Includes Flyway history and business records. |
| Uploads/media | `backend_uploads` Docker volume or `APP_MEDIA_UPLOAD_DIR` | Critical if uploads are used | Preserve filenames and paths because DB records reference them. |
| Redis | `redis_data` Docker volume | Medium | AOF is enabled in Compose; still treat as rebuildable cache unless business semantics change. |
| Blockchain tx records | MySQL tables | Critical | DB is canonical for retry/reconciliation state. |
| Container images | Registry tags | Operational | Keep immutable release tags and last known-good tags. |

## 3) DB backup plan

- Backup MySQL daily with `mysqldump`, managed DB snapshot, or volume snapshot.
- Keep at least 7 daily copies and 4 weekly copies.
- Verify restores in a staging DB weekly.
- Backup scope: `bicap_db`, Flyway history, and all application tables.
- Automated backup script: `scripts/backup-db.ps1`.
- Example schedule: `deploy/backup-cron.example`.

### Suggested command

```bash
mysqldump -h <db-host> -u <user> -p --single-transaction --routines --triggers bicap_db > bicap_db_$(date +%F).sql
```

### Restore

```bash
mysql -h <db-host> -u <user> -p bicap_db < bicap_db_YYYY-MM-DD.sql
```

## 4) Upload storage backup plan

- Back up `APP_MEDIA_UPLOAD_DIR` or the Compose `backend_uploads` volume daily.
- Store copies in object storage or a separate disk/volume snapshot.
- Preserve path structure and filenames to keep DB links valid.
- Test restore by loading a known record and confirming media URLs still resolve.
- Automated backup script: `scripts/backup-uploads.ps1`.
- Example schedule: `deploy/backup-cron.example`.

### Suggested command

```bash
tar -czf uploads_$(date +%F).tar.gz <upload-dir>/
```

## 5) Docker Compose production restore order

1. Prepare host with Docker and the exact release image tags.
2. Restore `.env.prod` from secret manager or protected backup.
3. Restore MySQL data or connect the restored managed DB.
4. Restore `backend_uploads` / upload directory.
5. Start Redis, MySQL, backend, then frontend via Compose.
6. Check health endpoints:
   - frontend `/healthz`
   - backend `/actuator/health/readiness`
   - backend `/actuator/health/liveness`
7. Run public smoke checks:
   - `/marketplace`
   - `/public/trace`
   - protected routes redirect to `/login` when unauthenticated.

## 6) Blockchain tx reconciliation runbook

If chain write status and DB status diverge:

1. Query `blockchain_transactions` for `FAILED`, `RETRY_SCHEDULED`, and stale `PENDING` rows.
2. Compare `txHash`, `txStatus`, `governanceStatus`, `retryCount`, and `lastRetryAt`.
3. Re-run the worker or mark the row for retry.
4. If on-chain succeeded but DB missed it, reconcile from canonical payload and persist the final tx state.
5. If DB shows success but chain is missing, mark the record for manual review and emit an incident note.

Practical checks:

- Oldest retry age = now - `last_retry_at`.
- Retry count threshold = operator alert after repeated retries.
- Dead-letter = rows stuck in `FAILED` after repeated attempts.

## 7) Incident response note

### First 15 minutes

- Confirm host/container status.
- Confirm whether failure is app, DB, Redis, storage, or external chain/RPC.
- Preserve logs before restarting if corruption or intrusion is suspected.
- Check frontend `/healthz` and backend actuator health.
- Confirm latest DB backup and latest upload backup.
- Validate recent blockchain tx rows.

### If the server is down

- Bring up MySQL and Redis first.
- Bring up backend and wait for readiness.
- Bring up frontend/nginx.
- If corruption is suspected, restore DB first, then uploads, then replay/reconcile blockchain txs.

## 8) Restore verification checklist

- [ ] MySQL restore completed without SQL errors.
- [ ] Flyway schema history is present.
- [ ] Backend readiness health is `UP`.
- [ ] Frontend `/healthz` returns `ok`.
- [ ] Public marketplace loads.
- [ ] Public trace page loads.
- [ ] Protected route redirects unauthenticated users to `/login`.
- [ ] Uploaded media referenced by a known record resolves.
- [ ] Blockchain retry queue has no unexpected stale `PENDING` rows.

## Reviewer answer, short form

- MySQL is backed up daily and restored before application startup.
- Uploads are backed up separately through `backend_uploads` / `APP_MEDIA_UPLOAD_DIR`.
- Redis uses AOF in Compose but is treated as rebuildable runtime cache unless business use changes.
- Blockchain writes are recoverable through DB transaction records and reconciliation.
- Recovery order is DB, uploads, backend readiness, frontend health, then transaction replay/checks.
