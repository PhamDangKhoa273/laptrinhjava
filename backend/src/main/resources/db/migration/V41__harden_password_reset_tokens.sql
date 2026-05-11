ALTER TABLE password_reset_tokens
    ADD COLUMN token_hash VARCHAR(128),
    ADD COLUMN revoked_at TIMESTAMP NULL,
    ADD COLUMN used_at TIMESTAMP NULL;

UPDATE password_reset_tokens
SET token_hash = token
WHERE token_hash IS NULL;

ALTER TABLE password_reset_tokens
    MODIFY token_hash VARCHAR(128) NOT NULL;

CREATE UNIQUE INDEX idx_password_reset_tokens_token_hash
    ON password_reset_tokens(token_hash);
