package com.bicap.backend.controller;

import com.bicap.backend.dto.CreateFarmSubscriptionRequest;
import com.bicap.backend.dto.FarmSubscriptionResponse;
import com.bicap.backend.dto.UpdateFarmSubscriptionStatusRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.security.SecurityUtils;
import com.bicap.backend.service.FarmSubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farm-subscriptions")
@RequiredArgsConstructor
public class FarmSubscriptionController {

    private final FarmSubscriptionService farmSubscriptionService;

    @PostMapping
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<FarmSubscriptionResponse> create(@Valid @RequestBody CreateFarmSubscriptionRequest request) {
        return ApiResponse.success(
                "Tạo đăng ký gói thành công",
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
                "Cập nhật trạng thái subscription thành công",
                farmSubscriptionService.updateStatus(id, request.getSubscriptionStatus(), SecurityUtils.getCurrentUserId())
        );
    }
}
