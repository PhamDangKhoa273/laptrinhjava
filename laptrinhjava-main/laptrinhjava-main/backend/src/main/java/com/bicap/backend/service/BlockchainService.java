package com.bicap.backend.service;

import com.bicap.backend.entity.BlockchainTransaction;
import com.bicap.backend.entity.ProductBatch;
import com.bicap.backend.repository.BlockchainTransactionRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BlockchainService {

    private final BlockchainTransactionRepository transactionRepository;

    public String saveProcess(Long processId, String actionType, String dataPayload) {
        return saveTransaction("PROCESS", processId, actionType, dataPayload).getTxHash();
    }

    public String saveBatch(ProductBatch batch) {
        Long batchId = (batch != null) ? batch.getBatchId() : null;
        String payload = (batch != null) ? String.valueOf(batch) : "null";
        return saveTransaction("BATCH", batchId, "UPSERT", payload).getTxHash();
    }

    public String saveSeason(com.bicap.backend.entity.FarmingSeason season) {
        if (season == null) return null;
        String payload = String.format("SEASON_ID:%d|CODE:%s|FARM:%d|PROD:%d|START:%s",
                season.getSeasonId(), season.getSeasonCode(), 
                season.getFarm().getFarmId(), season.getProduct().getProductId(),
                season.getStartDate());
        return saveTransaction("SEASON", season.getSeasonId(), "CREATE", payload).getTxHash();
    }

    public BlockchainTransaction saveTransaction(String relatedEntityType, Long relatedEntityId, String actionType, String dataPayload) {
        System.out.println("Processing Blockchain Transaction: [" + relatedEntityType + "] ID: " + relatedEntityId + " Action: " + actionType);

        String simulatedHash = generateHash(dataPayload + UUID.randomUUID());

        BlockchainTransaction tx = BlockchainTransaction.builder()
                .relatedEntityType(relatedEntityType)
                .relatedEntityId(relatedEntityId)
                .actionType(actionType)
                .txHash(simulatedHash)
                .txStatus("SUCCESS")
                .build();

        return transactionRepository.save(tx);
    }

    private String generateHash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * encodedHash.length);
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error generating hash", e);
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlockchainResult {
        private String txHash;
        private String status;
        private String message;
    }
}
