-- Seed demo data for BICAP (password for all: 123456)
-- BCrypt of '123456'

-- Create demo users (UPDATE existing or INSERT new)
('Nguyễn Văn Admin', 'admin@bicap.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0900000001', 'ACTIVE'),
('Trần Thị Nông', 'farm@bicap.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0900000002', 'ACTIVE'),
('Lê Văn Bán', 'retailer@bicap.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0900000003', 'ACTIVE'),
('Phạm Quản Lý', 'manager@bicap.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0900000004', 'ACTIVE'),
('Đặng Tài Xế', 'driver@bicap.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0900000005', 'ACTIVE'),
('Ngô Khách', 'guest@bicap.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0900000006', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Assign roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id FROM users u, roles r WHERE u.email = 'admin@bicap.com' AND r.role_name = 'ADMIN'
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id FROM users u, roles r WHERE u.email = 'farm@bicap.com' AND r.role_name = 'FARM'
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id FROM users u, roles r WHERE u.email = 'retailer@bicap.com' AND r.role_name = 'RETAILER'
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id FROM users u, roles r WHERE u.email = 'manager@bicap.com' AND r.role_name = 'SHIPPING_MANAGER'
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id FROM users u, roles r WHERE u.email = 'driver@bicap.com' AND r.role_name = 'DRIVER'
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id FROM users u, roles r WHERE u.email = 'guest@bicap.com' AND r.role_name = 'GUEST'
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);

-- Create farms
INSERT INTO farms (owner_user_id, farm_code, farm_name, business_license_no, certification_status, approval_status, address, province, description, reviewed_by_user_id, reviewed_at)
SELECT 3, 'FARM001', 'Nông Trại Xanh Việt', 'BL-001-2024', 'VALID', 'APPROVED', 'Ấp 5, xã Xuân Thới, huyện Hóc Môn', 'Hồ Chí Minh', 'Nông trại hữu cơ chuyên trồng rau mầm và rau thủy canh', 2, NOW()
ON DUPLICATE KEY UPDATE farm_name=VALUES(farm_name);

INSERT INTO farms (owner_user_id, farm_code, farm_name, business_license_no, certification_status, approval_status, address, province, description, reviewed_by_user_id, reviewed_at)
SELECT 2, 'FARM002', 'Trang Trại Đà Lạt', 'BL-002-2024', 'VALID', 'APPROVED', 'Km15, Quốc lộ 27, TP Đà Lạt', 'Lâm Đồng', 'Trang trại trồng rau và hoa tại Đà Lạt', 2, NOW()
ON DUPLICATE KEY UPDATE farm_name=VALUES(farm_name);

-- Create retailers
INSERT INTO retailers (user_id, retailer_code, retailer_name, business_license_no, address, status)
SELECT 4, 'RTL001', 'Siêu Thị Nông Sản Sạch', 'GPKD-001-CT', '123 Nguyễn Trãi, Q1, TP.HCM', 'ACTIVE'
ON DUPLICATE KEY UPDATE retailer_name=VALUES(retailer_name);

INSERT INTO retailers (user_id, retailer_code, retailer_name, business_license_no, address, status)
SELECT 7, 'RTL002', 'Cửa Hàng Organic Market', 'GPKD-002-HN', '45 Lê Duẩn, Q.Hoàn Kiếm, Hà Nội', 'ACTIVE'
ON DUPLICATE KEY UPDATE retailer_name=VALUES(retailer_name);

-- Create drivers (manager_user_id = user_id 4 = shipping manager)
INSERT INTO drivers (user_id, manager_user_id, driver_code, license_no, status)
SELECT 6, 5, 'DRV001', 'HCM-123456789', 'ACTIVE'
ON DUPLICATE KEY UPDATE driver_code=VALUES(driver_code);

INSERT INTO drivers (user_id, manager_user_id, driver_code, license_no, status)
SELECT 7, 5, 'DRV002', 'HCM-987654321', 'ACTIVE'
ON DUPLICATE KEY UPDATE driver_code=VALUES(driver_code);

-- Create vehicles
INSERT INTO vehicles (manager_user_id, plate_no, vehicle_type, capacity, status)
VALUES (5, '51A-12345', 'TRUCK', 2000.00, 'ACTIVE'),
(5, '51B-67890', 'VAN', 500.00, 'ACTIVE'),
(5, '52C-11111', 'TRUCK', 3500.00, 'ACTIVE')
ON DUPLICATE KEY UPDATE vehicle_type=VALUES(vehicle_type);

-- Create products
INSERT INTO products (product_code, product_name) VALUES
('CAFE_ARABICA', 'Cà Phê Arabica'),
('CAFE_ROBUSTA', 'Cà Phê Robusta'),
('RAU_CAY', 'Rau Cải'),
('CA_CHUA', 'Cà Chua'),
('OI_QUA', 'Dưa Leo'),
('BAP_RAU', 'Bắp Non'),
('NAM_RONG', 'Nấm Rơm'),
('TRAI_CAY', 'Trái Cây Tươi')
ON DUPLICATE KEY UPDATE product_name=VALUES(product_name);

-- Create categories
INSERT INTO categories (category_code, category_name, category_type) VALUES
('CAFE', 'Cà Phê', 'PRODUCT'),
('RAU', 'Rau Xanh', 'PRODUCT'),
('TRAI_CAY', 'Trái Cây', 'PRODUCT'),
('NAM', 'Nấm', 'PRODUCT')
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);

-- Create farming seasons (farm_id 2=FARM001, 3=FARM002)
INSERT INTO farming_seasons (farm_id, season_code, product_id, start_date, expected_harvest_date, farming_method, season_status)
VALUES
(2, 'SEASON001', 1, '2024-01-15', '2024-05-15', 'Hữu cơ', 'HARVESTED'),
(2, 'SEASON002', 2, '2024-06-01', '2024-10-01', 'Hữu cơ', 'GROWING'),
(2, 'SEASON003', 3, '2024-09-01', '2025-01-01', 'Thủy canh', 'PLANNED'),
(3, 'SEASON004', 4, '2024-02-01', '2024-06-01', 'Hữu cơ', 'HARVESTED'),
(3, 'SEASON005', 5, '2024-07-01', '2024-11-01', 'Hữu cơ', 'GROWING')
ON DUPLICATE KEY UPDATE farming_method=VALUES(farming_method);

-- Create product batches (season_id: 3=SEASON001, 4=SEASON004)
INSERT INTO product_batches (season_id, product_id, batch_code, harvest_date, quantity, available_quantity, quality_grade, batch_status)
VALUES
(6, 1, 'BATCH001', '2024-05-15', 500.00, 300.00, 'A', 'HARVESTED'),
(6, 1, 'BATCH002', '2024-05-20', 200.00, 150.00, 'B', 'PACKAGED'),
(9, 4, 'BATCH003', '2024-06-01', 800.00, 500.00, 'A', 'HARVESTED'),
(9, 4, 'BATCH004', '2024-06-10', 400.00, 400.00, 'A', 'AVAILABLE')
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

-- Create QR codes for batches (batch_id: 5=BATCH001, 6=BATCH002, 7=BATCH003, 8=BATCH004)
INSERT INTO qr_codes (batch_id, qr_value, qr_url, status)
VALUES
(5, 'BICAP-BATCH-001-ABC123', '/trace/BATCH001', 'ACTIVE'),
(6, 'BICAP-BATCH-002-DEF456', '/trace/BATCH002', 'ACTIVE'),
(7, 'BICAP-BATCH-003-GHI789', '/trace/BATCH003', 'ACTIVE'),
(8, 'BICAP-BATCH-004-JKL012', '/trace/BATCH004', 'ACTIVE')
ON DUPLICATE KEY UPDATE qr_value=VALUES(qr_value);

-- Create product listings (batch_id: 5,6,7,8; farm_id: 2,3; category_id: 1,2)
INSERT INTO product_listings (batch_id, farm_id, category_id, listing_code, title, description, price, available_quantity, certification, traceability_status, approval_status, listing_status)
VALUES
(5, 2, 1, 'LIST001', 'Cà Phê Arabica Hữu Cơ Đà Lạt 500g', 'Cà phê Arabica hữu cơ, thu hoạch tại Đà Lạt, rang vừa, đóng gói chân không', 185000.00, 50.00, 'Organic', 'TRACEABLE', 'APPROVED', 'ACTIVE'),
(6, 2, 1, 'LIST002', 'Cà Phê Robusta Hạt 1kg', 'Cà phê Robusta chất lượng cao, phù hợp pha máy', 120000.00, 30.00, 'Fair Trade', 'TRACEABLE', 'APPROVED', 'ACTIVE'),
(7, 3, 2, 'LIST003', 'Cà Chua Hữu Cơ VietGAP 1kg', 'Cà chua hữu cơ đạt chuẩn VietGAP, trồng tại Đà Lạt', 45000.00, 100.00, 'VietGAP', 'TRACEABLE', 'APPROVED', 'ACTIVE'),
(8, 3, 2, 'LIST004', 'Dưa Leo Hữu Cơ Giòn Ngọt 500g', 'Dưa leo hữu cơ, không thuốc trừ sâu, đóng gói 500g', 35000.00, 80.00, 'Organic', 'TRACEABLE', 'APPROVED', 'ACTIVE'),
(5, 2, 2, 'LIST005', 'Rau Cải Xanh Thủy Canh 300g', 'Rau cải xanh trồng thủy canh sạch, giao trong ngày', 25000.00, 60.00, 'VietGAP', 'TRACEABLE', 'PENDING', 'ACTIVE')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Create orders (retailer_id: 1,6; farm_id: 2,3)
INSERT INTO orders (retailer_id, farm_id, total_amount, status, payment_status, deposit_amount, deposit_paid_at)
VALUES
(1, 2, 925000.00, 'READY_FOR_SHIPMENT', 'DEPOSIT_PAID', 185000.00, NOW()),
(1, 3, 540000.00, 'SHIPPING', 'DEPOSIT_PAID', 108000.00, NOW()),
(1, 2, 360000.00, 'DELIVERED', 'PAID', 72000.00, NOW()),
(6, 2, 740000.00, 'CONFIRMED', 'DEPOSIT_PAID', 148000.00, NOW()),
(6, 3, 280000.00, 'CANCELLED', 'REFUNDED', 56000.00, NOW())
ON DUPLICATE KEY UPDATE total_amount=VALUES(total_amount);

-- Create order items
INSERT INTO order_items (order_id, listing_id, quantity, price)
VALUES
(1, 1, 5.00, 185000.00),
(2, 3, 12.00, 45000.00),
(3, 2, 3.00, 120000.00),
(4, 1, 4.00, 185000.00),
(5, 4, 8.00, 35000.00)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

-- Create order status history
INSERT INTO order_status_history (order_id, previous_status, new_status, reason, changed_at)
VALUES
(1, 'PENDING', 'CONFIRMED', 'Farm xác nhận đơn hàng', NOW()),
(1, 'CONFIRMED', 'READY_FOR_SHIPMENT', 'Retailer đã thanh toán đặt cọc', NOW()),
(2, 'PENDING', 'CONFIRMED', 'Farm xác nhận', NOW()),
(2, 'CONFIRMED', 'SHIPPING', 'Shipping manager tạo shipment', NOW()),
(3, 'PENDING', 'CONFIRMED', 'Farm xác nhận', NOW()),
(3, 'CONFIRMED', 'SHIPPING', 'Shipping manager tạo shipment', NOW()),
(3, 'SHIPPING', 'DELIVERED', 'Retailer xác nhận nhận hàng', NOW()),
(4, 'PENDING', 'CONFIRMED', 'Farm xác nhận', NOW()),
(5, 'PENDING', 'CONFIRMED', 'Farm xác nhận', NOW()),
(5, 'CONFIRMED', 'CANCELLED', 'Retailer hủy đơn', NOW())
ON DUPLICATE KEY UPDATE new_status=VALUES(new_status);

-- Create service packages
INSERT INTO service_packages (package_code, package_name, price, duration_days, max_seasons, max_listings, description, status)
VALUES
('PKG_STARTER', 'Gói Khởi Động', 1500000.00, 30, 1, 3, 'Dành cho farm mới, tạo 1 mùa vụ và 3 listing', 'ACTIVE'),
('PKG_BASIC', 'Gói Cơ Bản', 5000000.00, 90, 3, 10, 'Gói cơ bản, tạo 3 mùa vụ và 10 listing', 'ACTIVE'),
('PKG_PRO', 'Gói Chuyên Nghiệp', 12000000.00, 180, 10, 50, 'Gói chuyên nghiệp, tạo 10 mùa vụ và 50 listing, hỗ trợ IoT', 'ACTIVE'),
('PKG_ENTERPRISE', 'Gói Doanh Nghiệp', 25000000.00, 365, 50, 200, 'Gói doanh nghiệp, không giới hạn, ưu tiên hỗ trợ', 'ACTIVE')
ON DUPLICATE KEY UPDATE price=VALUES(price);

-- Create farm subscriptions
INSERT INTO farm_subscriptions (farm_id, package_id, subscribed_by_user_id, start_date, end_date, subscription_status)
VALUES
(2, 2, 2, '2024-01-01', '2024-04-01', 'ACTIVE'),
(3, 3, 2, '2024-03-01', '2024-08-29', 'ACTIVE')
ON DUPLICATE KEY UPDATE subscription_status=VALUES(subscription_status);

SELECT 'All demo data seeded successfully!' as result;