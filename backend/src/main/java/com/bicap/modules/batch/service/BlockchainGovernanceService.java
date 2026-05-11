package com.bicap.modules.batch.service;

import com.bicap.core.enums.BlockchainGovernanceStatus;
import com.bicap.core.enums.PermissionName;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.AuthorizationService;
import com.bicap.modules.batch.config.BlockchainProperties;
import com.bicap.modules.batch.dto.BlockchainGovernanceConfigResponse;
import com.bicap.modules.batch.dto.BlockchainTransactionResponse;
import com.bicap.modules.batch.dto.DeployContractRequest;
import com.bicap.modules.batch.dto.DeployContractResponse;
import com.bicap.modules.batch.entity.BlockchainTransaction;
import com.bicap.modules.batch.repository.BlockchainTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class BlockchainGovernanceService {
    private static final String PLACEHOLDER_CONTRACT = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
    private static final String PLACEHOLDER_RPC = "YOUR_PROJECT_ID";
    private static final String PLACEHOLDER_KEY = "YOUR_WALLET_PRIVATE_KEY";

    private final BlockchainTransactionRepository transactionRepository;
    private final BlockchainProperties properties;
    private final AuthorizationService authorizationService;

    public BlockchainGovernanceService(BlockchainTransactionRepository transactionRepository,
                                       BlockchainProperties properties,
                                       AuthorizationService authorizationService) {
        this.transactionRepository = transactionRepository;
        this.properties = properties;
        this.authorizationService = authorizationService;
    }

    public BlockchainGovernanceConfigResponse getConfig() {
        GovernanceReadiness readiness = evaluateReadiness(properties.getContractAddress(), false);
        BlockchainGovernanceConfigResponse response = new BlockchainGovernanceConfigResponse();
        response.setContractName("BICAP Traceability Contract");
        response.setContractAddress(maskEmpty(properties.getContractAddress()));
        response.setContractVersion("v1");
        response.setContractNetwork("VeChainThor");
        response.setEnabled(properties.isEnabled());
        response.setActive(readiness.readyForRead());
        response.setDeploymentStatus(readiness.deploymentStatus());
        response.setGovernanceStatus(readiness.readyForRead() ? "READY" : "NEEDS_CONFIG");
        response.setGovernanceNote(readiness.note());
        response.setReadinessScore(readiness.score());
        response.setMissingRequirements(readiness.missingRequirements());
        response.setWriteMode(readiness.readyForWrite());
        response.setSafeMode(!readiness.readyForWrite());
        response.setLastCheckedAt(LocalDateTime.now());
        return response;
    }

    public List<BlockchainTransactionResponse> getTransactions() {
        return transactionRepository.findAll().stream().map(this::map).toList();
    }

    public List<BlockchainTransactionResponse> getTransactionsByEntity(String entityType, Long entityId) {
        return transactionRepository.findByRelatedEntityTypeAndRelatedEntityId(normalizeEntityType(entityType), entityId).stream()
                .map(this::map)
                .toList();
    }

    public BlockchainTransactionResponse retryLatestFailed(String entityType, Long entityId) {
        authorizationService.requirePermission(PermissionName.BLOCKCHAIN_GOVERNANCE);
        BlockchainTransaction latest = transactionRepository.findTopByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc(
                        normalizeEntityType(entityType), entityId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy transaction"));
        if (latest.getGovernanceStatus() != BlockchainGovernanceStatus.FAILED) {
            throw new BusinessException("Chỉ transaction FAILED mới được retry");
        }
        latest.setGovernanceStatus(BlockchainGovernanceStatus.RETRY_SCHEDULED);
        latest.setTxStatus("RETRY_SCHEDULED");
        latest.setGovernanceNote("Admin scheduled governance retry");
        latest.setRetryCount((latest.getRetryCount() == null ? 0 : latest.getRetryCount()) + 1);
        latest.setLastRetryAt(LocalDateTime.now());
        return map(transactionRepository.save(latest));
    }

    /**
     * Production-safe governance action: validates and records readiness. It does not deploy or mutate
     * production contracts. Real deployment requires a separate secure key-management and release workflow.
     */
    public DeployContractResponse deployOrValidateContract(DeployContractRequest request) {
        authorizationService.requirePermission(PermissionName.BLOCKCHAIN_GOVERNANCE);
        boolean dryRun = request == null || request.isDryRun();
        String requestedAddress = StringUtils.hasText(request != null ? request.getContractAddress() : null)
                ? request.getContractAddress().trim()
                : properties.getContractAddress();
        GovernanceReadiness readiness = evaluateReadiness(requestedAddress, !dryRun);

        DeployContractResponse response = new DeployContractResponse();
        response.setEnabled(properties.isEnabled());
        response.setContractAddress(maskEmpty(requestedAddress));
        response.setActive(dryRun ? readiness.readyForRead() : readiness.readyForWrite());
        response.setDeploymentStatus(dryRun ? readiness.deploymentStatus() : readiness.writeStatus());
        response.setNote(readiness.note());

        BlockchainGovernanceStatus governanceStatus = response.isActive()
                ? BlockchainGovernanceStatus.GOVERNED
                : BlockchainGovernanceStatus.FAILED;
        persistGovernanceRecord(
                dryRun ? "GOVERNANCE_VALIDATE" : "GOVERNANCE_WRITE_VALIDATE",
                response.getDeploymentStatus(),
                response.getNote(),
                requestedAddress,
                governanceStatus
        );
        return response;
    }

    private GovernanceReadiness evaluateReadiness(String contractAddress, boolean requireWriteKey) {
        List<String> missing = new ArrayList<>();
        if (!properties.isEnabled()) {
            missing.add("blockchain.enabled=true");
        }
        if (!hasRpc()) {
            missing.add("BLOCKCHAIN_RPC_URL");
        }
        if (!hasContractAddress(contractAddress)) {
            missing.add("BLOCKCHAIN_CONTRACT_ADDRESS");
        }
        if (requireWriteKey && !hasPrivateKey()) {
            missing.add("BLOCKCHAIN_PRIVATE_KEY hoặc Vault/KMS signing key");
        }

        boolean readyForRead = properties.isEnabled() && hasRpc() && hasContractAddress(contractAddress);
        boolean readyForWrite = readyForRead && hasPrivateKey();
        int score = computeScore(contractAddress);
        String deploymentStatus;
        String writeStatus;
        String note;
        if (!properties.isEnabled()) {
            deploymentStatus = "DISABLED";
            writeStatus = "DISABLED";
            note = "Blockchain governance đang tắt; bật blockchain.enabled và cấu hình VeChainThor để kích hoạt.";
        } else if (!hasRpc()) {
            deploymentStatus = "NEEDS_RPC";
            writeStatus = "NEEDS_RPC";
            note = "Thiếu RPC/VeChainThor node URL hợp lệ.";
        } else if (!hasContractAddress(contractAddress)) {
            deploymentStatus = "NEEDS_CONTRACT_ADDRESS";
            writeStatus = "NEEDS_CONTRACT_ADDRESS";
            note = "Thiếu contract/to-address hợp lệ cho governance traceability.";
        } else if (!hasPrivateKey()) {
            deploymentStatus = "CONFIG_VALID_READ_ONLY";
            writeStatus = "NEEDS_PRIVATE_KEY";
            note = "VeChainThor readiness hợp lệ ở chế độ read/verify; ghi on-chain cần private key hoặc Vault/KMS.";
        } else {
            deploymentStatus = "READY";
            writeStatus = "READY_FOR_GOVERNANCE_WRITE";
            note = "VeChainThor governance đã sẵn sàng; endpoint hiện chỉ validate/manage, không tự deploy contract production.";
        }
        return new GovernanceReadiness(readyForRead, readyForWrite, score, missing, deploymentStatus, writeStatus, note);
    }

    private int computeScore(String contractAddress) {
        int score = 0;
        if (properties.isEnabled()) score += 25;
        if (hasRpc()) score += 30;
        if (hasContractAddress(contractAddress)) score += 30;
        if (hasPrivateKey()) score += 15;
        return score;
    }

    private boolean hasRpc() {
        return StringUtils.hasText(properties.getRpcUrl()) && !properties.getRpcUrl().contains(PLACEHOLDER_RPC);
    }

    private boolean hasPrivateKey() {
        return StringUtils.hasText(properties.getPrivateKey()) && !properties.getPrivateKey().contains(PLACEHOLDER_KEY);
    }

    private boolean hasContractAddress(String contractAddress) {
        if (!StringUtils.hasText(contractAddress) || PLACEHOLDER_CONTRACT.equalsIgnoreCase(contractAddress.trim())) {
            return false;
        }
        String normalized = contractAddress.trim();
        return normalized.equalsIgnoreCase("N/A")
                || normalized.matches("^0x[a-fA-F0-9]{40}$")
                || normalized.length() >= 20;
    }

    private String normalizeEntityType(String entityType) {
        if (!StringUtils.hasText(entityType)) {
            throw new BusinessException("entityType là bắt buộc");
        }
        return entityType.trim().toUpperCase(Locale.ROOT);
    }

    private String maskEmpty(String value) {
        return StringUtils.hasText(value) ? value.trim() : "N/A";
    }

    private void persistGovernanceRecord(String actionType,
                                         String status,
                                         String note,
                                         String contractAddress,
                                         BlockchainGovernanceStatus governanceStatus) {
        BlockchainTransaction tx = new BlockchainTransaction();
        tx.setRelatedEntityType("GOVERNANCE");
        tx.setRelatedEntityId(0L);
        tx.setActionType(actionType);
        tx.setTxHash(maskEmpty(contractAddress));
        tx.setTxStatus(status);
        tx.setGovernanceStatus(governanceStatus);
        tx.setGovernanceNote(note);
        tx.setTxOrigin("BLOCKCHAIN_GOVERNANCE_SERVICE");
        tx.setTxSeed("gov-" + actionType + "-" + LocalDateTime.now());
        tx.setDataPayload("status=" + status + "; note=" + note);
        transactionRepository.save(tx);
    }

    private BlockchainTransactionResponse map(BlockchainTransaction tx) {
        BlockchainTransactionResponse response = new BlockchainTransactionResponse();
        response.setTxId(tx.getTxId());
        response.setRelatedEntityType(tx.getRelatedEntityType());
        response.setRelatedEntityId(tx.getRelatedEntityId());
        response.setActionType(tx.getActionType());
        response.setTxHash(tx.getTxHash());
        response.setTxStatus(tx.getTxStatus());
        response.setGovernanceStatus(tx.getGovernanceStatus() != null ? tx.getGovernanceStatus().name() : null);
        response.setGovernanceNote(tx.getGovernanceNote());
        response.setRetryCount(tx.getRetryCount());
        response.setLastRetryAt(tx.getLastRetryAt());
        response.setCreatedAt(tx.getCreatedAt());
        return response;
    }

    private record GovernanceReadiness(boolean readyForRead,
                                       boolean readyForWrite,
                                       int score,
                                       List<String> missingRequirements,
                                       String deploymentStatus,
                                       String writeStatus,
                                       String note) {
    }
}
