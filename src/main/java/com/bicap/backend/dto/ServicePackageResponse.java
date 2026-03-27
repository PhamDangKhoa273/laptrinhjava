package com.bicap.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}