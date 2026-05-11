-- V58 - Cau hinh kenh ho tro khach hang (Telegram / Zalo / Hotline / Email)
CREATE TABLE IF NOT EXISTS support_config (
    config_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    telegram_handle VARCHAR(120) NULL,
    telegram_display VARCHAR(120) NULL,
    zalo_phone VARCHAR(40) NULL,
    zalo_display VARCHAR(120) NULL,
    email VARCHAR(160) NULL,
    hotline VARCHAR(40) NULL,
    working_hours VARCHAR(160) NULL,
    note VARCHAR(500) NULL,
    updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO support_config (telegram_handle, telegram_display, email, hotline, working_hours, note, updated_at)
SELECT 'bicap_support', '@bicap_support', 'support@bicap.vn', '1900 1009', 'Thu 2 - Thu 7, 8:00 - 18:00',
       'Doi ngu BICAP se phan hoi trong vong 30 phut vao gio hanh chinh.', NOW()
WHERE NOT EXISTS (SELECT 1 FROM support_config);
