package com.bicap.backend.service;

import com.bicap.backend.entity.BlockchainTransaction;
import com.bicap.backend.repository.BlockchainTransactionRepository;
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
        log.info("Mock saving to blockchain for processId: {}, action: {}", processId, actionType);
        
        String simulatedHash = generateHash(dataPayload + UUID.randomUUID().toString());
        
        BlockchainTransaction tx = BlockchainTransaction.builder()
                .relatedEntityType("PROCESS")
                .relatedEntityId(processId)
                .actionType(actionType) // CREATE or UPDATE
                .txHash(simulatedHash)
                .txStatus("SUCCESS")
                .build();
                
        transactionRepository.save(tx);
        return simulatedHash;
    }
    
    private String generateHash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * encodedhash.length);
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if(hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error generating hash", e);
        }
    }
}
