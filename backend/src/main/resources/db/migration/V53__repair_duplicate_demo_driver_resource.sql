-- Repair demo drift: two Driver users with the same display name existed, but only one
-- was linked to a Driver resource. The mobile app resolves shipments by current user_id.

UPDATE drivers d
JOIN users old_user ON old_user.user_id = d.user_id
JOIN users login_user ON login_user.email = 'nhockhang266@gmail.com'
LEFT JOIN drivers existing ON existing.user_id = login_user.user_id
SET d.user_id = login_user.user_id
WHERE d.driver_code = 'DR003'
  AND old_user.email = 'nhockhang267@gmail.com'
  AND existing.driver_id IS NULL;
