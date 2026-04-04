package com.bicap.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ServicePackageResponse {
    private Long packageId;
    private String packageCode;
    private String packageName;
    private BigDecimal price;
    private Integer durationDays;
    private Integer maxSeasons;
    private Integer maxListings;
    private String description;
    private String status;
}