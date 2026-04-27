package com.bicap.modules.iot.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CreateIoTReadingRequest {
    @NotNull
    private Long batchId;
    @NotNull
    private BigDecimal temperature;
    @NotNull
    private BigDecimal humidity;
    @NotNull
    private BigDecimal phValue;

    public Long getBatchId() { return batchId; }
    public void setBatchId(Long batchId) { this.batchId = batchId; }
    public BigDecimal getTemperature() { return temperature; }
    public void setTemperature(BigDecimal temperature) { this.temperature = temperature; }
    public BigDecimal getHumidity() { return humidity; }
    public void setHumidity(BigDecimal humidity) { this.humidity = humidity; }
    public BigDecimal getPhValue() { return phValue; }
    public void setPhValue(BigDecimal phValue) { this.phValue = phValue; }
}
