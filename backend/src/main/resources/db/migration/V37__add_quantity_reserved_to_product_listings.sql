ALTER TABLE product_listings
    ADD COLUMN quantity_reserved DECIMAL(15,2) NOT NULL DEFAULT 0;
