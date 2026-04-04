package com.bicap.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BatchResponse {
    private Long batchId;
    private Long seasonId;
    private Long productId;
    private String batchCode;
    private LocalDate harvestDate;
    private BigDecimal quantity;
    private BigDecimal availableQuantity;
    private String qualityGrade;
    private LocalDate expiryDate;
    private String batchStatus;
    private String latestTxHash;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
