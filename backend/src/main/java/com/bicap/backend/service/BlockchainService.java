package com.bicap.backend.service;

import com.bicap.backend.entity.BlockchainTransaction;
import com.bicap.backend.entity.ProductBatch;
import com.bicap.backend.repository.BlockchainTransactionRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlockchainService {

    private final BlockchainTransactionRepository transactionRepository;

    public String saveProcess(Long processId, String actionType, String dataPayload) {
        return saveTransaction("PROCESS", processId, actionType, dataPayload).getTxHash();
    }

    public BlockchainTransaction saveTransaction(String relatedEntityType, Long relatedEntityId, String actionType, String dataPayload) {
        log.info("Mock saving to blockchain for entityType: {}, entityId: {}, action: {}",
                relatedEntityType, relatedEntityId, actionType);

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

    public BlockchainResult saveBatch(ProductBatch batch) {
        Long batchId = batch != null ? batch.getBatchId() : null;
        String payload = batch != null ? String.valueOf(batch) : "null";
        String txHash = saveTransaction("BATCH", batchId, "UPSERT", payload).getTxHash();
        return BlockchainResult.builder()
                .txHash(txHash)
                .status("SUCCESS")
                .message("Saved to mock blockchain")
                .build();
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
