UPDATE blockchain_transactions
SET action_type = 'UPSERT',
    data_payload = '{"batchCode":"BATCH-DEMO-001","batchId":1,"harvestDate":"2026-04-14","productId":2,"qualityGrade":"A+","quantity":1250,"seasonId":1}',
    tx_status = 'SUCCESS',
    governance_status = 'GOVERNED',
    governance_note = 'Demo local proof matches the canonical batch payload.'
WHERE related_entity_type = 'BATCH'
  AND related_entity_id = 1;
