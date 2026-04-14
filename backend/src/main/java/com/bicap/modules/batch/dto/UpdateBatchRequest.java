package com.bicap.modules.batch.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.math.BigDecimal;

public class UpdateBatchRequest {
    @DecimalMin(value = "0.0", inclusive = false, message = "quantity must be greater than 0")
    private BigDecimal quantity;

    @DecimalMin(value = "0.0", inclusive = false, message = "available_quantity must be greater than 0")
    private BigDecimal availableQuantity;

    private LocalDate harvestDate;
    private LocalDate expiryDate;

    @Size(max = 20, message = "quality_grade must be at most 20 characters")
    private String qualityGrade;

    @Size(max = 50, message = "status must be at most 50 characters")
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
