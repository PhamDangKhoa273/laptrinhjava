CREATE TABLE farming_seasons (
    season_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    farm_id BIGINT NOT NULL,
    season_name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_farming_seasons_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
);

CREATE TABLE farming_processes (
    process_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    season_id BIGINT NOT NULL,
    step_no INT NOT NULL,
    step_name VARCHAR(150) NOT NULL,
    performed_at DATETIME NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    recorded_by_user_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_season_step UNIQUE (season_id, step_no),
    CONSTRAINT fk_farming_processes_season FOREIGN KEY (season_id) REFERENCES farming_seasons(season_id),
    CONSTRAINT fk_farming_processes_user FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id)
);

CREATE TABLE blockchain_transactions (
    tx_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    related_entity_type VARCHAR(50) NOT NULL,
    related_entity_id BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    tx_hash VARCHAR(255) NOT NULL UNIQUE,
    tx_status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
