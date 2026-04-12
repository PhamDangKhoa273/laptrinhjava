package com.bicap.modules.batch.dto;

import java.time.LocalDate;
import java.math.BigDecimal;

public class UpdateBatchRequest {
    private BigDecimal quantity;
    private BigDecimal availableQuantity;
    private LocalDate harvestDate;
    private LocalDate expiryDate;
    private String qualityGrade;
    private String status;

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal d) { this.quantity = d; }
    public BigDecimal getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(BigDecimal d) { this.availableQuantity = d; }
    public LocalDate getHarvestDate() { return harvestDate; }
    public void setHarvestDate(LocalDate d) { this.harvestDate = d; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate d) { this.expiryDate = d; }
    public String getQualityGrade() { return qualityGrade; }
    public void setQualityGrade(String s) { this.qualityGrade = s; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public String getBatchStatus() { return status; }
}
