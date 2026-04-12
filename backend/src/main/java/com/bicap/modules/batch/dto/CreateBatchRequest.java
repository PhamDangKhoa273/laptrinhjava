package com.bicap.modules.batch.dto;

import java.time.LocalDate;
import java.math.BigDecimal;

public class CreateBatchRequest {
    private Long seasonId;
    private Long productId;
    private String batchCode;
    private LocalDate harvestDate;
    private BigDecimal quantity;
    private BigDecimal availableQuantity;
    private String qualityGrade;
    private LocalDate expiryDate;
    private String batchStatus;

    public Long getSeasonId() { return seasonId; }
    public void setSeasonId(Long id) { this.seasonId = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long id) { this.productId = id; }
    public String getBatchCode() { return batchCode; }
    public void setBatchCode(String s) { this.batchCode = s; }
    public LocalDate getHarvestDate() { return harvestDate; }
    public void setHarvestDate(LocalDate d) { this.harvestDate = d; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal d) { this.quantity = d; }
    public BigDecimal getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(BigDecimal d) { this.availableQuantity = d; }
    public String getQualityGrade() { return qualityGrade; }
    public void setQualityGrade(String s) { this.qualityGrade = s; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate d) { this.expiryDate = d; }
    public String getBatchStatus() { return batchStatus; }
    public void setBatchStatus(String s) { this.batchStatus = s; }
}
