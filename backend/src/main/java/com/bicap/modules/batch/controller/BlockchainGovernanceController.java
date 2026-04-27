package com.bicap.modules.batch.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.batch.dto.BlockchainGovernanceConfigResponse;
import com.bicap.modules.batch.dto.BlockchainTransactionResponse;
import com.bicap.modules.batch.dto.DeployContractRequest;
import com.bicap.modules.batch.dto.DeployContractResponse;
import com.bicap.modules.batch.service.BlockchainGovernanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/blockchain/governance")
@RequiredArgsConstructor
public class BlockchainGovernanceController {
    private final BlockchainGovernanceService blockchainGovernanceService;

    @GetMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BlockchainGovernanceConfigResponse> config() {
        return ApiResponse.success(blockchainGovernanceService.getConfig());
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<BlockchainTransactionResponse>> transactions() {
        return ApiResponse.success(blockchainGovernanceService.getTransactions());
    }

    @GetMapping("/transactions/{entityType}/{entityId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<BlockchainTransactionResponse>> transactionsByEntity(@PathVariable String entityType, @PathVariable Long entityId) {
        return ApiResponse.success(blockchainGovernanceService.getTransactionsByEntity(entityType, entityId));
    }

    @PostMapping("/transactions/{entityType}/{entityId}/retry")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BlockchainTransactionResponse> retryTransaction(@PathVariable String entityType, @PathVariable Long entityId) {
        return ApiResponse.success(blockchainGovernanceService.retryLatestFailed(entityType, entityId));
    }

    @PostMapping("/deploy")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DeployContractResponse> deploy(@RequestBody(required = false) DeployContractRequest request) {
        return ApiResponse.success(blockchainGovernanceService.deployOrValidateContract(request));
    }
}
