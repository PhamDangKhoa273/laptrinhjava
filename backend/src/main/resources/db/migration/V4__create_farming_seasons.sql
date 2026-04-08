CREATE TABLE farming_seasons (
    season_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    farm_id BIGINT NOT NULL,
    season_code VARCHAR(50) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    farming_method VARCHAR(255),
    season_status VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_farming_season_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
);
