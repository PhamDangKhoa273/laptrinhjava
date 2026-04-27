package com.bicap.modules.analytics.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsDashboardResponse {
    private Map<String, Object> admin;
    private Map<String, Object> farm;
    private Map<String, Object> shipping;
    private List<String> recommendations;

    public Map<String, Object> getAdmin() { return admin; }
    public void setAdmin(Map<String, Object> admin) { this.admin = admin; }
    public Map<String, Object> getFarm() { return farm; }
    public void setFarm(Map<String, Object> farm) { this.farm = farm; }
    public Map<String, Object> getShipping() { return shipping; }
    public void setShipping(Map<String, Object> shipping) { this.shipping = shipping; }
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
}