package com.bicap.modules.season.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class SeasonResponse {
    private Long id;
    private Long farmId;
    private String farmName;
    private Long productId;
    private String productCode;
    private String productName;
    private String seasonCode;
    private LocalDate startDate;
    private LocalDate expectedHarvestDate;
    private LocalDate actualHarvestDate;
    private String farmingMethod;
    private String seasonStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getFarmId() { return farmId; }
    public void setFarmId(Long id) { this.farmId = id; }
    
    public String getFarmName() { return farmName; }
    public void setFarmName(String s) { this.farmName = s; }
    
    public Long getProductId() { return productId; }
    public void setProductId(Long id) { this.productId = id; }
    
    public String getProductCode() { return productCode; }
    public void setProductCode(String s) { this.productCode = s; }
    
    public String getProductName() { return productName; }
    public void setProductName(String s) { this.productName = s; }
    
    public String getSeasonCode() { return seasonCode; }
    public void setSeasonCode(String s) { this.seasonCode = s; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate d) { this.startDate = d; }
    
    public LocalDate getExpectedHarvestDate() { return expectedHarvestDate; }
    public void setExpectedHarvestDate(LocalDate d) { this.expectedHarvestDate = d; }
    
    public LocalDate getActualHarvestDate() { return actualHarvestDate; }
    public void setActualHarvestDate(LocalDate d) { this.actualHarvestDate = d; }
    
    public String getFarmingMethod() { return farmingMethod; }
    public void setFarmingMethod(String s) { this.farmingMethod = s; }
    
    public String getSeasonStatus() { return seasonStatus; }
    public void setSeasonStatus(String s) { this.seasonStatus = s; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime t) { this.updatedAt = t; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private SeasonResponse r = new SeasonResponse();
        public Builder id(Long l) { r.setId(l); return this; }
        public Builder farmId(Long l) { r.setFarmId(l); return this; }
        public Builder farmName(String s) { r.setFarmName(s); return this; }
        public Builder productId(Long l) { r.setProductId(l); return this; }
        public Builder productCode(String s) { r.setProductCode(s); return this; }
        public Builder productName(String s) { r.setProductName(s); return this; }
        public Builder seasonCode(String s) { r.setSeasonCode(s); return this; }
        public Builder startDate(LocalDate d) { r.setStartDate(d); return this; }
        public Builder expectedHarvestDate(LocalDate d) { r.setExpectedHarvestDate(d); return this; }
        public Builder actualHarvestDate(LocalDate d) { r.setActualHarvestDate(d); return this; }
        public Builder farmingMethod(String s) { r.setFarmingMethod(s); return this; }
        public Builder seasonStatus(String s) { r.setSeasonStatus(s); return this; }
        public Builder createdAt(LocalDateTime t) { r.setCreatedAt(t); return this; }
        public Builder updatedAt(LocalDateTime t) { r.setUpdatedAt(t); return this; }
        public SeasonResponse build() { return r; }
    }
}
