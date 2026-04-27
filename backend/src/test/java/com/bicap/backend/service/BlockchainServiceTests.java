package com.bicap.backend.service;

import com.bicap.core.enums.BlockchainGovernanceStatus;
import com.bicap.modules.batch.config.BlockchainProperties;
import com.bicap.modules.batch.dto.BlockchainResult;
import com.bicap.modules.batch.entity.BlockchainTransaction;
import com.bicap.modules.batch.repository.BlockchainTransactionRepository;
import com.bicap.modules.batch.service.BlockchainService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BlockchainServiceTests {

    @Mock private BlockchainTransactionRepository transactionRepository;
    @Mock private BlockchainProperties blockchainProperties;

    @InjectMocks
    private BlockchainService blockchainService;

    @Test
    void retryLatestFailedTransaction_shouldRejectNonFailedStatus() {
        BlockchainTransaction tx = new BlockchainTransaction();
        tx.setGovernanceStatus(BlockchainGovernanceStatus.SUCCESS);
        when(transactionRepository.findTopByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc("ORDER", 1L))
                .thenReturn(Optional.of(tx));

        assertThrows(RuntimeException.class, () -> blockchainService.retryLatestFailedTransaction("ORDER", 1L));
    }

    @Test
    void retryLatestFailedTransaction_shouldScheduleRetry() {
        BlockchainTransaction tx = new BlockchainTransaction();
        tx.setGovernanceStatus(BlockchainGovernanceStatus.FAILED);
        tx.setRetryCount(1);
        when(transactionRepository.findTopByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc("ORDER", 1L))
                .thenReturn(Optional.of(tx));
        when(transactionRepository.save(any(BlockchainTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BlockchainResult result = blockchainService.retryLatestFailedTransaction("ORDER", 1L);
        assertEquals("Đã đánh dấu transaction để retry/governance.", result.getMessage());
        assertEquals(BlockchainGovernanceStatus.RETRY_SCHEDULED, tx.getGovernanceStatus());
        assertEquals(2, tx.getRetryCount());
    }
}
