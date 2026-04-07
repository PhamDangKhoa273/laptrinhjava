package com.bicap.backend.service;

import com.bicap.backend.entity.FarmingSeason;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class MockBlockchainServiceImpl implements BlockchainService {

    @Override
    public String saveSeasonToBlockchain(FarmingSeason season) {
        // Simulate network delay for calling VeChain node
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Mock a transaction hash matching typical blockchain hash format
        // In real VeChain usage, this would be a hash returned by the node when submitting a smart contract transaction
        return "0x" + UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "").substring(0, 32);
    }
}
