package com.bicap.modules.vechain.service;

import com.bicap.core.enums.BlockchainGovernanceStatus;
import com.bicap.modules.batch.entity.BlockchainTransaction;
import com.bicap.modules.batch.repository.BlockchainTransactionRepository;
import com.bicap.modules.vechain.config.VeChainThorProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class VeChainProofServiceTests {

    @Test
    void commitAndTrack_shouldQueueEnabledVeChainCommit() {
        VeChainThorProperties properties = new VeChainThorProperties();
        properties.setEnabled(true);
        BlockchainTransactionRepository repository = mock(BlockchainTransactionRepository.class);
        when(repository.save(any(BlockchainTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VeChainProofService service = new VeChainProofService(properties, new ObjectMapper(), repository);

        BlockchainTransaction tx = service.commitAndTrack(
                "SEASON_EXPORT",
                10L,
                "EXPORT",
                "{\"seasonId\":10}",
                "abc123",
                "TRACE-SEASON-10"
        );

        assertThat(tx.getGovernanceStatus()).isEqualTo(BlockchainGovernanceStatus.PENDING);
        assertThat(tx.getTxStatus()).isEqualTo("QUEUED");
        assertThat(tx.getTxHash()).isEqualTo("QUEUED-abc123");
        assertThat(tx.getTxSeed()).isEqualTo("TRACE-SEASON-10|abc123");
    }
}
