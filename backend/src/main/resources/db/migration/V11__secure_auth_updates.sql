CREATE TABLE password_reset_tokens (
    token_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Update admin password to 'Admin123'
-- Hash: $2a$10$EblZqNptyYvcLm/VwDC4u.jzoJPKQZ669SduG9K.P7IuK7fN/C6Kq
UPDATE users 
SET password_hash = '$2a$10$EblZqNptyYvcLm/VwDC4u.jzoJPKQZ669SduG9K.P7IuK7fN/C6Kq' 
WHERE email = 'admin@bicap.com';
