-- V13__create_logistician_module.sql
-- Create Logistician (Shipping & Mobile Driver) Module Tables

-- Table: drivers
-- Purpose: Store driver information linked to users
CREATE TABLE drivers (
    driver_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    shipping_manager_id BIGINT NOT NULL,
    license_plate VARCHAR(50),
    phone VARCHAR(20),
    status ENUM (
        'ACTIVE',
        'INACTIVE',
        'ON_DELIVERY'
    ) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (shipping_manager_id) REFERENCES users (user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_shipping_manager_id (shipping_manager_id)
);

-- Table: vehicles
-- Purpose: Store vehicle information assigned to drivers
CREATE TABLE vehicles (
    vehicle_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    driver_id BIGINT UNIQUE NOT NULL,
    plate_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    capacity INT,
    status ENUM (
        'AVAILABLE',
        'IN_USE',
        'MAINTENANCE'
    ) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers (driver_id) ON DELETE CASCADE,
    INDEX idx_driver_id (driver_id),
    INDEX idx_status (status)
);

-- Table: shipments
-- Purpose: Store shipment information for orders (order to delivery tracking)
CREATE TABLE shipments (
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
    FOREIGN KEY (shipping_manager_id) REFERENCES users (user_id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_status (status),
    INDEX idx_shipping_manager_id (shipping_manager_id)
);

-- Table: shipment_history
-- Purpose: Immutable audit trail for shipment status changes
CREATE TABLE shipment_history (
    history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shipment_id BIGINT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by BIGINT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    latitude DOUBLE,
    longitude DOUBLE,
    INDEX idx_shipment_id (shipment_id),
    INDEX idx_changed_by (changed_by),
    INDEX idx_changed_at (changed_at),
    FOREIGN KEY (shipment_id) REFERENCES shipments (shipment_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users (user_id) ON DELETE CASCADE
);

-- Table: qr_codes
-- Purpose: Store QR codes for pickup and delivery verification
CREATE TABLE qr_codes (
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
    FOREIGN KEY (scanned_by) REFERENCES users (user_id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_qr_code_value (qr_code_value),
    INDEX idx_qr_type (qr_type)
);

-- Table: tracking_locations
-- Purpose: Store real-time GPS location history for shipments (for Redis cache fallback)
CREATE TABLE tracking_locations (
    location_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shipment_id BIGINT NOT NULL,
    driver_id BIGINT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    accuracy FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments (shipment_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers (driver_id) ON DELETE CASCADE,
    INDEX idx_shipment_id (shipment_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_created_at (created_at)
);

-- Alter orders table to add shipping-related fields
ALTER TABLE orders
ADD COLUMN shipping_manager_id BIGINT,
ADD COLUMN estimated_delivery_date TIMESTAMP,
ADD FOREIGN KEY (shipping_manager_id) REFERENCES users (user_id) ON DELETE SET NULL,
ADD
INDEX idx_shipping_manager_id (shipping_manager_id);