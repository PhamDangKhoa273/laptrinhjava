-- Migration V27: Add missing farm detail columns to farms table
ALTER TABLE farms
    ADD COLUMN farm_type VARCHAR(50) NULL,
    ADD COLUMN total_area DECIMAL(10,2) NULL,
    ADD COLUMN contact_person VARCHAR(150) NULL,
    ADD COLUMN phone VARCHAR(20) NULL,
    ADD COLUMN email VARCHAR(150) NULL,
    ADD COLUMN logo_url VARCHAR(500) NULL;
