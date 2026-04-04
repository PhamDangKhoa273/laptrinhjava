package com.bicap.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductBatchResponse {
    private Long batchId;
    private Long farmId;
    private String farmName;
    private Long seasonId;
    private String batchCode;
    private String productName;
    private BigDecimal quantity;
    private String unit;
    private LocalDate exportDate;
    private String status;
    private String traceUrl;
    private String qrCodeData;
    private String blockchainTxHash;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
