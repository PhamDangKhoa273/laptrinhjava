package com.bicap.modules.farm.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.core.security.CustomUserPrincipal;
import com.bicap.modules.farm.dto.CreateFarmRequest;
import com.bicap.modules.farm.dto.FarmResponse;
import com.bicap.modules.farm.dto.FarmReviewRequest;
import com.bicap.modules.farm.dto.UpdateFarmRequest;
import com.bicap.modules.farm.service.FarmService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/farms")
@RequiredArgsConstructor
public class FarmController {

    private final FarmService farmService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<FarmResponse>> getAllFarms() {
        return ApiResponse.success(farmService.getAllFarms());
    }

    @GetMapping("/{id}")
    public ApiResponse<FarmResponse> getFarmById(@PathVariable Long id) {
        return ApiResponse.success(farmService.getFarmById(id));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<FarmResponse> getMyFarm(@AuthenticationPrincipal CustomUserPrincipal currentUser) {
        return ApiResponse.success(farmService.getMyFarm(currentUser.getUserId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<FarmResponse> createFarm(
            @Valid @RequestBody CreateFarmRequest request,
            @AuthenticationPrincipal CustomUserPrincipal currentUser) {
        return ApiResponse.success(farmService.createFarm(request, currentUser.getUserId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<FarmResponse> updateFarm(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFarmRequest request,
            @AuthenticationPrincipal CustomUserPrincipal currentUser) {
        return ApiResponse.success(farmService.updateFarm(id, request, currentUser.getUserId()));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FarmResponse> reviewFarm(
            @PathVariable Long id,
            @Valid @RequestBody FarmReviewRequest request,
            @AuthenticationPrincipal CustomUserPrincipal currentUser) {
        return ApiResponse.success(farmService.changeApprovalStatus(id, request.getApprovalStatus(), currentUser.getUserId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deactivateFarm(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserPrincipal currentUser) {
        farmService.deactivateFarm(id, currentUser.getUserId());
        return ApiResponse.success(null);
    }
}
