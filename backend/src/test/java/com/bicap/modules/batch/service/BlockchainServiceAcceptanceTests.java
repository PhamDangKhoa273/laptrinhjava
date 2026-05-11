package com.bicap.modules.batch.service;

import com.bicap.core.enums.BlockchainGovernanceStatus;
import com.bicap.modules.batch.config.BlockchainProperties;
import com.bicap.modules.batch.entity.BlockchainTransaction;
import com.bicap.modules.batch.repository.BlockchainTransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BlockchainServiceAcceptanceTests {

    @Mock BlockchainTransactionRepository transactionRepository;
    @Mock BlockchainProperties properties;

    @InjectMocks BlockchainService service;

    @Test
    void saveTransaction_shouldPersistInternalHashWhenBlockchainDisabled() {
        when(properties.isEnabled()).thenReturn(false);
        when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = service.saveTransaction("BATCH", 1L, "UPSERT", "{\"id\":1}");

        assertThat(result.getStatus()).isEqualTo("DISABLED");
        assertThat(result.getMessage()).contains("hash nội bộ");
    }

    @Test
    void retryLatestFailedTransaction_shouldMarkRetryScheduled() {
        BlockchainTransaction tx = new BlockchainTransaction();
        tx.setTxId(1L);
        tx.setRelatedEntityType("BATCH");
        tx.setRelatedEntityId(1L);
        tx.setActionType("UPSERT");
        tx.setGovernanceStatus(BlockchainGovernanceStatus.FAILED);
        when(transactionRepository.findTopByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc("BATCH", 1L)).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = service.retryLatestFailedTransaction("BATCH", 1L);

        assertThat(result.getMessage()).contains("retry/governance");
    }
}
