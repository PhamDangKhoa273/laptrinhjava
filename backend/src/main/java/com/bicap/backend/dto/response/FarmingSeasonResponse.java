package com.bicap.backend.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmingSeasonResponse {
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
