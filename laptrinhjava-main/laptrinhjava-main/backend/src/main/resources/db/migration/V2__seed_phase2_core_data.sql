INSERT INTO roles(role_name, description) VALUES
('ADMIN', 'Quản trị hệ thống'),
('FARM', 'Nông trại'),
('RETAILER', 'Nhà bán lẻ'),
('SHIPPING_MANAGER', 'Quản lý vận chuyển'),
('DRIVER', 'Tài xế'),
('GUEST', 'Khách');

-- password: 123456
INSERT INTO users(full_name, email, password_hash, phone, avatar_url, status) VALUES
('System Admin', 'admin@bicap.com', '$2a$10$0Yv0HnYv0x4LSpadZ7kP5edYl4zDq2Yq7fHn1rM0W6gQJ4i0Lz6Ae', '0900000001', NULL, 'ACTIVE'),
('Farm Owner', 'farm@bicap.com', '$2a$10$0Yv0HnYv0x4LSpadZ7kP5edYl4zDq2Yq7fHn1rM0W6gQJ4i0Lz6Ae', '0900000002', NULL, 'ACTIVE'),
('Retailer User', 'retailer@bicap.com', '$2a$10$0Yv0HnYv0x4LSpadZ7kP5edYl4zDq2Yq7fHn1rM0W6gQJ4i0Lz6Ae', '0900000003', NULL, 'ACTIVE'),
('Shipping Manager', 'manager@bicap.com', '$2a$10$0Yv0HnYv0x4LSpadZ7kP5edYl4zDq2Yq7fHn1rM0W6gQJ4i0Lz6Ae', '0900000004', NULL, 'ACTIVE'),
('Driver User', 'driver@bicap.com', '$2a$10$0Yv0HnYv0x4LSpadZ7kP5edYl4zDq2Yq7fHn1rM0W6gQJ4i0Lz6Ae', '0900000005', NULL, 'ACTIVE');

INSERT INTO user_roles(user_id, role_id)
SELECT 1, role_id FROM roles WHERE role_name = 'ADMIN';
INSERT INTO user_roles(user_id, role_id)
SELECT 2, role_id FROM roles WHERE role_name = 'FARM';
INSERT INTO user_roles(user_id, role_id)
SELECT 3, role_id FROM roles WHERE role_name = 'RETAILER';
INSERT INTO user_roles(user_id, role_id)
SELECT 4, role_id FROM roles WHERE role_name = 'SHIPPING_MANAGER';
INSERT INTO user_roles(user_id, role_id)
SELECT 5, role_id FROM roles WHERE role_name = 'DRIVER';

INSERT INTO farms(
    owner_user_id, farm_code, farm_name, business_license_no,
    certification_status, approval_status, address, province, description,
    reviewed_by_user_id, reviewed_at
) VALUES (
    2, 'FARM001', 'Nông trại xanh', 'BLN001',
    'VALID', 'APPROVED', 'Đồng Nai', 'Đồng Nai', 'Farm mẫu',
    1, NOW()
);

INSERT INTO retailers(user_id, retailer_code, retailer_name, business_license_no, address, status)
VALUES (3, 'RTL001', 'Retailer mẫu', 'RTL-BLN-001', 'Cần Thơ', 'ACTIVE');

INSERT INTO drivers(user_id, manager_user_id, driver_code, license_no, status)
VALUES (5, 4, 'DRV001', 'LIC001', 'ACTIVE');

INSERT INTO vehicles(manager_user_id, plate_no, vehicle_type, capacity, status)
VALUES (4, '51A-12345', 'TRUCK', 1500.00, 'ACTIVE');

INSERT INTO service_packages(package_code, package_name, price, duration_days, max_seasons, max_listings, description, status)
VALUES
('PKG_BASIC', 'Gói Basic', 1000000, 30, 1, 3, 'Gói cơ bản', 'ACTIVE'),
('PKG_PRO', 'Gói Pro', 5000000, 180, 10, 50, 'Gói nâng cao', 'ACTIVE');

INSERT INTO farm_subscriptions(farm_id, package_id, subscribed_by_user_id, start_date, end_date, subscription_status)
VALUES (1, 1, 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'ACTIVE');

INSERT INTO subscription_payments(subscription_id, payer_user_id, amount, method, payment_status, transaction_ref, paid_at)
VALUES (1, 2, 1000000, 'BANKING', 'PAID', 'SUBPAY001', NOW());