package com.bicap.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateSeasonRequest {

    @NotBlank(message = "Season code is required")
    private String seasonCode;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Expected harvest date is required")
    private LocalDate expectedHarvestDate;

    private LocalDate actualHarvestDate;

    private String farmingMethod;

    private String seasonStatus;

    // Manual Getter/Setter for Lombok fallback
    public String getSeasonCode() { return seasonCode; }
    public void setSeasonCode(String seasonCode) { this.seasonCode = seasonCode; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getExpectedHarvestDate() { return expectedHarvestDate; }
    public void setExpectedHarvestDate(LocalDate expectedHarvestDate) { this.expectedHarvestDate = expectedHarvestDate; }
    public LocalDate getActualHarvestDate() { return actualHarvestDate; }
    public void setActualHarvestDate(LocalDate actualHarvestDate) { this.actualHarvestDate = actualHarvestDate; }
    public String getFarmingMethod() { return farmingMethod; }
    public void setFarmingMethod(String farmingMethod) { this.farmingMethod = farmingMethod; }
    public String getSeasonStatus() { return seasonStatus; }
    public void setSeasonStatus(String seasonStatus) { this.seasonStatus = seasonStatus; }
}
