package com.bicap.modules.season.dto;

import java.time.LocalDate;

public class CreateSeasonRequest {
    private Long farmId;
    private Long productId;
    private String seasonCode;
    private LocalDate startDate;
    private LocalDate expectedHarvestDate;
    private String farmingMethod;

    public Long getFarmId() { return farmId; }
    public void setFarmId(Long id) { this.farmId = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long id) { this.productId = id; }
    public String getSeasonCode() { return seasonCode; }
    public void setSeasonCode(String s) { this.seasonCode = s; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate d) { this.startDate = d; }
    public LocalDate getExpectedHarvestDate() { return expectedHarvestDate; }
    public void setExpectedHarvestDate(LocalDate d) { this.expectedHarvestDate = d; }
    public String getFarmingMethod() { return farmingMethod; }
    public void setFarmingMethod(String s) { this.farmingMethod = s; }
}
