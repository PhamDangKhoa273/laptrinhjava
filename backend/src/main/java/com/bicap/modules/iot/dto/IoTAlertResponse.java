package com.bicap.modules.iot.dto;

import java.time.LocalDateTime;

public class IoTAlertResponse {
    private Long alertId;
    private Long batchId;
    private String level;
    private String metric;
    private String message;
    private LocalDateTime createdAt;

    public Long getAlertId() { return alertId; }
    public void setAlertId(Long alertId) { this.alertId = alertId; }
    public Long getBatchId() { return batchId; }
    public void setBatchId(Long batchId) { this.batchId = batchId; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getMetric() { return metric; }
    public void setMetric(String metric) { this.metric = metric; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
