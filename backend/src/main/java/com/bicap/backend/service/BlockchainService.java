package com.bicap.backend.service;

import com.bicap.backend.entity.ProductBatch;
import lombok.Builder;
import lombok.Data;
import org.springframework.stereotype.Service;

@Service
public class BlockchainService {

    public BlockchainResult saveBatch(ProductBatch batch) {
        try {
            String normalized = String.format(
                    "%s-%s-%s-%s-%s-%s",
                    batch.getBatchCode(),
                    batch.getSeasonId(),
                    batch.getProductId(),
                    batch.getHarvestDate(),
                    batch.getQuantity(),
                    batch.getQualityGrade()
            );

            return BlockchainResult.builder()
                    .txHash("tx_" + Integer.toHexString(normalized.hashCode()).toUpperCase())
                    .status("SUCCESS")
                    .message("Mock blockchain transaction created successfully")
                    .build();
        } catch (Exception ex) {
            return BlockchainResult.builder()
                    .txHash(null)
                    .status("FAILED")
                    .message("Mock blockchain transaction failed: " + ex.getMessage())
                    .build();
        }
    }

    @Data
    @Builder
    public static class BlockchainResult {
        private String txHash;
        private String status;
        private String message;
    }
}

