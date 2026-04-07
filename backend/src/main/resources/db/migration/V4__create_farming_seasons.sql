CREATE TABLE farming_seasons (
    season_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    farm_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    plant_name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    expected_end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
    blockchain_tx_hash VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_farming_season_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
);
