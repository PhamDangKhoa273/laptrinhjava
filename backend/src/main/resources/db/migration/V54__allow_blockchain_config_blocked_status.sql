SET @constraint_name := (
    SELECT CONSTRAINT_NAME
    FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND CONSTRAINT_NAME = 'blockchain_transactions_chk_1'
    LIMIT 1
);

SET @drop_sql := IF(
    @constraint_name IS NULL,
    'SELECT 1',
    'ALTER TABLE blockchain_transactions DROP CHECK blockchain_transactions_chk_1'
);

PREPARE drop_stmt FROM @drop_sql;
EXECUTE drop_stmt;
DEALLOCATE PREPARE drop_stmt;

ALTER TABLE blockchain_transactions
    ADD CONSTRAINT blockchain_transactions_chk_1
    CHECK (governance_status IN ('PENDING', 'SUCCESS', 'FAILED', 'CONFIG_BLOCKED', 'GOVERNED', 'RETRY_SCHEDULED'));
