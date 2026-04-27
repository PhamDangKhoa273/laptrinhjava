package com.bicap.modules.contract.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.contract.dto.CreateFarmRetailerContractRequest;
import com.bicap.modules.contract.dto.FarmRetailerContractResponse;
import com.bicap.modules.contract.service.FarmRetailerContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1/contracts")
@RequiredArgsConstructor
public class FarmRetailerContractController {

    private final FarmRetailerContractService contractService;

    @GetMapping("/farm/{farmId}")
    @PreAuthorize("hasAnyRole('ADMIN','FARM')")
    public ApiResponse<List<FarmRetailerContractResponse>> getFarmContracts(@PathVariable Long farmId) {
        return ApiResponse.success(contractService.getByFarm(farmId, SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/retailer/{retailerId}")
    @PreAuthorize("hasAnyRole('ADMIN','RETAILER')")
    public ApiResponse<List<FarmRetailerContractResponse>> getRetailerContracts(@PathVariable Long retailerId) {
        return ApiResponse.success(contractService.getByRetailer(retailerId, SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/farm/{farmId}/active")
    @PreAuthorize("hasAnyRole('ADMIN','FARM')")
    public ApiResponse<List<FarmRetailerContractResponse>> getActiveFarmContracts(@PathVariable Long farmId) {
        return ApiResponse.success(contractService.getActiveByFarm(farmId, SecurityUtils.getCurrentUserId()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FARM','ADMIN')")
    public ApiResponse<FarmRetailerContractResponse> create(@Valid @RequestBody CreateFarmRetailerContractRequest request) {
        return ApiResponse.success("Tạo hợp đồng thành công", contractService.create(request, SecurityUtils.getCurrentUserId()));
    }

    @PatchMapping("/{contractId}/review")
    @PreAuthorize("hasAnyRole('ADMIN','FARM')")
    public ApiResponse<FarmRetailerContractResponse> review(@PathVariable Long contractId, @RequestParam String status) {
        return ApiResponse.success("Cập nhật hợp đồng thành công", contractService.review(contractId, status, SecurityUtils.getCurrentUserId()));
    }

    @PatchMapping("/{contractId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','FARM','RETAILER')")
    public ApiResponse<FarmRetailerContractResponse> cancel(@PathVariable Long contractId) {
        return ApiResponse.success("Huỷ hợp đồng thành công", contractService.cancel(contractId, SecurityUtils.getCurrentUserId()));
    }
}
