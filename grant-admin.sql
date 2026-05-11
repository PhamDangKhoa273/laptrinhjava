USE bicap_db;
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'nhockhang266@gmail.com'
  AND r.role_name = 'ADMIN';

SELECT u.user_id, u.email, u.full_name, GROUP_CONCAT(r.role_name ORDER BY r.role_name SEPARATOR ',') AS roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.user_id
LEFT JOIN roles r ON r.role_id = ur.role_id
WHERE u.email = 'nhockhang266@gmail.com'
GROUP BY u.user_id;
