-- BICAP local demo reset seed
-- Local/dev only. Demo password for all accounts: 123456

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM shipment_reports;
DELETE FROM shipment_logs;
DELETE FROM shipments;
DELETE FROM farm_retailer_contracts;
DELETE FROM order_status_history;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM listing_registration_requests;
DELETE FROM qr_codes;
DELETE FROM product_listings;
DELETE FROM product_batches;
DELETE FROM blockchain_transactions;
DELETE FROM farming_processes;
DELETE FROM iot_alerts;
DELETE FROM iot_readings;
DELETE FROM sensor_readings;
DELETE FROM threshold_rules;
DELETE FROM farming_seasons;
DELETE FROM subscription_payments;
DELETE FROM farm_subscriptions;
DELETE FROM service_packages;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM vehicles;
DELETE FROM drivers;
DELETE FROM retailers;
DELETE FROM farms;
DELETE FROM platform_reports;
DELETE FROM notifications;
DELETE FROM educational_contents;
DELETE FROM user_roles;
DELETE FROM users;
DELETE FROM roles;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO roles(role_name, description) VALUES
('ADMIN', 'Quản trị hệ thống'),
('FARM', 'Nông trại'),
('RETAILER', 'Nhà bán lẻ'),
('SHIPPING_MANAGER', 'Quản lý vận chuyển'),
('DRIVER', 'Tài xế'),
('GUEST', 'Khách tham quan');

SET @pwd := '$2a$10$0Yv0HnYv0x4LSpadZ7kP5edYl4zDq2Yq7fHn1rM0W6gQJ4i0Lz6Ae';

INSERT INTO users(user_id, full_name, email, password_hash, phone, avatar_url, status) VALUES
(1, 'Nguyễn Minh Quân', 'admin01@bicap.demo', @pwd, '0901000001', NULL, 'ACTIVE'),
(2, 'Trần Khánh Linh', 'admin02@bicap.demo', @pwd, '0901000002', NULL, 'ACTIVE'),
(3, 'Lê Hoàng Nam', 'admin03@bicap.demo', @pwd, '0901000003', NULL, 'ACTIVE'),
(4, 'Phạm Thu An', 'admin04@bicap.demo', @pwd, '0901000004', NULL, 'ACTIVE'),
(11, 'Võ Thanh Sơn', 'farm01@bicap.demo', @pwd, '0902000001', NULL, 'ACTIVE'),
(12, 'Đặng Ngọc Mai', 'farm02@bicap.demo', @pwd, '0902000002', NULL, 'ACTIVE'),
(13, 'Huỳnh Quốc Bảo', 'farm03@bicap.demo', @pwd, '0902000003', NULL, 'ACTIVE'),
(14, 'Bùi Thảo Vy', 'farm04@bicap.demo', @pwd, '0902000004', NULL, 'ACTIVE'),
(21, 'Công ty An Phú Foods', 'retailer01@bicap.demo', @pwd, '0903000001', NULL, 'ACTIVE'),
(22, 'Chuỗi FreshMart Việt', 'retailer02@bicap.demo', @pwd, '0903000002', NULL, 'ACTIVE'),
(23, 'Nhà phân phối Mekong Xanh', 'retailer03@bicap.demo', @pwd, '0903000003', NULL, 'ACTIVE'),
(24, 'Cửa hàng Organic Home', 'retailer04@bicap.demo', @pwd, '0903000004', NULL, 'ACTIVE'),
(31, 'Phạm Đức Huy', 'shipper01@bicap.demo', @pwd, '0904000001', NULL, 'ACTIVE'),
(32, 'Lê Gia Bảo', 'shipper02@bicap.demo', @pwd, '0904000002', NULL, 'ACTIVE'),
(33, 'Nguyễn Tuấn Kiệt', 'shipper03@bicap.demo', @pwd, '0904000003', NULL, 'ACTIVE'),
(34, 'Trần Anh Thư', 'shipper04@bicap.demo', @pwd, '0904000004', NULL, 'ACTIVE'),
(41, 'Tài xế Lâm Đồng 01', 'driver01@bicap.demo', @pwd, '0905000001', NULL, 'ACTIVE'),
(42, 'Tài xế Tây Nguyên 02', 'driver02@bicap.demo', @pwd, '0905000002', NULL, 'ACTIVE'),
(43, 'Tài xế Miền Tây 03', 'driver03@bicap.demo', @pwd, '0905000003', NULL, 'ACTIVE'),
(44, 'Tài xế Miền Bắc 04', 'driver04@bicap.demo', @pwd, '0905000004', NULL, 'ACTIVE'),
(51, 'Khách tham quan 01', 'guest01@bicap.demo', @pwd, '0906000001', NULL, 'ACTIVE'),
(52, 'Khách tham quan 02', 'guest02@bicap.demo', @pwd, '0906000002', NULL, 'ACTIVE'),
(53, 'Khách tham quan 03', 'guest03@bicap.demo', @pwd, '0906000003', NULL, 'ACTIVE'),
(54, 'Khách tham quan 04', 'guest04@bicap.demo', @pwd, '0906000004', NULL, 'ACTIVE');

INSERT INTO user_roles(user_id, role_id)
SELECT user_id, role_id FROM users JOIN roles ON
(user_id BETWEEN 1 AND 4 AND role_name = 'ADMIN') OR
(user_id BETWEEN 11 AND 14 AND role_name = 'FARM') OR
(user_id BETWEEN 21 AND 24 AND role_name = 'RETAILER') OR
(user_id BETWEEN 31 AND 34 AND role_name = 'SHIPPING_MANAGER') OR
(user_id BETWEEN 41 AND 44 AND role_name = 'DRIVER') OR
(user_id BETWEEN 51 AND 54 AND role_name = 'GUEST');

INSERT INTO farms(farm_id, owner_user_id, farm_code, farm_name, business_license_no, certification_status, approval_status, address, province, description, reviewed_by_user_id, reviewed_at, farm_type, total_area, contact_person, phone, email, logo_url) VALUES
(1, 11, 'FARM-DL-001', 'Hợp tác xã Rau sạch Đà Lạt', 'FARM-BLN-001', 'VIETGAP', 'APPROVED', 'Phường 8, Đà Lạt', 'Lâm Đồng', 'Vùng trồng rau củ ôn đới có truy xuất theo lô.', 1, NOW(), 'COOPERATIVE', 18.5, 'Võ Thanh Sơn', '0902000001', 'farm01@bicap.demo', NULL),
(2, 12, 'FARM-BMT-002', 'Trang trại Cà phê Buôn Ma Thuột', 'FARM-BLN-002', 'GLOBALGAP', 'APPROVED', 'Ea Tu, Buôn Ma Thuột', 'Đắk Lắk', 'Cà phê đặc sản và nông sản khô Tây Nguyên.', 1, NOW(), 'ENTERPRISE', 42.0, 'Đặng Ngọc Mai', '0902000002', 'farm02@bicap.demo', NULL),
(3, 13, 'FARM-BT-003', 'Vườn trái cây Chợ Lách', 'FARM-BLN-003', 'VALID', 'APPROVED', 'Chợ Lách', 'Bến Tre', 'Trái cây đặc sản miền Tây theo mùa vụ.', 1, NOW(), 'FAMILY_FARM', 12.8, 'Huỳnh Quốc Bảo', '0902000003', 'farm03@bicap.demo', NULL),
(4, 14, 'FARM-SP-004', 'Nông trại hữu cơ Sa Pa', 'FARM-BLN-004', 'ORGANIC', 'APPROVED', 'Tả Van, Sa Pa', 'Lào Cai', 'Rau quả hữu cơ vùng cao, canh tác bền vững.', 1, NOW(), 'ORGANIC_FARM', 9.6, 'Bùi Thảo Vy', '0902000004', 'farm04@bicap.demo', NULL);

INSERT INTO retailers(retailer_id, user_id, retailer_code, retailer_name, business_license_no, address, status) VALUES
(1, 21, 'RTL-AP-001', 'An Phú Foods', 'RTL-BLN-001', 'Quận 7, TP. Hồ Chí Minh', 'ACTIVE'),
(2, 22, 'RTL-FM-002', 'FreshMart Việt', 'RTL-BLN-002', 'Cầu Giấy, Hà Nội', 'ACTIVE'),
(3, 23, 'RTL-MX-003', 'Mekong Xanh Distribution', 'RTL-BLN-003', 'Ninh Kiều, Cần Thơ', 'ACTIVE'),
(4, 24, 'RTL-OH-004', 'Organic Home', 'RTL-BLN-004', 'Hải Châu, Đà Nẵng', 'ACTIVE');

INSERT INTO drivers(driver_id, user_id, manager_user_id, driver_code, license_no, status) VALUES
(1, 41, 31, 'DRV-LD-001', 'GPLX-DEMO-001', 'ACTIVE'),
(2, 42, 32, 'DRV-TN-002', 'GPLX-DEMO-002', 'ACTIVE'),
(3, 43, 33, 'DRV-MT-003', 'GPLX-DEMO-003', 'ACTIVE'),
(4, 44, 34, 'DRV-MB-004', 'GPLX-DEMO-004', 'ACTIVE');

INSERT INTO vehicles(vehicle_id, manager_user_id, plate_no, vehicle_type, capacity, status) VALUES
(1, 31, '49C-123.45', 'REFRIGERATED_TRUCK', 2500.00, 'ACTIVE'),
(2, 32, '47C-456.78', 'TRUCK', 3500.00, 'ACTIVE'),
(3, 33, '65C-789.12', 'VAN', 1200.00, 'ACTIVE'),
(4, 34, '24C-246.80', 'REFRIGERATED_VAN', 900.00, 'ACTIVE');

INSERT INTO service_packages(package_id, package_code, package_name, price, duration_days, max_seasons, max_listings, description, status) VALUES
(1, 'PKG_DEMO_STANDARD', 'Gói Demo Tiêu Chuẩn', 0, 365, 20, 80, 'Gói local demo cho nông trại.', 'ACTIVE'),
(2, 'PKG_DEMO_PRO', 'Gói Demo Chuyên Nghiệp', 0, 365, 50, 200, 'Gói local demo đầy đủ marketplace và QR.', 'ACTIVE');

INSERT INTO farm_subscriptions(subscription_id, farm_id, package_id, subscribed_by_user_id, start_date, end_date, subscription_status) VALUES
(1, 1, 2, 11, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'ACTIVE'),
(2, 2, 2, 12, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'ACTIVE'),
(3, 3, 1, 13, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'ACTIVE'),
(4, 4, 1, 14, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'ACTIVE');

INSERT INTO subscription_payments(subscription_id, payer_user_id, amount, method, payment_status, transaction_ref, paid_at) VALUES
(1, 11, 0, 'DEMO', 'PAID', 'DEMO-SUB-001', NOW()),
(2, 12, 0, 'DEMO', 'PAID', 'DEMO-SUB-002', NOW()),
(3, 13, 0, 'DEMO', 'PAID', 'DEMO-SUB-003', NOW()),
(4, 14, 0, 'DEMO', 'PAID', 'DEMO-SUB-004', NOW());

INSERT INTO categories(category_id, category_name, slug, image_url, sort_order, status) VALUES
(1, 'Rau củ quả tươi', 'rau-cu-qua-tuoi', NULL, 1, 'ACTIVE'),
(2, 'Trái cây đặc sản', 'trai-cay-dac-san', NULL, 2, 'ACTIVE'),
(3, 'Cà phê và nông sản khô', 'ca-phe-nong-san-kho', NULL, 3, 'ACTIVE'),
(4, 'Gạo và ngũ cốc', 'gao-ngu-coc', NULL, 4, 'ACTIVE');

INSERT INTO products(product_id, product_code, product_name, description, price, image_url, sort_order, status, category_id) VALUES
(1, 'PROD-CARROT-DL', 'Cà rốt Đà Lạt loại 1', 'Cà rốt tươi thu hoạch trong ngày, đóng gói theo batch.', 18000, NULL, 1, 'ACTIVE', 1),
(2, 'PROD-LETTUCE-DL', 'Xà lách thủy canh Đà Lạt', 'Xà lách xanh canh tác kiểm soát nhiệt độ.', 32000, NULL, 2, 'ACTIVE', 1),
(3, 'PROD-COFFEE-BMT', 'Cà phê Arabica Buôn Ma Thuột', 'Cà phê nhân xanh truy xuất nguồn gốc.', 125000, NULL, 3, 'ACTIVE', 3),
(4, 'PROD-PEPPER-DL', 'Hạt tiêu sạch Tây Nguyên', 'Hạt tiêu phơi sấy đạt chuẩn an toàn.', 98000, NULL, 4, 'ACTIVE', 3),
(5, 'PROD-POMELO-BT', 'Bưởi da xanh Bến Tre', 'Trái cây đặc sản đóng thùng theo tiêu chuẩn bán lẻ.', 46000, NULL, 5, 'ACTIVE', 2),
(6, 'PROD-RAMBUTAN-BT', 'Chôm chôm Chợ Lách', 'Chôm chôm tươi theo mùa vụ miền Tây.', 38000, NULL, 6, 'ACTIVE', 2),
(7, 'PROD-RICE-ST25', 'Gạo thơm ST25', 'Gạo thơm đóng bao, phù hợp chuỗi bán lẻ.', 29000, NULL, 7, 'ACTIVE', 4),
(8, 'PROD-CABBAGE-SP', 'Bắp cải hữu cơ Sa Pa', 'Rau hữu cơ vùng cao, kiểm soát nhật ký canh tác.', 24000, NULL, 8, 'ACTIVE', 1),
(9, 'PROD-TOMATO-DL', 'Cà chua beef Đà Lạt', 'Cà chua canh tác nhà màng, đóng khay bán lẻ.', 36000, NULL, 9, 'ACTIVE', 1),
(10, 'PROD-POTATO-DL', 'Khoai tây vàng Đà Lạt', 'Khoai tây size đồng đều cho siêu thị và bếp trung tâm.', 22000, NULL, 10, 'ACTIVE', 1),
(11, 'PROD-AVOCADO-DL', 'Bơ sáp Lâm Đồng', 'Bơ sáp thu hoạch chọn lọc, phù hợp đơn hàng trái cây sạch.', 54000, NULL, 11, 'ACTIVE', 2),
(12, 'PROD-MANGO-BT', 'Xoài cát miền Tây', 'Xoài cát đóng thùng, truy xuất theo vùng trồng.', 42000, NULL, 12, 'ACTIVE', 2),
(13, 'PROD-CASHEW-TN', 'Hạt điều rang Tây Nguyên', 'Hạt điều rang mộc đóng túi, nguồn gốc rõ ràng.', 168000, NULL, 13, 'ACTIVE', 3),
(14, 'PROD-TEA-SP', 'Trà Shan tuyết Sa Pa', 'Trà vùng cao sơ chế thủ công, phù hợp quà tặng đặc sản.', 210000, NULL, 14, 'ACTIVE', 3),
(15, 'PROD-BROWN-RICE', 'Gạo lứt hữu cơ', 'Gạo lứt đóng bao nhỏ cho cửa hàng thực phẩm sạch.', 39000, NULL, 15, 'ACTIVE', 4),
(16, 'PROD-CORN-LC', 'Bắp nếp Lào Cai', 'Bắp nếp vùng cao, thu hoạch theo ngày.', 26000, NULL, 16, 'ACTIVE', 4);

INSERT INTO farming_seasons(season_id, farm_id, season_code, start_date, expected_harvest_date, actual_harvest_date, farming_method, season_status, product_id) VALUES
(1, 1, 'SEASON-DL-RAU-2026A', DATE_SUB(CURDATE(), INTERVAL 80 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), CURDATE(), 'VietGAP - tưới nhỏ giọt', 'HARVESTED', 1),
(2, 1, 'SEASON-DL-XALACH-2026A', DATE_SUB(CURDATE(), INTERVAL 45 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), CURDATE(), 'Thủy canh tuần hoàn', 'HARVESTED', 2),
(3, 2, 'SEASON-BMT-COFFEE-2026', DATE_SUB(CURDATE(), INTERVAL 160 DAY), DATE_ADD(CURDATE(), INTERVAL 25 DAY), CURDATE(), 'GlobalGAP - sơ chế ướt', 'HARVESTED', 3),
(4, 2, 'SEASON-BMT-PEPPER-2026', DATE_SUB(CURDATE(), INTERVAL 140 DAY), DATE_ADD(CURDATE(), INTERVAL 20 DAY), CURDATE(), 'Canh tác bền vững', 'HARVESTED', 4),
(5, 3, 'SEASON-BT-POMELO-2026', DATE_SUB(CURDATE(), INTERVAL 120 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), CURDATE(), 'Quản lý dịch hại tổng hợp', 'HARVESTED', 5),
(6, 3, 'SEASON-BT-RAMBUTAN-2026', DATE_SUB(CURDATE(), INTERVAL 100 DAY), DATE_ADD(CURDATE(), INTERVAL 8 DAY), CURDATE(), 'Canh tác theo vùng trồng', 'HARVESTED', 6),
(7, 4, 'SEASON-SP-CABBAGE-2026', DATE_SUB(CURDATE(), INTERVAL 90 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), CURDATE(), 'Hữu cơ vùng cao', 'HARVESTED', 8),
(8, 4, 'SEASON-SP-GRAIN-2026', DATE_SUB(CURDATE(), INTERVAL 130 DAY), DATE_ADD(CURDATE(), INTERVAL 18 DAY), CURDATE(), 'Canh tác an toàn', 'HARVESTED', 7),
(9, 1, 'SEASON-DL-TOMATO-2026B', DATE_SUB(CURDATE(), INTERVAL 70 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), CURDATE(), 'Nhà màng VietGAP', 'HARVESTED', 9),
(10, 1, 'SEASON-DL-POTATO-2026B', DATE_SUB(CURDATE(), INTERVAL 95 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), CURDATE(), 'Luân canh đất cao nguyên', 'HARVESTED', 10),
(11, 3, 'SEASON-BT-AVOCADO-2026', DATE_SUB(CURDATE(), INTERVAL 115 DAY), DATE_ADD(CURDATE(), INTERVAL 16 DAY), CURDATE(), 'Chọn lọc trái theo độ chín', 'HARVESTED', 11),
(12, 3, 'SEASON-BT-MANGO-2026', DATE_SUB(CURDATE(), INTERVAL 105 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), CURDATE(), 'Canh tác vùng trồng miền Tây', 'HARVESTED', 12),
(13, 2, 'SEASON-TN-CASHEW-2026', DATE_SUB(CURDATE(), INTERVAL 155 DAY), DATE_ADD(CURDATE(), INTERVAL 22 DAY), CURDATE(), 'Sấy rang kiểm soát nhiệt độ', 'HARVESTED', 13),
(14, 4, 'SEASON-SP-TEA-2026', DATE_SUB(CURDATE(), INTERVAL 150 DAY), DATE_ADD(CURDATE(), INTERVAL 21 DAY), CURDATE(), 'Thu hái thủ công vùng cao', 'HARVESTED', 14),
(15, 4, 'SEASON-SP-BROWN-RICE-2026', DATE_SUB(CURDATE(), INTERVAL 135 DAY), DATE_ADD(CURDATE(), INTERVAL 19 DAY), CURDATE(), 'Canh tác hữu cơ an toàn', 'HARVESTED', 15),
(16, 4, 'SEASON-LC-CORN-2026', DATE_SUB(CURDATE(), INTERVAL 82 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), CURDATE(), 'Bắp nếp vùng cao', 'HARVESTED', 16);

INSERT INTO product_batches(batch_id, season_id, product_id, batch_code, harvest_date, quantity, available_quantity, quality_grade, expiry_date, batch_status) VALUES
(1, 1, 1, 'BATCH-DL-CARROT-001', CURDATE(), 2500, 2200, 'A', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'APPROVED'),
(2, 2, 2, 'BATCH-DL-LETTUCE-002', CURDATE(), 900, 760, 'A', DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'APPROVED'),
(3, 3, 3, 'BATCH-BMT-COFFEE-003', CURDATE(), 5200, 4800, 'SPECIALTY', DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'APPROVED'),
(4, 4, 4, 'BATCH-BMT-PEPPER-004', CURDATE(), 1800, 1500, 'A', DATE_ADD(CURDATE(), INTERVAL 300 DAY), 'APPROVED'),
(5, 5, 5, 'BATCH-BT-POMELO-005', CURDATE(), 3200, 2800, 'A', DATE_ADD(CURDATE(), INTERVAL 28 DAY), 'APPROVED'),
(6, 6, 6, 'BATCH-BT-RAMBUTAN-006', CURDATE(), 2100, 1750, 'B+', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'APPROVED'),
(7, 7, 8, 'BATCH-SP-CABBAGE-007', CURDATE(), 1400, 1200, 'ORGANIC', DATE_ADD(CURDATE(), INTERVAL 21 DAY), 'APPROVED'),
(8, 8, 7, 'BATCH-SP-RICE-008', CURDATE(), 4000, 3600, 'A', DATE_ADD(CURDATE(), INTERVAL 240 DAY), 'APPROVED'),
(9, 9, 9, 'BATCH-DL-TOMATO-009', CURDATE(), 1600, 1350, 'A', DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'APPROVED'),
(10, 10, 10, 'BATCH-DL-POTATO-010', CURDATE(), 3000, 2600, 'A', DATE_ADD(CURDATE(), INTERVAL 60 DAY), 'APPROVED'),
(11, 11, 11, 'BATCH-BT-AVOCADO-011', CURDATE(), 1800, 1500, 'A', DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'APPROVED'),
(12, 12, 12, 'BATCH-BT-MANGO-012', CURDATE(), 2200, 1900, 'A', DATE_ADD(CURDATE(), INTERVAL 16 DAY), 'APPROVED'),
(13, 13, 13, 'BATCH-TN-CASHEW-013', CURDATE(), 1400, 1100, 'PREMIUM', DATE_ADD(CURDATE(), INTERVAL 240 DAY), 'APPROVED'),
(14, 14, 14, 'BATCH-SP-TEA-014', CURDATE(), 700, 620, 'SPECIALTY', DATE_ADD(CURDATE(), INTERVAL 300 DAY), 'APPROVED'),
(15, 15, 15, 'BATCH-SP-BROWN-RICE-015', CURDATE(), 2600, 2300, 'ORGANIC', DATE_ADD(CURDATE(), INTERVAL 210 DAY), 'APPROVED'),
(16, 16, 16, 'BATCH-LC-CORN-016', CURDATE(), 1300, 1050, 'A', DATE_ADD(CURDATE(), INTERVAL 9 DAY), 'APPROVED');

INSERT INTO qr_codes(batch_id, qr_value, qr_url, status) VALUES
(1, 'BICAP-TRACE-BATCH-DL-CARROT-001', 'http://localhost:5173/public/trace?batchId=1', 'ACTIVE'),
(2, 'BICAP-TRACE-BATCH-DL-LETTUCE-002', 'http://localhost:5173/public/trace?batchId=2', 'ACTIVE'),
(3, 'BICAP-TRACE-BATCH-BMT-COFFEE-003', 'http://localhost:5173/public/trace?batchId=3', 'ACTIVE'),
(4, 'BICAP-TRACE-BATCH-BMT-PEPPER-004', 'http://localhost:5173/public/trace?batchId=4', 'ACTIVE'),
(5, 'BICAP-TRACE-BATCH-BT-POMELO-005', 'http://localhost:5173/public/trace?batchId=5', 'ACTIVE'),
(6, 'BICAP-TRACE-BATCH-BT-RAMBUTAN-006', 'http://localhost:5173/public/trace?batchId=6', 'ACTIVE'),
(7, 'BICAP-TRACE-BATCH-SP-CABBAGE-007', 'http://localhost:5173/public/trace?batchId=7', 'ACTIVE'),
(8, 'BICAP-TRACE-BATCH-SP-RICE-008', 'http://localhost:5173/public/trace?batchId=8', 'ACTIVE'),
(9, 'BICAP-TRACE-BATCH-DL-TOMATO-009', 'http://localhost:5173/public/trace?batchId=9', 'ACTIVE'),
(10, 'BICAP-TRACE-BATCH-DL-POTATO-010', 'http://localhost:5173/public/trace?batchId=10', 'ACTIVE'),
(11, 'BICAP-TRACE-BATCH-BT-AVOCADO-011', 'http://localhost:5173/public/trace?batchId=11', 'ACTIVE'),
(12, 'BICAP-TRACE-BATCH-BT-MANGO-012', 'http://localhost:5173/public/trace?batchId=12', 'ACTIVE'),
(13, 'BICAP-TRACE-BATCH-TN-CASHEW-013', 'http://localhost:5173/public/trace?batchId=13', 'ACTIVE'),
(14, 'BICAP-TRACE-BATCH-SP-TEA-014', 'http://localhost:5173/public/trace?batchId=14', 'ACTIVE'),
(15, 'BICAP-TRACE-BATCH-SP-BROWN-RICE-015', 'http://localhost:5173/public/trace?batchId=15', 'ACTIVE'),
(16, 'BICAP-TRACE-BATCH-LC-CORN-016', 'http://localhost:5173/public/trace?batchId=16', 'ACTIVE');

INSERT INTO product_listings(listing_id, batch_id, title, description, price, quantity_available, unit, image_url, status, approval_status, quantity_reserved, version) VALUES
(1, 1, 'Cà rốt Đà Lạt loại 1 - lô truy xuất 001', 'Phù hợp chuỗi bán lẻ và bếp trung tâm.', 18000, 1200, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(2, 2, 'Xà lách thủy canh Đà Lạt - giao nhanh', 'Rau lá tươi, ưu tiên vận chuyển lạnh.', 32000, 520, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(3, 3, 'Cà phê Arabica Buôn Ma Thuột specialty', 'Cà phê nhân xanh có QR truy xuất.', 125000, 2100, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(4, 4, 'Hạt tiêu sạch Tây Nguyên', 'Hạt tiêu sấy khô, đóng bao 25kg.', 98000, 800, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(5, 5, 'Bưởi da xanh Bến Tre chuẩn bán lẻ', 'Trái size đồng đều, đóng thùng.', 46000, 1600, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(6, 6, 'Chôm chôm Chợ Lách theo mùa', 'Nguồn hàng trái cây tươi miền Tây.', 38000, 900, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(7, 7, 'Bắp cải hữu cơ Sa Pa', 'Rau hữu cơ vùng cao, thu hoạch trong ngày.', 24000, 700, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(8, 8, 'Gạo thơm ST25 đóng bao bán lẻ', 'Gạo thơm phù hợp cửa hàng thực phẩm sạch.', 29000, 2200, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(9, 9, 'Cà chua beef Đà Lạt nhà màng', 'Đóng khay bán lẻ, phù hợp chuỗi siêu thị.', 36000, 850, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(10, 10, 'Khoai tây vàng Đà Lạt size đồng đều', 'Nguồn hàng ổn định cho bếp trung tâm.', 22000, 1800, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(11, 11, 'Bơ sáp Lâm Đồng chọn lọc', 'Trái chín đều, đóng thùng theo đơn bán lẻ.', 54000, 900, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(12, 12, 'Xoài cát miền Tây truy xuất vùng trồng', 'Xoài cát thơm, phù hợp cửa hàng trái cây sạch.', 42000, 1200, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(13, 13, 'Hạt điều rang Tây Nguyên premium', 'Hạt điều rang mộc đóng túi, hạn dùng dài.', 168000, 700, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(14, 14, 'Trà Shan tuyết Sa Pa đặc sản', 'Trà vùng cao sơ chế thủ công, phù hợp quà tặng.', 210000, 360, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(15, 15, 'Gạo lứt hữu cơ đóng bao nhỏ', 'Gạo lứt sạch cho cửa hàng thực phẩm hữu cơ.', 39000, 1500, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0),
(16, 16, 'Bắp nếp Lào Cai thu hoạch theo ngày', 'Bắp nếp vùng cao, giao nhanh cho nhà bán lẻ.', 26000, 650, 'kg', NULL, 'ACTIVE', 'APPROVED', 0, 0);

INSERT INTO listing_registration_requests(listing_id, requested_by_user_id, status, note, reviewed_by_user_id, reviewed_at) VALUES
(1, 11, 'APPROVED', 'Demo approved', 1, NOW()),
(2, 11, 'APPROVED', 'Demo approved', 1, NOW()),
(3, 12, 'APPROVED', 'Demo approved', 1, NOW()),
(4, 12, 'APPROVED', 'Demo approved', 1, NOW()),
(5, 13, 'APPROVED', 'Demo approved', 1, NOW()),
(6, 13, 'APPROVED', 'Demo approved', 1, NOW()),
(7, 14, 'APPROVED', 'Demo approved', 1, NOW()),
(8, 14, 'APPROVED', 'Demo approved', 1, NOW()),
(9, 11, 'APPROVED', 'Demo approved', 1, NOW()),
(10, 11, 'APPROVED', 'Demo approved', 1, NOW()),
(11, 13, 'APPROVED', 'Demo approved', 1, NOW()),
(12, 13, 'APPROVED', 'Demo approved', 1, NOW()),
(13, 12, 'APPROVED', 'Demo approved', 1, NOW()),
(14, 14, 'APPROVED', 'Demo approved', 1, NOW()),
(15, 14, 'APPROVED', 'Demo approved', 1, NOW()),
(16, 14, 'APPROVED', 'Demo approved', 1, NOW());

INSERT INTO orders(order_id, retailer_id, farm_id, total_amount, status, payment_status, deposit_amount, deposit_paid_at, delivery_confirmed_at, version) VALUES
(1, 1, 1, 21600000, 'CONFIRMED', 'DEPOSIT_PAID', 4320000, NOW(), NULL, 0),
(2, 2, 1, 16640000, 'READY_FOR_SHIPMENT', 'DEPOSIT_PAID', 3328000, NOW(), NULL, 0),
(3, 1, 2, 62500000, 'SHIPPING', 'DEPOSIT_PAID', 12500000, NOW(), NULL, 0),
(4, 3, 2, 39200000, 'DELIVERED', 'PAID', 7840000, NOW(), NOW(), 0),
(5, 4, 3, 36800000, 'CONFIRMED', 'DEPOSIT_PAID', 7360000, NOW(), NULL, 0),
(6, 2, 3, 22800000, 'PENDING', 'UNPAID', 4560000, NULL, NULL, 0),
(7, 4, 4, 16800000, 'SHIPPING', 'DEPOSIT_PAID', 3360000, NOW(), NULL, 0),
(8, 3, 4, 58000000, 'DELIVERED', 'PAID', 11600000, NOW(), NOW(), 0);

INSERT INTO order_items(order_id, listing_id, quantity, price) VALUES
(1, 1, 1200, 18000),
(2, 2, 520, 32000),
(3, 3, 500, 125000),
(4, 4, 400, 98000),
(5, 5, 800, 46000),
(6, 6, 600, 38000),
(7, 7, 700, 24000),
(8, 8, 2000, 29000);

INSERT INTO order_status_history(order_id, previous_status, new_status, reason, blockchain_tx_hash) VALUES
(1, 'PENDING', 'CONFIRMED', 'Retailer đã đặt cọc demo.', NULL),
(2, 'CONFIRMED', 'READY_FOR_SHIPMENT', 'Đang chờ tạo shipment.', NULL),
(3, 'READY_FOR_SHIPMENT', 'SHIPPING', 'Đã bàn giao vận chuyển.', NULL),
(4, 'SHIPPING', 'DELIVERED', 'Giao hàng thành công.', NULL),
(5, 'PENDING', 'CONFIRMED', 'Đơn hàng demo được xác nhận.', NULL),
(6, 'DRAFT', 'PENDING', 'Retailer tạo đơn demo.', NULL),
(7, 'READY_FOR_SHIPMENT', 'SHIPPING', 'Xe lạnh đang giao.', NULL),
(8, 'SHIPPING', 'DELIVERED', 'Hoàn tất giao gạo demo.', NULL);

INSERT INTO shipments(shipment_id, order_id, shipping_manager_user_id, driver_id, vehicle_id, status, note, pickup_confirmed_at, delivery_confirmed_at, cancel_reason, created_at, updated_at, version, idempotency_key) VALUES
(1, 3, 31, 1, 1, 'IN_TRANSIT', 'Tuyến Đắk Lắk đi TP.HCM', NOW(), NULL, NULL, NOW(), NOW(), 0, 'demo-shipment-001'),
(2, 4, 32, 2, 2, 'DELIVERED', 'Đã giao tiêu sạch Tây Nguyên', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), NULL, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW(), 0, 'demo-shipment-002'),
(3, 7, 33, 3, 3, 'IN_TRANSIT', 'Xe lạnh vận chuyển rau hữu cơ', NOW(), NULL, NULL, NOW(), NOW(), 0, 'demo-shipment-003'),
(4, 8, 34, 4, 4, 'DELIVERED', 'Đã giao gạo ST25 cho retailer', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), 0, 'demo-shipment-004');

INSERT INTO shipment_logs(shipment_id, type, location, note, image_url, recorded_at) VALUES
(1, 'PICKUP', 'Buôn Ma Thuột, Đắk Lắk', 'Đã nhận cà phê tại kho farm.', NULL, NOW()),
(1, 'CHECKPOINT', 'Quốc lộ 14', 'Nhiệt độ khoang ổn định.', NULL, NOW()),
(2, 'DELIVERY', 'Quận 7, TP.HCM', 'Retailer đã ký nhận.', NULL, NOW()),
(3, 'PICKUP', 'Sa Pa, Lào Cai', 'Đã nhận bắp cải hữu cơ.', NULL, NOW()),
(4, 'DELIVERY', 'Cần Thơ', 'Hoàn tất giao gạo.', NULL, NOW());

INSERT INTO farm_retailer_contracts(farm_id, retailer_id, status, signed_at, valid_from, valid_to, product_scope, agreed_price_rule, notes, related_listing_ids, related_order_ids, created_by_user_id, reviewed_by_user_id, reviewed_at) VALUES
(1, 1, 'APPROVED', NOW(), NOW(), DATE_ADD(NOW(), INTERVAL 180 DAY), 'Rau củ Đà Lạt', 'Theo giá listing đã duyệt', 'Hợp đồng demo giữa farm và retailer.', '1,2', '1,2', 21, 1, NOW()),
(2, 1, 'APPROVED', NOW(), NOW(), DATE_ADD(NOW(), INTERVAL 180 DAY), 'Cà phê và tiêu', 'Chiết khấu theo sản lượng', 'Hợp đồng demo nguồn hàng Tây Nguyên.', '3,4', '3,4', 21, 1, NOW()),
(3, 4, 'PENDING', NULL, NOW(), DATE_ADD(NOW(), INTERVAL 120 DAY), 'Trái cây đặc sản', 'Chờ chốt giá theo mùa', 'Hợp đồng demo chờ duyệt.', '5,6', '5,6', 24, NULL, NULL),
(4, 3, 'APPROVED', NOW(), NOW(), DATE_ADD(NOW(), INTERVAL 180 DAY), 'Rau hữu cơ và gạo', 'Theo bảng giá tháng', 'Hợp đồng demo vùng cao.', '7,8', '7,8', 23, 1, NOW());

INSERT INTO educational_contents(title, slug, summary, body, content_type, media_url, status, created_by_user_id) VALUES
('Cách đọc QR truy xuất nguồn gốc BICAP', 'cach-doc-qr-truy-xuat-bicap', 'Hướng dẫn khách hàng kiểm tra nguồn gốc sản phẩm bằng mã QR.', '<p>Khi quét mã QR trên sản phẩm, khách hàng có thể xem tên nông trại, khu vực sản xuất, ngày thu hoạch, hạng chất lượng và nhật ký sản xuất công khai.</p><p>Nếu mã QR hợp lệ, hệ thống sẽ hiển thị hồ sơ truy xuất của lô hàng. Nếu không tìm thấy dữ liệu, khách hàng nên kiểm tra lại mã hoặc liên hệ đơn vị bán hàng.</p>', 'GUIDE', NULL, 'PUBLISHED', 1),
('Quy trình duyệt listing nông sản', 'quy-trinh-duyet-listing-nong-san', 'Tóm tắt cách một sản phẩm được công bố lên chợ nông sản BICAP.', '<p>Để một sản phẩm xuất hiện trên chợ nông sản công khai, nông trại cần tạo mùa vụ, ghi nhận lô hàng và gửi listing để quản trị viên kiểm tra.</p><p>Sau khi được duyệt, listing chỉ hiển thị các thông tin phù hợp cho khách truy cập như tên sản phẩm, giá, nông trại, khu vực, chất lượng và đường dẫn truy xuất QR.</p>', 'ARTICLE', NULL, 'PUBLISHED', 2);

INSERT INTO notifications(sender_user_id, recipient_role, title, message, notification_type, target_type, target_id, is_read) VALUES
(1, 'FARM', 'Dữ liệu demo đã sẵn sàng', 'Các farm demo đã có season, batch và listing.', 'SYSTEM', 'DEMO', NULL, FALSE),
(1, 'RETAILER', 'Marketplace demo có nguồn hàng mới', 'Retailer có thể đặt hàng từ các listing đã duyệt.', 'SYSTEM', 'DEMO', NULL, FALSE),
(1, 'SHIPPING_MANAGER', 'Shipment demo đã được tạo', 'Có các chuyến hàng đang giao và đã giao để kiểm thử.', 'SYSTEM', 'DEMO', NULL, FALSE);
