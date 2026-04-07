package com.bicap.backend.dto.trace;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
    private QrCodeResponse qrInfo;
    private String txHash;
    private String txStatus;
    private LocalDateTime lastBlockchainSyncAt;
    private Map<String, Object> seasonInfo;
    private List<Map<String, Object>> processList;
    private String note;
}

