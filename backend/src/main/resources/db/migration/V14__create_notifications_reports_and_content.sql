CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_user_id BIGINT NULL,
    recipient_user_id BIGINT NULL,
    recipient_role VARCHAR(50) NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NULL,
    target_id BIGINT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_sender FOREIGN KEY (sender_user_id) REFERENCES users(user_id),
    CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(user_id),
    INDEX idx_notifications_recipient_user (recipient_user_id, is_read, created_at),
    INDEX idx_notifications_recipient_role (recipient_role, is_read, created_at)
);

CREATE TABLE platform_reports (
    report_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_user_id BIGINT NOT NULL,
    recipient_user_id BIGINT NULL,
    recipient_role VARCHAR(50) NULL,
    report_type VARCHAR(50) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    related_entity_type VARCHAR(50) NULL,
    related_entity_id BIGINT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_platform_reports_reporter FOREIGN KEY (reporter_user_id) REFERENCES users(user_id),
    CONSTRAINT fk_platform_reports_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(user_id),
    INDEX idx_reports_reporter (reporter_user_id, created_at),
    INDEX idx_reports_recipient_role (recipient_role, status, created_at)
);

CREATE TABLE educational_contents (
    content_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    summary VARCHAR(500) NULL,
    body TEXT NOT NULL,
    content_type VARCHAR(30) NOT NULL,
    media_url VARCHAR(500) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    created_by_user_id BIGINT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_educational_contents_creator FOREIGN KEY (created_by_user_id) REFERENCES users(user_id),
    INDEX idx_content_status_type (status, content_type, created_at)
);

CREATE TABLE listing_registration_requests (
    registration_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    requested_by_user_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    note VARCHAR(500) NULL,
    reviewed_by_user_id BIGINT NULL,
    reviewed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_listing_registration_listing FOREIGN KEY (listing_id) REFERENCES product_listings(listing_id),
    CONSTRAINT fk_listing_registration_requester FOREIGN KEY (requested_by_user_id) REFERENCES users(user_id),
    CONSTRAINT fk_listing_registration_reviewer FOREIGN KEY (reviewed_by_user_id) REFERENCES users(user_id),
    UNIQUE KEY uk_listing_registration_listing (listing_id),
    INDEX idx_listing_registration_status (status, created_at)
);
