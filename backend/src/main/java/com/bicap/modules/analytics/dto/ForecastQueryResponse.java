package com.bicap.modules.analytics.dto;

public class ForecastQueryResponse extends ForecastResponse {
    private Long productId;
    private Long farmId;
    private String productName;
    private String farmName;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getFarmId() { return farmId; }
    public void setFarmId(Long farmId) { this.farmId = farmId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }
}