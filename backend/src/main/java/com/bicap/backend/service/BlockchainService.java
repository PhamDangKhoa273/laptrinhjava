package com.bicap.backend.service;

import com.bicap.backend.entity.ProductBatch;
import org.springframework.stereotype.Service;

@Service
public class BlockchainService {

    public String saveProductBatch(ProductBatch productBatch) {
        String normalized = String.format(
                "%s-%s-%s-%s",
                productBatch.getBatchCode(),
                productBatch.getSeasonId(),
                productBatch.getProductName(),
                productBatch.getExportDate()
        );
        return "tx_" + Integer.toHexString(normalized.hashCode()).toUpperCase();
    }
}
