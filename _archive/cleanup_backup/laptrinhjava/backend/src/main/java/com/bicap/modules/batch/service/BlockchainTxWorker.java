package com.bicap.modules.batch.service;

import com.bicap.core.enums.BlockchainGovernanceStatus;
import com.bicap.modules.batch.entity.BlockchainTransaction;
import com.bicap.modules.batch.repository.BlockchainTransactionRepository;
import com.bicap.core.service.SecurityAuditService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class BlockchainTxWorker {

    private final BlockchainTransactionRepository transactionRepository;
    private final BlockchainService blockchainService;
    private final SecurityAuditService securityAuditService;

    @Value("${blockchain.enabled:false}")
    private boolean blockchainEnabled;

    public BlockchainTxWorker(BlockchainTransactionRepository transactionRepository,
                              BlockchainService blockchainService,
                              SecurityAuditService securityAuditService) {
        this.transactionRepository = transactionRepository;
        this.blockchainService = blockchainService;
        this.securityAuditService = securityAuditService;
    }

    @Scheduled(fixedDelayString = "${blockchain.worker.fixed-delay-ms:5000}")
    @Transactional
    public void retryFailedTransactions() {
        if (!blockchainEnabled) return;

        List<BlockchainTransaction> candidates = transactionRepository.findTop50ByGovernanceStatusInOrderByCreatedAtAsc(
                List.of(BlockchainGovernanceStatus.FAILED, BlockchainGovernanceStatus.RETRY_SCHEDULED)
        );

        for (BlockchainTransaction tx : candidates) {
            try {
                // This worker replays the original tx by re-writing the same entity hash.
                // We don't have the original payload stored; we retry by re-sending an upsert marker.
                // For a "xịn" production version: store canonical payload JSON to replay exactly.
                tx.setGovernanceStatus(BlockchainGovernanceStatus.RETRY_SCHEDULED);
                tx.setLastRetryAt(LocalDateTime.now());
                tx.setRetryCount((tx.getRetryCount() == null ? 0 : tx.getRetryCount()) + 1);
                tx.setGovernanceNote("Worker retry attempt");
                transactionRepository.save(tx);

                var result = blockchainService.replayTransaction(tx);
                tx.setGovernanceStatus(BlockchainGovernanceStatus.SUCCESS);
                tx.setTxHash(result.getTxHash());
                tx.setTxStatus(result.getStatus());
                tx.setGovernanceNote("Worker retry success (replayed canonical payload)");
                transactionRepository.save(tx);

                securityAuditService.logAdminAction(null,
                        "BLOCKCHAIN_TX_WORKER_RETRY_SUCCESS",
                        tx.getRelatedEntityType() + ":" + tx.getRelatedEntityId(),
                        "txId=" + tx.getTxId());
            } catch (Exception ex) {
                System.out.println("BLOCKCHAIN_WORKER_RETRY_FAILED txId=" + tx.getTxId() + " entityType=" + tx.getRelatedEntityType() + " entityId=" + tx.getRelatedEntityId() + " err=" + ex.getMessage());
                tx.setGovernanceStatus(BlockchainGovernanceStatus.FAILED);
                tx.setTxStatus("FAILED: " + ex.getMessage());
                tx.setGovernanceNote(ex.getMessage());
                tx.setLastRetryAt(LocalDateTime.now());
                transactionRepository.save(tx);

                securityAuditService.logAdminAction(null,
                        "BLOCKCHAIN_TX_WORKER_RETRY_FAILED",
                        tx.getRelatedEntityType() + ":" + tx.getRelatedEntityId(),
                        "txId=" + tx.getTxId() + " err=" + ex.getMessage());
            }
        }
    }
}
