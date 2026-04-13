package com.bicap.modules.batch.dto;

import java.time.LocalDate;

public class TraceSeasonInfoDto {
    private Long seasonId;
    private String seasonCode;
    private String farmingMethod;
    private LocalDate startDate;
    private LocalDate expectedHarvestDate;
    private String status;
    private String farmName;
    private String farmCode;

    public Long getSeasonId() { return seasonId; }
    public void setSeasonId(Long seasonId) { this.seasonId = seasonId; }
    public String getSeasonCode() { return seasonCode; }
    public void setSeasonCode(String seasonCode) { this.seasonCode = seasonCode; }
    public String getFarmingMethod() { return farmingMethod; }
    public void setFarmingMethod(String farmingMethod) { this.farmingMethod = farmingMethod; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getExpectedHarvestDate() { return expectedHarvestDate; }
    public void setExpectedHarvestDate(LocalDate expectedHarvestDate) { this.expectedHarvestDate = expectedHarvestDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }
    public String getFarmCode() { return farmCode; }
    public void setFarmCode(String farmCode) { this.farmCode = farmCode; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final TraceSeasonInfoDto dto = new TraceSeasonInfoDto();

        public Builder seasonId(Long value) { dto.setSeasonId(value); return this; }
        public Builder seasonCode(String value) { dto.setSeasonCode(value); return this; }
        public Builder farmingMethod(String value) { dto.setFarmingMethod(value); return this; }
        public Builder startDate(LocalDate value) { dto.setStartDate(value); return this; }
        public Builder expectedHarvestDate(LocalDate value) { dto.setExpectedHarvestDate(value); return this; }
        public Builder status(String value) { dto.setStatus(value); return this; }
        public Builder farmName(String value) { dto.setFarmName(value); return this; }
        public Builder farmCode(String value) { dto.setFarmCode(value); return this; }
        public TraceSeasonInfoDto build() { return dto; }
    }
}
