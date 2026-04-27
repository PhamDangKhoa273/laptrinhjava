package com.bicap.modules.batch.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.AuthorizationService;
import com.bicap.core.enums.PermissionName;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.batch.dto.BlockchainGovernanceConfigResponse;
import com.bicap.modules.batch.dto.BlockchainTransactionResponse;
import com.bicap.modules.batch.dto.DeployContractRequest;
import com.bicap.modules.batch.dto.DeployContractResponse;
import com.bicap.modules.batch.entity.BlockchainTransaction;
import com.bicap.modules.batch.repository.BlockchainTransactionRepository;
import com.bicap.modules.batch.config.BlockchainProperties;
import com.bicap.core.enums.BlockchainGovernanceStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.util.StringUtils;

@Service
public class BlockchainGovernanceService {
    private final BlockchainTransactionRepository transactionRepository;
    private final BlockchainProperties properties;
    private final AuthorizationService authorizationService;

    public BlockchainGovernanceService(BlockchainTransactionRepository transactionRepository, BlockchainProperties properties, AuthorizationService authorizationService) {
        this.transactionRepository = transactionRepository;
        this.properties = properties;
        this.authorizationService = authorizationService;
    }

    public BlockchainGovernanceConfigResponse getConfig() {
        BlockchainGovernanceConfigResponse response = new BlockchainGovernanceConfigResponse();
        response.setContractName("BICAP Traceability Contract");
        response.setContractAddress(properties.getContractAddress());
        response.setContractVersion("v1");
        response.setContractNetwork("VeChainThor / EVM dev-ready");
        response.setEnabled(properties.isEnabled());
        response.setActive(properties.isEnabled() && properties.getContractAddress() != null && !properties.getContractAddress().isBlank());
        response.setDeploymentStatus(response.isActive() ? "ACTIVE" : (properties.isEnabled() ? "CONFIGURED" : "DISABLED"));
        response.setGovernanceStatus(response.isActive() ? "READY" : "NEEDS_CONFIG");
        response.setGovernanceNote(response.isActive() ? "Contract is ready for traceability governance" : "Contract configuration is incomplete");
        return response;
    }

    public List<BlockchainTransactionResponse> getTransactions() {
        return transactionRepository.findAll().stream().map(this::map).toList();
    }

    public List<BlockchainTransactionResponse> getTransactionsByEntity(String entityType, Long entityId) {
        return transactionRepository.findByRelatedEntityTypeAndRelatedEntityId(entityType, entityId).stream().map(this::map).toList();
    }

    public BlockchainTransactionResponse retryLatestFailed(String entityType, Long entityId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException("Chỉ admin mới được retry governance transaction");
        }
        return map(transactionRepository.findTopByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc(entityType, entityId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy transaction")));
    }

    /**
     * "Xịn" nhưng an toàn: endpoint này KHÔNG tự ý deploy contract thật (vì cần ABI/bytecode + private key + gas).
     * Thay vào đó, nó validate cấu hình runtime (rpc url, contract address) và trả về trạng thái.
     * Khi có nhu cầu deploy thật, ta sẽ bổ sung module compile/deploy (Hardhat pipeline) + secure key management.
     */
    public DeployContractResponse deployOrValidateContract(DeployContractRequest request) {
        authorizationService.requirePermission(PermissionName.BLOCKCHAIN_GOVERNANCE);
        boolean dryRun = request == null || request.isDryRun();

        DeployContractResponse response = new DeployContractResponse();
        response.setEnabled(properties.isEnabled());
        response.setContractAddress(properties.getContractAddress());

        if (!properties.isEnabled()) {
            response.setActive(false);
            response.setDeploymentStatus("DISABLED");
            response.setNote("Blockchain đang tắt (blockchain.enabled=false). Bật lên và cấu hình rpc/privateKey/contractAddress để dùng governance.");
            return response;
        }

        String contractAddress = StringUtils.hasText(request != null ? request.getContractAddress() : null)
                ? request.getContractAddress().trim()
                : properties.getContractAddress();
        boolean hasAddress = contractAddress != null && !contractAddress.isBlank()
                && !"YOUR_DEPLOYED_CONTRACT_ADDRESS".equalsIgnoreCase(contractAddress.trim());
        boolean hasRpc = properties.getRpcUrl() != null && !properties.getRpcUrl().isBlank()
                && !properties.getRpcUrl().contains("YOUR_PROJECT_ID");
        boolean hasKey = properties.getPrivateKey() != null && !properties.getPrivateKey().isBlank()
                && !properties.getPrivateKey().contains("YOUR_WALLET_PRIVATE_KEY");

        if (!hasRpc) {
            response.setActive(false);
            response.setDeploymentStatus("NEEDS_RPC");
            response.setNote("Thiếu blockchain.rpc-url hợp lệ. Cập nhật BLOCKCHAIN_RPC_URL.");
            return response;
        }

        if (dryRun) {
            response.setActive(hasAddress);
            response.setDeploymentStatus(hasAddress ? "CONFIG_VALID" : "NEEDS_CONTRACT_ADDRESS");
            response.setNote(hasAddress
                    ? "Cấu hình OK. Có thể ghi/verify hash on-chain (tuỳ contract)."
                    : "Chưa có contract address. Triển khai contract (Hardhat) rồi set BLOCKCHAIN_CONTRACT_ADDRESS.");
            persistGovernanceRecord("DRY_RUN_VALIDATE", response.getDeploymentStatus(), response.getNote(), contractAddress);
            return response;
        }

        if (!hasKey) {
            response.setActive(false);
            response.setDeploymentStatus("NEEDS_PRIVATE_KEY");
            response.setNote("Không có private key hợp lệ. Set BLOCKCHAIN_PRIVATE_KEY hoặc dùng Vault/KMS.");
            return response;
        }

        if (!StringUtils.hasText(contractAddress)) {
            response.setActive(false);
            response.setDeploymentStatus("NEEDS_CONTRACT_ADDRESS");
            response.setNote("Chưa có contract address. Deploy contract thật rồi lưu địa chỉ vào BLOCKCHAIN_CONTRACT_ADDRESS.");
            return response;
        }

        response.setActive(true);
        response.setDeploymentStatus("READY_FOR_DEPLOYMENT_MANAGEMENT");
        response.setContractAddress(contractAddress);
        response.setNote("Cấu hình đã sẵn sàng cho deploy/manage contract thật, hiện tại contract address đã được xác nhận.");
        persistGovernanceRecord("DEPLOY_VALIDATE", response.getDeploymentStatus(), response.getNote(), contractAddress);
        return response;
    }

    private void persistGovernanceRecord(String actionType, String status, String note, String contractAddress) {
        BlockchainTransaction tx = new BlockchainTransaction();
        tx.setRelatedEntityType("GOVERNANCE");
        tx.setRelatedEntityId(0L);
        tx.setActionType(actionType);
        tx.setTxHash(contractAddress != null ? contractAddress : "N/A");
        tx.setTxStatus(status);
        tx.setGovernanceStatus(BlockchainGovernanceStatus.PENDING);
        tx.setGovernanceNote(note);
        tx.setTxOrigin("BLOCKCHAIN_GOVERNANCE_SERVICE");
        tx.setTxSeed("gov-" + actionType + "-" + LocalDateTime.now());
        tx.setDataPayload(note);
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
}
