package com.bicap.backend.service;

import com.bicap.backend.entity.ProductBatch;
import lombok.Builder;
import lombok.Data;
import org.springframework.stereotype.Service;

@Service
public class BlockchainService {

    public BlockchainResult saveBatch(ProductBatch batch) {
        String normalized = String.format(
                "%s-%s-%s-%s-%s",
                batch.getBatchCode(),
                batch.getSeasonId(),
                batch.getProductId(),
                batch.getHarvestDate(),
                batch.getQuantity()
        );

        return BlockchainResult.builder()
                .txHash("tx_" + Integer.toHexString(normalized.hashCode()).toUpperCase())
                .status("SUCCESS")
                .message("Mock blockchain transaction created successfully")
                .build();
    }

    @Data
    @Builder
    public static class BlockchainResult {
        private String txHash;
        private String status;
        private String message;
    }
}
