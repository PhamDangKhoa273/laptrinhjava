package com.bicap.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateSeasonRequest {

    @NotNull(message = "Farm ID is required")
    private Long farmId;

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Season code is required")
    private String seasonCode;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Expected harvest date is required")
    private LocalDate expectedHarvestDate;

    private String farmingMethod;

    // Manual Getter/Setter for Lombok fallback
    public Long getFarmId() { return farmId; }
    public void setFarmId(Long farmId) { this.farmId = farmId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getSeasonCode() { return seasonCode; }
    public void setSeasonCode(String seasonCode) { this.seasonCode = seasonCode; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getExpectedHarvestDate() { return expectedHarvestDate; }
    public void setExpectedHarvestDate(LocalDate expectedHarvestDate) { this.expectedHarvestDate = expectedHarvestDate; }
    public String getFarmingMethod() { return farmingMethod; }
    public void setFarmingMethod(String farmingMethod) { this.farmingMethod = farmingMethod; }
}
