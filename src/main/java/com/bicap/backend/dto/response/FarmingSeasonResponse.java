package com.bicap.backend.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class FarmingSeasonResponse {
    private Long id;
    private Long farmId;
    private String farmName;
    private String name;
    private String plantName;
    private LocalDate startDate;
    private LocalDate expectedEndDate;
    private String status;
    private String blockchainTxHash;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
