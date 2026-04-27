UPDATE users
SET password_hash = '$2a$10$M5020VHcYCqJLnrpHE8b1OCiZeftcADGgGFw4stMsY.NlUFEtzKDq'
WHERE email IN (
    'admin@bicap.com',
    'farm@bicap.com',
    'retailer@bicap.com',
    'manager@bicap.com',
    'driver@bicap.com',
    'guest@bicap.com'
);
