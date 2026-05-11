package com.bicap.modules.season.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class UpdateSeasonRequest {
    @Size(max = 100, message = "Mã mùa vụ không được vượt quá 100 ký tự")
    private String seasonCode;

    private LocalDate startDate;
    private LocalDate expectedHarvestDate;

    @Size(max = 255, message = "Phương pháp canh tác không được vượt quá 255 ký tự")
    private String farmingMethod;

    @Size(max = 50, message = "Trạng thái mùa vụ không được vượt quá 50 ký tự")
    private String seasonStatus;

    private LocalDate actualHarvestDate;

    public String getSeasonCode() { return seasonCode; }
    public void setSeasonCode(String s) { this.seasonCode = s; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate d) { this.startDate = d; }
    public LocalDate getExpectedHarvestDate() { return expectedHarvestDate; }
    public void setExpectedHarvestDate(LocalDate d) { this.expectedHarvestDate = d; }
    public String getFarmingMethod() { return farmingMethod; }
    public void setFarmingMethod(String s) { this.farmingMethod = s; }
    public String getSeasonStatus() { return seasonStatus; }
    public void setSeasonStatus(String s) { this.seasonStatus = s; }
    public LocalDate getActualHarvestDate() { return actualHarvestDate; }
    public void setActualHarvestDate(LocalDate d) { this.actualHarvestDate = d; }
}
