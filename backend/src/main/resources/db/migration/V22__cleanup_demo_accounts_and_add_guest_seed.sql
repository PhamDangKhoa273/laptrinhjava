UPDATE users
SET password_hash = '$2a$10$7GzLCHxjGfW1.3QWgYf3GeU3L8Lk0mQ8mW4Z2E0gV3m6nP4rZ5k1K'
WHERE email IN (
    'admin@bicap.com',
    'farm@bicap.com',
    'retailer@bicap.com',
    'manager@bicap.com',
    'driver@bicap.com'
);

DELETE ur FROM user_roles ur
JOIN users u ON u.user_id = ur.user_id
WHERE u.email IN (
    'qhuynguyen0812@gmail.com',
    'nhockhang266@gmail.com',
    'pkhoa3322@gmail.com'
);

DELETE FROM users
WHERE email IN (
    'qhuynguyen0812@gmail.com',
    'nhockhang266@gmail.com',
    'pkhoa3322@gmail.com'
);

DELETE ur FROM user_roles ur
JOIN users u ON u.user_id = ur.user_id
JOIN roles r ON r.role_id = ur.role_id
WHERE u.email = 'driver@bicap.com'
  AND r.role_name <> 'DRIVER';

DELETE ur FROM user_roles ur
JOIN users u ON u.user_id = ur.user_id
JOIN roles r ON r.role_id = ur.role_id
WHERE u.email = 'admin@bicap.com'
  AND r.role_name <> 'ADMIN';

DELETE ur FROM user_roles ur
JOIN users u ON u.user_id = ur.user_id
JOIN roles r ON r.role_id = ur.role_id
WHERE u.email = 'farm@bicap.com'
  AND r.role_name <> 'FARM';

DELETE ur FROM user_roles ur
JOIN users u ON u.user_id = ur.user_id
JOIN roles r ON r.role_id = ur.role_id
WHERE u.email = 'retailer@bicap.com'
  AND r.role_name <> 'RETAILER';

DELETE ur FROM user_roles ur
JOIN users u ON u.user_id = ur.user_id
JOIN roles r ON r.role_id = ur.role_id
WHERE u.email = 'manager@bicap.com'
  AND r.role_name <> 'SHIPPING_MANAGER';

INSERT INTO users(full_name, email, password_hash, phone, avatar_url, status)
SELECT 'Guest Demo', 'guest@bicap.com', '$2a$10$7GzLCHxjGfW1.3QWgYf3GeU3L8Lk0mQ8mW4Z2E0gV3m6nP4rZ5k1K', '0900000006', NULL, 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'guest@bicap.com'
);

UPDATE users
SET full_name = 'Guest Demo',
    phone = '0900000006',
    status = 'ACTIVE',
    password_hash = '$2a$10$7GzLCHxjGfW1.3QWgYf3GeU3L8Lk0mQ8mW4Z2E0gV3m6nP4rZ5k1K'
WHERE email = 'guest@bicap.com';

DELETE ur FROM user_roles ur
JOIN users u ON u.user_id = ur.user_id
JOIN roles r ON r.role_id = ur.role_id
WHERE u.email = 'guest@bicap.com'
  AND r.role_name <> 'GUEST';

INSERT INTO user_roles(user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r ON r.role_name = 'GUEST'
WHERE u.email = 'guest@bicap.com'
  AND NOT EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.user_id = u.user_id
        AND ur.role_id = r.role_id
  );
