CREATE TABLE season_exports (
    export_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    season_id BIGINT NOT NULL,
    trace_code VARCHAR(100) NOT NULL,
    public_trace_url VARCHAR(500) NOT NULL,
    data_hash VARCHAR(100) NOT NULL,
    payload_json LONGTEXT NULL,
    qr_image_base64 LONGTEXT NULL,
    exported_at DATETIME NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    CONSTRAINT fk_season_export_season FOREIGN KEY (season_id) REFERENCES farming_seasons(season_id),
    UNIQUE KEY uq_season_exports_trace_code (trace_code)
);
