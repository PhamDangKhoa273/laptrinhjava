# Backup / Recovery / Runbook

## 1) DB backup plan
- Backup MySQL daily with `mysqldump` or volume snapshot.
- Keep at least 7 daily copies and 4 weekly copies.
- Verify restores in a staging DB weekly.
- Backup scope: `bicap_db` schema, Flyway history, and any seed/state tables.
- Automated backup script: `scripts/backup-db.ps1`
- Example schedule: `deploy/backup-cron.example`

### Suggested command
```bash
mysqldump -h <db-host> -u <user> -p --single-transaction --routines --triggers bicap_db > bicap_db_$(date +%F).sql
```

### Restore
```bash
mysql -h <db-host> -u <user> -p bicap_db < bicap_db_YYYY-MM-DD.sql
```

## 2) Upload storage backup plan
- Back up the upload directory (`app.media.upload-dir`) daily.
- Store copies in object storage or a separate disk/volume snapshot.
- Preserve path structure and filenames to keep DB links valid.
- Test restore by reloading a known record and confirming media URLs still resolve.
- Automated backup script: `scripts/backup-uploads.ps1`
- Example schedule: `deploy/backup-cron.example`

### Suggested command
```bash
tar -czf uploads_$(date +%F).tar.gz <upload-dir>/
```

## 3) Blockchain tx reconciliation runbook
If chain write status and DB status diverge:
1. Query `blockchain_transactions` for `FAILED`, `RETRY_SCHEDULED`, and stale `PENDING` rows.
2. Compare `txHash`, `txStatus`, `governanceStatus`, `retryCount`, `lastRetryAt`.
3. Re-run the worker or mark the row for retry.
4. If on-chain succeeded but DB missed it, reconcile from canonical payload and persist the final tx state.
5. If DB shows success but chain is missing, mark the record for manual review and emit an incident note.

### Practical checks
- oldest retry age = now - `last_retry_at`
- retry count threshold = operator alert after repeated retries
- dead-letter = rows stuck in `FAILED` after repeated attempts

## 4) Incident response note
### If the server is down
- Bring up MySQL, Redis, then backend.
- Check `/actuator/health` and `/actuator/prometheus`.
- Confirm the last good DB backup and the latest upload backup.
- Validate recent blockchain tx rows.
- If needed, restore DB first, then uploads, then replay/reconcile blockchain txs.

### First 15 minutes
- Confirm host/container status.
- Confirm whether failure is app, DB, Redis, or storage.
- Preserve logs.
- Restore from latest verified backup if corruption is suspected.

### Reviewer answer, short form
- DB is backed up daily.
- Uploads are backed up separately.
- Blockchain writes are recoverable through tx records and reconciliation.
- Recovery order is DB, uploads, then transaction replay/checks.
