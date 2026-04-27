CREATE TABLE roles (
    role_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_role_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_roles UNIQUE (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE farms (
    farm_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_user_id BIGINT NOT NULL UNIQUE,
    farm_code VARCHAR(50) NOT NULL UNIQUE,
    farm_name VARCHAR(150) NOT NULL,
    business_license_no VARCHAR(100) NOT NULL UNIQUE,
    certification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    approval_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    address VARCHAR(255),
    province VARCHAR(100),
    description TEXT,
    reviewed_by_user_id BIGINT NULL,
    reviewed_at DATETIME NULL,
    CONSTRAINT fk_farms_owner_user FOREIGN KEY (owner_user_id) REFERENCES users(user_id),
    CONSTRAINT fk_farms_reviewed_by FOREIGN KEY (reviewed_by_user_id) REFERENCES users(user_id)
);

CREATE TABLE retailers (
    retailer_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    retailer_code VARCHAR(50) NOT NULL UNIQUE,
    retailer_name VARCHAR(150) NOT NULL,
    business_license_no VARCHAR(100) NOT NULL UNIQUE,
    address VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_retailers_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE drivers (
    driver_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    manager_user_id BIGINT NOT NULL,
    driver_code VARCHAR(50) NOT NULL UNIQUE,
    license_no VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_drivers_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_drivers_manager FOREIGN KEY (manager_user_id) REFERENCES users(user_id)
);

CREATE TABLE vehicles (
    vehicle_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    manager_user_id BIGINT NOT NULL,
    plate_no VARCHAR(50) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    capacity DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_vehicles_manager FOREIGN KEY (manager_user_id) REFERENCES users(user_id)
);

CREATE TABLE service_packages (
    package_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    package_code VARCHAR(50) NOT NULL UNIQUE,
    package_name VARCHAR(150) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    duration_days INT NOT NULL,
    max_seasons INT NOT NULL DEFAULT 0,
    max_listings INT NOT NULL DEFAULT 0,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE farm_subscriptions (
    subscription_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    farm_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    subscribed_by_user_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    subscription_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_farm_subscriptions_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id),
    CONSTRAINT fk_farm_subscriptions_package FOREIGN KEY (package_id) REFERENCES service_packages(package_id),
    CONSTRAINT fk_farm_subscriptions_user FOREIGN KEY (subscribed_by_user_id) REFERENCES users(user_id)
);

CREATE TABLE subscription_payments (
    subscription_payment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subscription_id BIGINT NOT NULL,
    payer_user_id BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    transaction_ref VARCHAR(100) UNIQUE,
    paid_at DATETIME NULL,
    CONSTRAINT fk_subscription_payments_subscription FOREIGN KEY (subscription_id) REFERENCES farm_subscriptions(subscription_id),
    CONSTRAINT fk_subscription_payments_payer FOREIGN KEY (payer_user_id) REFERENCES users(user_id)
);