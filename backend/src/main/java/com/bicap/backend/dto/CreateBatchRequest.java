package com.bicap.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateBatchRequest {

    @NotNull(message = "seasonId không được để trống")
    private Long seasonId;

    @NotNull(message = "productId không được để trống")
    private Long productId;

    @NotBlank(message = "batchCode không được để trống")
    @Size(max = 50)
    private String batchCode;

    @NotNull(message = "harvestDate không được để trống")
    private LocalDate harvestDate;

    @NotNull(message = "quantity không được để trống")
    @DecimalMin(value = "0.01", message = "quantity phải lớn hơn 0")
    private BigDecimal quantity;

    @NotNull(message = "availableQuantity không được để trống")
    @DecimalMin(value = "0.00", message = "availableQuantity không được âm")
    private BigDecimal availableQuantity;

    @Size(max = 30)
    private String qualityGrade;

    private LocalDate expiryDate;

    @Size(max = 30)
    private String batchStatus;
}

