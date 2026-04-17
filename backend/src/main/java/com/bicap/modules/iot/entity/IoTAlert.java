package com.bicap.modules.iot.entity;

import com.bicap.core.enums.IoTAlertLevel;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "iot_alerts")
public class IoTAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Long alertId;

    @Column(name = "batch_id", nullable = false)
    private Long batchId;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false, length = 20)
    private IoTAlertLevel level;

    @Column(name = "metric", nullable = false, length = 30)
    private String metric;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getAlertId() { return alertId; }
    public void setAlertId(Long alertId) { this.alertId = alertId; }
    public Long getBatchId() { return batchId; }
    public void setBatchId(Long batchId) { this.batchId = batchId; }
    public IoTAlertLevel getLevel() { return level; }
    public void setLevel(IoTAlertLevel level) { this.level = level; }
    public String getMetric() { return metric; }
    public void setMetric(String metric) { this.metric = metric; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
