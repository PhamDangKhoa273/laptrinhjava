package com.bicap.modules.analytics.dto;

import java.util.List;

public class ForecastResponse {
    private String scope;
    private String trend;
    private Double forecastValue;
    private Double confidence;
    private List<String> signals;
    private List<String> actions;

    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }
    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }
    public Double getForecastValue() { return forecastValue; }
    public void setForecastValue(Double forecastValue) { this.forecastValue = forecastValue; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    public List<String> getSignals() { return signals; }
    public void setSignals(List<String> signals) { this.signals = signals; }
    public List<String> getActions() { return actions; }
    public void setActions(List<String> actions) { this.actions = actions; }
}