package com.bicap.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class TraceBatchResponse {
    private Long batchId;
    private String batchCode;
    private Long seasonId;
    private Long productId;
    private LocalDate harvestDate;
    private BigDecimal quantity;
    private BigDecimal availableQuantity;
    private String qualityGrade;
    private LocalDate expiryDate;
    private String batchStatus;
    private String qrUrl;
    private String txHash;
    private String txStatus;
    private LocalDateTime lastBlockchainSyncAt;
}
