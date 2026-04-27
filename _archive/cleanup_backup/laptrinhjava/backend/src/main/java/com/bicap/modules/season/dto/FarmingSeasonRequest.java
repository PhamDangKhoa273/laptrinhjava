package com.bicap.modules.season.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class FarmingSeasonRequest {

    @NotNull(message = "Farm ID is required")
    private Long farmId;

    @NotBlank(message = "Season name is required")
    private String name;

    @NotBlank(message = "Plant name is required")
    private String plantName;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Expected end date is required")
    private LocalDate expectedEndDate;

    private String status; // optional when creating

    public Long getFarmId() { return farmId; }
    public void setFarmId(Long farmId) { this.farmId = farmId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPlantName() { return plantName; }
    public void setPlantName(String plantName) { this.plantName = plantName; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getExpectedEndDate() { return expectedEndDate; }
    public void setExpectedEndDate(LocalDate expectedEndDate) { this.expectedEndDate = expectedEndDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
