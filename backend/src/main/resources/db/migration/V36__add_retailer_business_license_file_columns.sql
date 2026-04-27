ALTER TABLE retailers
    ADD COLUMN business_license_file_url VARCHAR(500) NULL AFTER business_license_no,
    ADD COLUMN business_license_file_name VARCHAR(255) NULL AFTER business_license_file_url,
    ADD COLUMN business_license_file_size BIGINT NULL AFTER business_license_file_name,
    ADD COLUMN business_license_uploaded_at DATETIME NULL AFTER business_license_file_size;
