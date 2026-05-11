UPDATE blockchain_transactions
SET tx_hash = '643a98bc87f936cb68f9e6ccb48962c72db7a3f4e0dbbc7e0113d2aaacf462ae',
    tx_status = 'SUCCESS',
    governance_status = 'GOVERNED',
    governance_note = 'Demo local proof hash matches verifyBatch canonical localHash.'
WHERE related_entity_type = 'BATCH'
  AND related_entity_id = 1;
