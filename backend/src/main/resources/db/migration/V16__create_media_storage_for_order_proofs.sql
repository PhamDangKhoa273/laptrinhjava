CREATE TABLE media_files (
    media_file_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_user_id BIGINT NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NULL,
    storage_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_files_owner FOREIGN KEY (owner_user_id) REFERENCES users(user_id),
    INDEX idx_media_entity (entity_type, entity_id),
    INDEX idx_media_owner (owner_user_id, created_at)
);
