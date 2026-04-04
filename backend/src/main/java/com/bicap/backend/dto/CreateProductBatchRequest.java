package com.bicap.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateProductBatchRequest {

    @NotNull(message = "farmId không được để trống")
    private Long farmId;

    private Long seasonId;

    @NotBlank(message = "batchCode không được để trống")
    @Size(max = 50)
    private String batchCode;

    @NotBlank(message = "productName không được để trống")
    @Size(max = 150)
    private String productName;

    @NotNull(message = "quantity không được để trống")
    @DecimalMin(value = "0.01", message = "quantity phải lớn hơn 0")
    private BigDecimal quantity;

    @NotBlank(message = "unit không được để trống")
    @Size(max = 30)
    private String unit;

    @NotNull(message = "exportDate không được để trống")
    private LocalDate exportDate;

    @Size(max = 255)
    private String traceUrl;
}
