package com.bicap.backend.controller;

import com.bicap.backend.dto.CreateFarmRequest;
import com.bicap.backend.dto.FarmResponse;
import com.bicap.backend.dto.UpdateFarmRequest;
import com.bicap.backend.dto.request.FarmReviewRequest;
import com.bicap.backend.dto.request.UpdateApprovalStatusRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.security.SecurityUtils;
import com.bicap.backend.service.FarmService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farms")
@RequiredArgsConstructor
public class FarmController {

    private final FarmService farmService;

    @PostMapping
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<FarmResponse> createFarm(@Valid @RequestBody CreateFarmRequest request) {
        return ApiResponse.success(
                "Táº¡o farm thÃ nh cÃ´ng",
                farmService.createFarm(request, SecurityUtils.getCurrentUserId())
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SHIPPING_MANAGER')")
    public ApiResponse<List<FarmResponse>> getAllFarms() {
        return ApiResponse.success(farmService.getAllFarms());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARM','ADMIN','SHIPPING_MANAGER')")
    public ApiResponse<FarmResponse> getFarmById(@PathVariable Long id) {
        return ApiResponse.success(farmService.getFarmById(id, SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<FarmResponse> getMyFarm() {
        return ApiResponse.success(farmService.getMyFarm(SecurityUtils.getCurrentUserId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARM','ADMIN')")
    public ApiResponse<FarmResponse> updateFarm(@PathVariable Long id,
                                                @Valid @RequestBody UpdateFarmRequest request) {
        return ApiResponse.success(
                "Cáº­p nháº­t farm thÃ nh cÃ´ng",
                farmService.updateFarm(id, request, SecurityUtils.getCurrentUserId())
        );
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FarmResponse> reviewFarm(@PathVariable Long id,
                                                @Valid @RequestBody FarmReviewRequest request) {
        return ApiResponse.success(
                "Duyá»‡t farm thÃ nh cÃ´ng",
                farmService.reviewFarm(
                        id,
                        SecurityUtils.getCurrentUserId(),
                        request.getApprovalStatus(),
                        request.getCertificationStatus()
                )
        );
    }

    @PutMapping("/{id}/approval-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FarmResponse> changeApprovalStatus(@PathVariable Long id,
                                                          @Valid @RequestBody UpdateApprovalStatusRequest request) {
        return ApiResponse.success(
                "Thay Ä‘á»•i approval status thÃ nh cÃ´ng",
                farmService.changeApprovalStatus(id, request.getApprovalStatus(), SecurityUtils.getCurrentUserId())
        );
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN','FARM')")
    public ApiResponse<FarmResponse> deactivateFarm(@PathVariable Long id) {
        return ApiResponse.success(
                "Ngá»«ng kÃ­ch hoáº¡t farm thÃ nh cÃ´ng",
                farmService.deactivateFarm(id, SecurityUtils.getCurrentUserId())
        );
    }
}
