package com.bicap.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateServicePackageRequest {
    private String packageCode;
    private String packageName;
    private BigDecimal price;
    private Integer durationDays;
    private Integer maxSeasons;
    private Integer maxListings;
    private String status;
}