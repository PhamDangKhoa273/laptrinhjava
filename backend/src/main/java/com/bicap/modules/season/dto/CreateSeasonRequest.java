package com.bicap.modules.season.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class CreateSeasonRequest {
    @NotNull(message = "farm_id is required")
    private Long farmId;

    @NotNull(message = "product_id is required")
    private Long productId;

    @NotBlank(message = "season_code is required")
    @Size(max = 100, message = "season_code must be at most 100 characters")
    private String seasonCode;

    @NotNull(message = "start_date is required")
    private LocalDate startDate;

    @NotNull(message = "expected_harvest_date is required")
    private LocalDate expectedHarvestDate;

    @NotBlank(message = "farming_method is required")
    @Size(max = 255, message = "farming_method must be at most 255 characters")
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
