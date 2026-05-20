-- V48__create_logistics_tables.sql
-- Create missing Logistics module tables with unique names to avoid conflicts

-- Table: logistics_shipments
CREATE TABLE logistics_shipments (
    shipment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT UNIQUE NOT NULL,
    driver_id BIGINT,
    vehicle_id BIGINT,
    shipping_manager_id BIGINT NOT NULL,
    status ENUM (
        'ASSIGNED',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'CANCELLED'
    ) DEFAULT 'ASSIGNED',
    assigned_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers (driver_id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id) ON DELETE SET NULL,
    FOREIGN KEY (shipping_manager_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- Table: logistics_shipment_history
CREATE TABLE logistics_shipment_history (
    history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shipment_id BIGINT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by BIGINT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    latitude DOUBLE,
    longitude DOUBLE,
    FOREIGN KEY (shipment_id) REFERENCES logistics_shipments (shipment_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users (user_id) ON DELETE CASCADE
);

-- Table: logistics_qr_codes
CREATE TABLE logistics_qr_codes (
    qr_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    qr_code_value VARCHAR(255) UNIQUE NOT NULL,
    qr_type ENUM (
        'FARM_PICKUP',
        'RETAILER_DELIVERY'
    ) NOT NULL,
    scanned_at TIMESTAMP,
    scanned_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
    FOREIGN KEY (scanned_by) REFERENCES users (user_id) ON DELETE SET NULL
);

-- Table: logistics_tracking_locations
CREATE TABLE logistics_tracking_locations (
    location_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shipment_id BIGINT NOT NULL,
    driver_id BIGINT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    accuracy FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES logistics_shipments (shipment_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers (driver_id) ON DELETE CASCADE
);

-- Add extra columns to orders table for logistics module
ALTER TABLE orders
ADD COLUMN shipping_manager_id BIGINT,
ADD COLUMN estimated_delivery_date TIMESTAMP,
ADD CONSTRAINT fk_orders_shipping_manager FOREIGN KEY (shipping_manager_id) REFERENCES users (user_id) ON DELETE SET NULL;

-- Fix schema drift in drivers and vehicles
ALTER TABLE drivers
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE vehicles
MODIFY COLUMN capacity INT NOT NULL,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
