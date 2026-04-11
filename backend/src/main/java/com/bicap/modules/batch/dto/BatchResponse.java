package com.bicap.modules.batch.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

public class BatchResponse {
    private Long batchId;
    private Long seasonId;
    private Long productId;
    private String batchCode;
    private LocalDate harvestDate;
    private BigDecimal quantity;
    private BigDecimal availableQuantity;
    private String qualityGrade;
    private LocalDate expiryDate;
    private String batchStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public void setBatchId(Long id) { this.batchId = id; }
    public void setSeasonId(Long id) { this.seasonId = id; }
    public void setProductId(Long id) { this.productId = id; }
    public void setBatchCode(String s) { this.batchCode = s; }
    public void setHarvestDate(LocalDate d) { this.harvestDate = d; }
    public void setQuantity(BigDecimal d) { this.quantity = d; }
    public void setAvailableQuantity(BigDecimal d) { this.availableQuantity = d; }
    public void setQualityGrade(String s) { this.qualityGrade = s; }
    public void setExpiryDate(LocalDate d) { this.expiryDate = d; }
    public void setBatchStatus(String s) { this.batchStatus = s; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
    public void setUpdatedAt(LocalDateTime t) { this.updatedAt = t; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private BatchResponse r = new BatchResponse();
        public Builder batchId(Long id) { r.setBatchId(id); return this; }
        public Builder seasonId(Long id) { r.setSeasonId(id); return this; }
        public Builder productId(Long id) { r.setProductId(id); return this; }
        public Builder batchCode(String s) { r.setBatchCode(s); return this; }
        public Builder harvestDate(LocalDate d) { r.setHarvestDate(d); return this; }
        public Builder quantity(BigDecimal d) { r.setQuantity(d); return this; }
        public Builder availableQuantity(BigDecimal d) { r.setAvailableQuantity(d); return this; }
        public Builder qualityGrade(String s) { r.setQualityGrade(s); return this; }
        public Builder expiryDate(LocalDate d) { r.setExpiryDate(d); return this; }
        public Builder batchStatus(String s) { r.setBatchStatus(s); return this; }
        public Builder createdAt(LocalDateTime t) { r.setCreatedAt(t); return this; }
        public Builder updatedAt(LocalDateTime t) { r.setUpdatedAt(t); return this; }
        public BatchResponse build() { return r; }
    }
}
