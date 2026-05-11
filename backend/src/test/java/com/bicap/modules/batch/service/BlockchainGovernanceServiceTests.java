package com.bicap.modules.batch.service;

import com.bicap.core.enums.BlockchainGovernanceStatus;
import com.bicap.core.enums.PermissionName;
import com.bicap.core.security.AuthorizationService;
import com.bicap.modules.batch.config.BlockchainProperties;
import com.bicap.modules.batch.dto.BlockchainGovernanceConfigResponse;
import com.bicap.modules.batch.dto.BlockchainTransactionResponse;
import com.bicap.modules.batch.dto.DeployContractRequest;
import com.bicap.modules.batch.dto.DeployContractResponse;
import com.bicap.modules.batch.entity.BlockchainTransaction;
import com.bicap.modules.batch.repository.BlockchainTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BlockchainGovernanceServiceTests {
    @Mock BlockchainTransactionRepository transactionRepository;
    @Mock AuthorizationService authorizationService;

    BlockchainProperties properties;
    BlockchainGovernanceService service;

    @BeforeEach
    void setUp() {
        properties = new BlockchainProperties();
        service = new BlockchainGovernanceService(transactionRepository, properties, authorizationService);
    }

    @Test
    void getConfig_shouldReportMissingRequirementsWhenDisabled() {
        BlockchainGovernanceConfigResponse response = service.getConfig();

        assertFalse(response.isActive());
        assertTrue(response.isSafeMode());
        assertEquals("VeChainThor", response.getContractNetwork());
        assertEquals("NEEDS_CONFIG", response.getGovernanceStatus());
        assertEquals("DISABLED", response.getDeploymentStatus());
        assertTrue(response.getMissingRequirements().contains("blockchain.enabled=true"));
        assertTrue(response.getMissingRequirements().contains("BLOCKCHAIN_RPC_URL"));
        assertTrue(response.getMissingRequirements().contains("BLOCKCHAIN_CONTRACT_ADDRESS"));
        assertEquals(0, response.getReadinessScore());
    }

    @Test
    void getConfig_shouldReturnReadyReadOnlyWhenNoPrivateKey() {
        properties.setEnabled(true);
        properties.setRpcUrl("https://testnet.vechain.example");
        properties.setContractAddress("0x1234567890abcdef1234567890abcdef12345678");

        BlockchainGovernanceConfigResponse response = service.getConfig();

        assertTrue(response.isActive());
        assertTrue(response.isSafeMode());
        assertFalse(response.isWriteMode());
        assertEquals("READY", response.getGovernanceStatus());
        assertEquals("CONFIG_VALID_READ_ONLY", response.getDeploymentStatus());
        assertEquals(85, response.getReadinessScore());
        assertTrue(response.getMissingRequirements().isEmpty());
    }

    @Test
    void deployOrValidateContract_shouldPersistGovernedDryRunRecordWhenConfigValid() {
        properties.setEnabled(true);
        properties.setRpcUrl("https://testnet.vechain.example");
        properties.setContractAddress("0x1234567890abcdef1234567890abcdef12345678");
        when(transactionRepository.save(any(BlockchainTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DeployContractResponse response = service.deployOrValidateContract(new DeployContractRequest());

        assertTrue(response.isActive());
        assertEquals("CONFIG_VALID_READ_ONLY", response.getDeploymentStatus());
        verify(authorizationService).requirePermission(PermissionName.BLOCKCHAIN_GOVERNANCE);
        ArgumentCaptor<BlockchainTransaction> captor = ArgumentCaptor.forClass(BlockchainTransaction.class);
        verify(transactionRepository).save(captor.capture());
        assertEquals("GOVERNANCE_VALIDATE", captor.getValue().getActionType());
        assertEquals(BlockchainGovernanceStatus.GOVERNED, captor.getValue().getGovernanceStatus());
    }

    @Test
    void deployOrValidateContract_shouldFailWriteValidationWithoutPrivateKey() {
        properties.setEnabled(true);
        properties.setRpcUrl("https://testnet.vechain.example");
        properties.setContractAddress("0x1234567890abcdef1234567890abcdef12345678");
        DeployContractRequest request = new DeployContractRequest();
        request.setDryRun(false);
        when(transactionRepository.save(any(BlockchainTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DeployContractResponse response = service.deployOrValidateContract(request);

        assertFalse(response.isActive());
        assertEquals("NEEDS_PRIVATE_KEY", response.getDeploymentStatus());
        ArgumentCaptor<BlockchainTransaction> captor = ArgumentCaptor.forClass(BlockchainTransaction.class);
        verify(transactionRepository).save(captor.capture());
        assertEquals(BlockchainGovernanceStatus.FAILED, captor.getValue().getGovernanceStatus());
    }

    @Test
    void retryLatestFailed_shouldScheduleOnlyFailedTransactions() {
        BlockchainTransaction tx = new BlockchainTransaction();
        tx.setRelatedEntityType("GOVERNANCE");
        tx.setRelatedEntityId(0L);
        tx.setGovernanceStatus(BlockchainGovernanceStatus.FAILED);
        tx.setRetryCount(1);
        when(transactionRepository.findTopByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc("GOVERNANCE", 0L))
                .thenReturn(Optional.of(tx));
        when(transactionRepository.save(any(BlockchainTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BlockchainTransactionResponse response = service.retryLatestFailed("governance", 0L);

        assertEquals("RETRY_SCHEDULED", response.getGovernanceStatus());
        assertEquals(2, response.getRetryCount());
        verify(authorizationService).requirePermission(PermissionName.BLOCKCHAIN_GOVERNANCE);
    }

    @Test
    void getTransactionsByEntity_shouldNormalizeEntityType() {
        when(transactionRepository.findByRelatedEntityTypeAndRelatedEntityId("ORDER", 42L)).thenReturn(List.of());

        assertTrue(service.getTransactionsByEntity(" order ", 42L).isEmpty());

        verify(transactionRepository).findByRelatedEntityTypeAndRelatedEntityId("ORDER", 42L);
    }
}
