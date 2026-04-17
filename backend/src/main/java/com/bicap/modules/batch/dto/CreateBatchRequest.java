package com.bicap.modules.batch.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.math.BigDecimal;

public class CreateBatchRequest {
    @NotNull(message = "season_id is required")
    private Long seasonId;

    @NotNull(message = "product_id is required")
    private Long productId;

    @NotBlank(message = "batch_code is required")
    @Size(max = 100, message = "batch_code must be at most 100 characters")
    private String batchCode;

    @NotNull(message = "harvest_date is required")
    private LocalDate harvestDate;

    @NotNull(message = "quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "quantity must be greater than 0")
    private BigDecimal quantity;

    @NotNull(message = "available_quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "available_quantity must be greater than 0")
    private BigDecimal availableQuantity;

    @NotBlank(message = "quality_grade is required")
    @Size(max = 20, message = "quality_grade must be at most 20 characters")
    private String qualityGrade;

    @NotNull(message = "expiry_date is required")
    private LocalDate expiryDate;

    @Size(max = 50, message = "batch_status must be at most 50 characters")
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
