package com.bicap.modules.iot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CreateSensorReadingRequest {
    private Long batchId;
    private Long seasonId;
    @NotBlank
    private String metric;
    @NotNull
    private BigDecimal value;
    private String measuredAt;
    private String deviceCode;
    private String apiKey;
    private String gatewayTimestamp;

    public Long getBatchId() { return batchId; }
    public void setBatchId(Long batchId) { this.batchId = batchId; }
    public Long getSeasonId() { return seasonId; }
    public void setSeasonId(Long seasonId) { this.seasonId = seasonId; }
    public String getMetric() { return metric; }
    public void setMetric(String metric) { this.metric = metric; }
    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
    public String getMeasuredAt() { return measuredAt; }
    public void setMeasuredAt(String measuredAt) { this.measuredAt = measuredAt; }
    public String getDeviceCode() { return deviceCode; }
    public void setDeviceCode(String deviceCode) { this.deviceCode = deviceCode; }
    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public String getGatewayTimestamp() { return gatewayTimestamp; }
    public void setGatewayTimestamp(String gatewayTimestamp) { this.gatewayTimestamp = gatewayTimestamp; }
}
