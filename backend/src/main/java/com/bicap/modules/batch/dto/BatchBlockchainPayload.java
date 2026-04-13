package com.bicap.modules.batch.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

public class BatchBlockchainPayload {
    private Long batchId;
    private String batchCode;
    private Long seasonId;
    private Long productId;
    private LocalDate harvestDate;
    private BigDecimal quantity;
    private String qualityGrade;

    public Long getBatchId() { return batchId; }
    public void setBatchId(Long batchId) { this.batchId = batchId; }
    public String getBatchCode() { return batchCode; }
    public void setBatchCode(String batchCode) { this.batchCode = batchCode; }
    public Long getSeasonId() { return seasonId; }
    public void setSeasonId(Long seasonId) { this.seasonId = seasonId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public LocalDate getHarvestDate() { return harvestDate; }
    public void setHarvestDate(LocalDate harvestDate) { this.harvestDate = harvestDate; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public String getQualityGrade() { return qualityGrade; }
    public void setQualityGrade(String qualityGrade) { this.qualityGrade = qualityGrade; }

    public Map<String, Object> toMap() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("batchId", batchId);
        payload.put("batchCode", batchCode);
        payload.put("seasonId", seasonId);
        payload.put("productId", productId);
        payload.put("harvestDate", harvestDate);
        payload.put("quantity", quantity);
        payload.put("qualityGrade", qualityGrade);
        return payload;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final BatchBlockchainPayload payload = new BatchBlockchainPayload();

        public Builder batchId(Long value) { payload.setBatchId(value); return this; }
        public Builder batchCode(String value) { payload.setBatchCode(value); return this; }
        public Builder seasonId(Long value) { payload.setSeasonId(value); return this; }
        public Builder productId(Long value) { payload.setProductId(value); return this; }
        public Builder harvestDate(LocalDate value) { payload.setHarvestDate(value); return this; }
        public Builder quantity(BigDecimal value) { payload.setQuantity(value); return this; }
        public Builder qualityGrade(String value) { payload.setQualityGrade(value); return this; }
        public BatchBlockchainPayload build() { return payload; }
    }
}
