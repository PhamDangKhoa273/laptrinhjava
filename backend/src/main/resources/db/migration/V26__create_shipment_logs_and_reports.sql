CREATE TABLE shipment_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shipment_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL,
    location VARCHAR(255) NULL,
    note VARCHAR(500) NULL,
    image_url VARCHAR(500) NULL,
    recorded_at DATETIME NOT NULL,
    CONSTRAINT fk_shipment_logs_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(shipment_id)
);

CREATE TABLE shipment_reports (
    report_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shipment_id BIGINT NOT NULL,
    driver_id BIGINT NOT NULL,
    issue_type VARCHAR(50) NOT NULL,
    description VARCHAR(1000) NULL,
    severity VARCHAR(20) NULL,
    status VARCHAR(20) NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_shipment_reports_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(shipment_id)
);

CREATE INDEX idx_shipment_logs_shipment_id ON shipment_logs (shipment_id);
CREATE INDEX idx_shipment_reports_shipment_id ON shipment_reports (shipment_id);
CREATE INDEX idx_shipment_reports_driver_id ON shipment_reports (driver_id);
