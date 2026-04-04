package com.bicap.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateProductBatchRequest {

    private Long seasonId;

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

    @NotBlank(message = "status không được để trống")
    @Size(max = 30)
    private String status;

    @Size(max = 255)
    private String traceUrl;
}
