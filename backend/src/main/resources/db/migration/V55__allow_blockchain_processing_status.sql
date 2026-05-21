ALTER TABLE blockchain_transactions
DROP CHECK blockchain_transactions_chk_1;

ALTER TABLE blockchain_transactions
ADD CONSTRAINT blockchain_transactions_chk_1
CHECK (governance_status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CONFIG_BLOCKED', 'GOVERNED', 'RETRY_SCHEDULED'));
