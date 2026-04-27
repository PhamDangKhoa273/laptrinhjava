-- Batch 4 production-readiness indexes.
-- Unique business keys for users/farms/subscription transaction refs already exist
-- in earlier migrations, so this migration only adds non-unique lookup indexes.

CREATE INDEX idx_farms_approval_status ON farms (approval_status);
CREATE INDEX idx_farms_certification_status ON farms (certification_status);

CREATE INDEX idx_orders_payment_status ON orders (payment_status);
CREATE INDEX idx_orders_status_payment_status ON orders (status, payment_status);

CREATE INDEX idx_shipments_status ON shipments (status);
CREATE INDEX idx_shipments_driver_id ON shipments (driver_id);
CREATE INDEX idx_shipments_shipping_manager_user_id ON shipments (shipping_manager_user_id);

CREATE INDEX idx_product_listings_status ON product_listings (status);
CREATE INDEX idx_product_listings_approval_status ON product_listings (approval_status);
CREATE INDEX idx_product_listings_status_approval_status ON product_listings (status, approval_status);

CREATE INDEX idx_media_files_entity_type_entity_id ON media_files (entity_type, entity_id);
CREATE INDEX idx_media_files_owner_user_id ON media_files (owner_user_id);
