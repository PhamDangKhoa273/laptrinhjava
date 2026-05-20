-- Repair demo drift where a farm was owned by the GUEST demo user, blocking farm-side order approval.

INSERT INTO users(full_name, email, password_hash, phone, avatar_url, status)
SELECT 'Da Lat Farm Demo', 'dalatfarm@bicap.com', '$2a$10$zal0BW6BNzIcchginKTMl.sLofkMVYkXcDotWcc6dEtSoJ4RQDITS', '0900000007', NULL, 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'dalatfarm@bicap.com'
);

UPDATE users
SET password_hash = '$2a$10$zal0BW6BNzIcchginKTMl.sLofkMVYkXcDotWcc6dEtSoJ4RQDITS',
    status = 'ACTIVE'
WHERE email = 'dalatfarm@bicap.com';

INSERT INTO user_roles(user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r ON r.role_name = 'FARM'
WHERE u.email = 'dalatfarm@bicap.com'
  AND NOT EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.user_id = u.user_id
        AND ur.role_id = r.role_id
  );

UPDATE farms f
JOIN users guest_user ON guest_user.user_id = f.owner_user_id
JOIN users farm_user ON farm_user.email = 'dalatfarm@bicap.com'
SET f.owner_user_id = farm_user.user_id
WHERE f.farm_name LIKE '%L?t%'
  AND guest_user.email = 'guest@bicap.com';
