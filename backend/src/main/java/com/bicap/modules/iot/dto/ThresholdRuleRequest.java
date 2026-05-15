package com.bicap.modules.iot.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class ThresholdRuleRequest {
    @NotBlank(message = "metric không được để trống")
    private String metric;
    private BigDecimal minValue;
    private BigDecimal maxValue;
    private boolean enabled = true;

    public String getMetric() { return metric; }
    public void setMetric(String metric) { this.metric = metric; }
    public BigDecimal getMinValue() { return minValue; }
    public void setMinValue(BigDecimal minValue) { this.minValue = minValue; }
    public BigDecimal getMaxValue() { return maxValue; }
    public void setMaxValue(BigDecimal maxValue) { this.maxValue = maxValue; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}
