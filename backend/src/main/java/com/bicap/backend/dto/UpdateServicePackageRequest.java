package com.bicap.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateServicePackageRequest {
    private String packageName;

    @DecimalMin(value = "0.0", inclusive = false, message = "price phải lớn hơn 0")
    private BigDecimal price;

    @Positive(message = "durationDays phải lớn hơn 0")
    private Integer durationDays;

    @PositiveOrZero(message = "maxSeasons không được âm")
    private Integer maxSeasons;

    @PositiveOrZero(message = "maxListings không được âm")
    private Integer maxListings;

    private String description;
    private String status;
}   
