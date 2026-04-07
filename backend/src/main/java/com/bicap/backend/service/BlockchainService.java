package com.bicap.backend.service;

<<<<<<< HEAD:src/main/java/com/bicap/backend/service/BlockchainService.java
import com.bicap.backend.entity.FarmingSeason;

public interface BlockchainService {
    String saveSeasonToBlockchain(FarmingSeason season);
=======
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

    public BlockchainTransaction saveTransaction(String relatedEntityType, Long relatedEntityId, String actionType, String dataPayload) {
        System.out.println("Mock saving to blockchain for entityType: " + relatedEntityType + ", entityId: " + relatedEntityId + ", action: " + actionType);

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
        Long batchId = (batch != null) ? batch.getBatchId() : null;
        String payload = (batch != null) ? String.valueOf(batch) : "null";
        String txHash = saveTransaction("BATCH", batchId, "UPSERT", payload).getTxHash();
        
        BlockchainResult res = new BlockchainResult();
        res.setTxHash(txHash);
        res.setStatus("SUCCESS");
        res.setMessage("Saved to mock blockchain");
        return res;
    }

    public String saveSeasonToBlockchain(com.bicap.backend.entity.FarmingSeason season) {
        System.out.println("Saving season " + season.getSeasonCode() + " to blockchain...");
        String payload = String.format("SEASON_ID:%d|CODE:%s|FARM:%d|PROD:%d|START:%s",
                season.getSeasonId(), season.getSeasonCode(), 
                season.getFarm().getFarmId(), season.getProduct().getProductId(),
                season.getStartDate());
        return saveTransaction("SEASON", season.getSeasonId(), "CREATE", payload).getTxHash();
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

        public String getTxHash() { return txHash; }
        public void setTxHash(String txHash) { this.txHash = txHash; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public static class BlockchainResultBuilder {
            private String txHash;
            private String status;
            private String message;
            public BlockchainResultBuilder txHash(String h) { this.txHash = h; return this; }
            public BlockchainResultBuilder status(String s) { this.status = s; return this; }
            public BlockchainResultBuilder message(String m) { this.message = m; return this; }
            public BlockchainResult build() {
                BlockchainResult res = new BlockchainResult();
                res.setTxHash(this.txHash);
                res.setStatus(this.status);
                res.setMessage(this.message);
                return res;
            }
        }
        public static BlockchainResultBuilder builder() { return new BlockchainResultBuilder(); }
    }
>>>>>>> d2684be:backend/src/main/java/com/bicap/backend/service/BlockchainService.java
}
