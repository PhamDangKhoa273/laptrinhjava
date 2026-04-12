package com.bicap.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeasonResponse {
    private Long id;
    private Long farmId;
    private String farmName;
    private Long productId;
    private String productCode;
    private String productName;
    private String seasonCode;
    private LocalDate startDate;
    private LocalDate expectedHarvestDate;
    private LocalDate actualHarvestDate;
    private String farmingMethod;
    private String seasonStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
