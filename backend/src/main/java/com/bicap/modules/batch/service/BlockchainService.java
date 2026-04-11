package com.bicap.modules.batch.service;

import com.bicap.modules.batch.entity.BlockchainTransaction;
import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.batch.repository.BlockchainTransactionRepository;
import com.bicap.modules.season.entity.FarmingSeason;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Service
public class BlockchainService {

    private final BlockchainTransactionRepository transactionRepository;

    public BlockchainService(BlockchainTransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public String saveProcess(Long processId, String actionType, String dataPayload) {
        return saveTransaction("PROCESS", processId, actionType, dataPayload).getTxHash();
    }

    public String saveBatch(ProductBatch batch) {
        Long batchId = (batch != null) ? batch.getBatchId() : null;
        String payload = (batch != null) ? String.valueOf(batch) : "null";
        return saveTransaction("BATCH", batchId, "UPSERT", payload).getTxHash();
    }

    public String saveSeason(FarmingSeason season) {
        if (season == null) return null;
        String payload = String.format("SEASON_ID:%d|CODE:%s|FARM:%d",
                season.getSeasonId(), season.getSeasonCode(), 
                season.getFarm().getFarmId());
        return saveTransaction("SEASON", season.getSeasonId(), "CREATE", payload).getTxHash();
    }

    public BlockchainTransaction saveTransaction(String relatedEntityType, Long relatedEntityId, String actionType, String dataPayload) {
        String simulatedHash = generateHash(dataPayload + UUID.randomUUID());

        BlockchainTransaction tx = new BlockchainTransaction();
        tx.setRelatedEntityType(relatedEntityType);
        tx.setRelatedEntityId(relatedEntityId);
        tx.setActionType(actionType);
        tx.setTxHash(simulatedHash);
        tx.setTxStatus("SUCCESS");

        return transactionRepository.save(tx);
    }

    private String generateHash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * encodedHash.length);
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error generating hash", e);
        }
    }
}
