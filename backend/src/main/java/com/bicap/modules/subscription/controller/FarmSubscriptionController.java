package com.bicap.modules.subscription.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.subscription.dto.CreateFarmSubscriptionRequest;
import com.bicap.modules.subscription.dto.FarmSubscriptionResponse;
import com.bicap.modules.subscription.dto.UpdateFarmSubscriptionStatusRequest;
import com.bicap.modules.subscription.service.FarmSubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1/farm-subscriptions")
@RequiredArgsConstructor
public class FarmSubscriptionController {

    private final FarmSubscriptionService farmSubscriptionService;

    @PostMapping
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<FarmSubscriptionResponse> create(@Valid @RequestBody CreateFarmSubscriptionRequest request) {
        return ApiResponse.success(
                "Táº¡o Ä‘Äƒng kÃ½ gÃ³i thÃ nh cÃ´ng",
                farmSubscriptionService.create(request, SecurityUtils.getCurrentUserId())
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARM','ADMIN')")
    public ApiResponse<FarmSubscriptionResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(farmSubscriptionService.getById(id, SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<List<FarmSubscriptionResponse>> getMySubscriptions() {
        return ApiResponse.success(farmSubscriptionService.getMySubscriptions(SecurityUtils.getCurrentUserId()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FarmSubscriptionResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFarmSubscriptionStatusRequest request) {
        return ApiResponse.success(
                "Cáº­p nháº­t tráº¡ng thÃ¡i subscription thÃ nh cÃ´ng",
                farmSubscriptionService.updateStatus(id, request.getSubscriptionStatus(), SecurityUtils.getCurrentUserId())
        );
    }
}

