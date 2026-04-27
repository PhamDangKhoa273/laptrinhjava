ALTER TABLE product_listings
    ADD COLUMN approval_status VARCHAR(30) NULL AFTER status;
