-- V59 - Mo rong support_config de luu URL mang xa hoi cua admin
ALTER TABLE support_config
    ADD COLUMN facebook_url VARCHAR(255) NULL AFTER zalo_display,
    ADD COLUMN instagram_url VARCHAR(255) NULL AFTER facebook_url,
    ADD COLUMN tiktok_url VARCHAR(255) NULL AFTER instagram_url,
    ADD COLUMN youtube_url VARCHAR(255) NULL AFTER tiktok_url,
    ADD COLUMN linkedin_url VARCHAR(255) NULL AFTER youtube_url,
    ADD COLUMN x_url VARCHAR(255) NULL AFTER linkedin_url,
    ADD COLUMN website_url VARCHAR(255) NULL AFTER x_url,
    ADD COLUMN messenger_url VARCHAR(255) NULL AFTER website_url,
    ADD COLUMN whatsapp_url VARCHAR(255) NULL AFTER messenger_url;
