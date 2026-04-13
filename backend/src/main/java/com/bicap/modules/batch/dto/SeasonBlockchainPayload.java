package com.bicap.modules.batch.dto;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

public class SeasonBlockchainPayload {
    private Long seasonId;
    private String seasonCode;
    private Long farmId;
    private Long productId;
    private LocalDate startDate;
    private String farmingMethod;

    public Long getSeasonId() { return seasonId; }
    public void setSeasonId(Long seasonId) { this.seasonId = seasonId; }
    public String getSeasonCode() { return seasonCode; }
    public void setSeasonCode(String seasonCode) { this.seasonCode = seasonCode; }
    public Long getFarmId() { return farmId; }
    public void setFarmId(Long farmId) { this.farmId = farmId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public String getFarmingMethod() { return farmingMethod; }
    public void setFarmingMethod(String farmingMethod) { this.farmingMethod = farmingMethod; }

    public Map<String, Object> toMap() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("seasonId", seasonId);
        payload.put("seasonCode", seasonCode);
        payload.put("farmId", farmId);
        payload.put("productId", productId);
        payload.put("startDate", startDate);
        payload.put("farmingMethod", farmingMethod);
        return payload;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final SeasonBlockchainPayload payload = new SeasonBlockchainPayload();

        public Builder seasonId(Long value) { payload.setSeasonId(value); return this; }
        public Builder seasonCode(String value) { payload.setSeasonCode(value); return this; }
        public Builder farmId(Long value) { payload.setFarmId(value); return this; }
        public Builder productId(Long value) { payload.setProductId(value); return this; }
        public Builder startDate(LocalDate value) { payload.setStartDate(value); return this; }
        public Builder farmingMethod(String value) { payload.setFarmingMethod(value); return this; }
        public SeasonBlockchainPayload build() { return payload; }
    }
}
