package com.bicap.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateServicePackageRequest {
    @NotBlank(message = "packageCode không được để trống")
    private String packageCode;

    @NotBlank(message = "packageName không được để trống")
    private String packageName;

    @NotNull(message = "price không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "price phải lớn hơn 0")
    private BigDecimal price;

    @NotNull(message = "durationDays không được để trống")
    @Positive(message = "durationDays phải lớn hơn 0")
    private Integer durationDays;

    @NotNull(message = "maxSeasons không được để trống")
    @PositiveOrZero(message = "maxSeasons không được âm")
    private Integer maxSeasons;

    @NotNull(message = "maxListings không được để trống")
    @PositiveOrZero(message = "maxListings không được âm")
    private Integer maxListings;

    private String description;
    private String status;
}
