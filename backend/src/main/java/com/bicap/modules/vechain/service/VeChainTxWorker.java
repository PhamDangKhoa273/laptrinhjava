package com.bicap.modules.vechain.service;

import com.bicap.core.enums.BlockchainGovernanceStatus;
import com.bicap.core.service.SecurityAuditService;
import com.bicap.modules.batch.entity.BlockchainTransaction;
import com.bicap.modules.batch.repository.BlockchainTransactionRepository;
import com.bicap.modules.vechain.config.VeChainThorProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class VeChainTxWorker {
    private final BlockchainTransactionRepository transactionRepository;
    private final VeChainProofService veChainProofService;
    private final VeChainThorProperties properties;
    private final SecurityAuditService securityAuditService;

    public VeChainTxWorker(BlockchainTransactionRepository transactionRepository,
                           VeChainProofService veChainProofService,
                           VeChainThorProperties properties,
                           SecurityAuditService securityAuditService) {
        this.transactionRepository = transactionRepository;
        this.veChainProofService = veChainProofService;
        this.properties = properties;
        this.securityAuditService = securityAuditService;
    }

    @Scheduled(fixedDelayString = "${vechain.thor.worker-delay-ms:5000}")
    public void processQueue() {
        if (!properties.isEnabled()) return;

        List<Long> claimedIds = claimQueuedTransactions();
        if (claimedIds.isEmpty()) return;

        int concurrency = Math.max(1, properties.getWorkerConcurrency());
        ExecutorService executor = Executors.newFixedThreadPool(Math.min(concurrency, claimedIds.size()));
        try {
            List<Callable<Void>> tasks = claimedIds.stream()
                    .<Callable<Void>>map(txId -> () -> {
                        processOne(txId);
                        return null;
                    })
                    .toList();
            executor.invokeAll(tasks);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            log.warn("VeChain worker interrupted while processing {} jobs", claimedIds.size(), ex);
        } finally {
            executor.shutdown();
            try {
                executor.awaitTermination(30, TimeUnit.SECONDS);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
            }
        }
    }

    protected List<Long> claimQueuedTransactions() {
        int batchSize = Math.max(1, properties.getWorkerBatchSize());
        List<BlockchainTransaction> candidates = transactionRepository.findByGovernanceStatusInOrderByCreatedAtAsc(
                List.of(BlockchainGovernanceStatus.PENDING, BlockchainGovernanceStatus.FAILED, BlockchainGovernanceStatus.RETRY_SCHEDULED)
        ).stream()
                .filter(tx -> "SEASON_EXPORT".equalsIgnoreCase(tx.getRelatedEntityType()))
                .limit(batchSize)
                .toList();

        List<Long> claimedIds = new ArrayList<>();
        for (BlockchainTransaction tx : candidates) {
            tx.setGovernanceStatus(BlockchainGovernanceStatus.PROCESSING);
            tx.setTxStatus("PROCESSING");
            tx.setLastRetryAt(LocalDateTime.now());
            tx.setRetryCount((tx.getRetryCount() == null ? 0 : tx.getRetryCount()) + 1);
            tx.setGovernanceNote("Claimed by VeChain async worker");
            transactionRepository.save(tx);
            claimedIds.add(tx.getTxId());
        }
        return claimedIds;
    }

    private void processOne(Long txId) {
        try {
            BlockchainTransaction result = veChainProofService.processQueuedTransaction(txId);
            securityAuditService.logAdminAction(null,
                    result.getGovernanceStatus() == BlockchainGovernanceStatus.SUCCESS
                            ? "VECHAIN_TX_WORKER_SUCCESS"
                            : "VECHAIN_TX_WORKER_FAILED",
                    result.getRelatedEntityType() + ":" + result.getRelatedEntityId(),
                    "txId=" + result.getTxId() + " status=" + result.getGovernanceStatus());
        } catch (Throwable ex) {
            log.warn("VeChain worker failed txId={}: {}", txId, ex.getMessage(), ex);
        }
    }
}
