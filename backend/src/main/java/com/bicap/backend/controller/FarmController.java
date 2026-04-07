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
                "Tạo farm thành công",
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
                "Cập nhật farm thành công",
                farmService.updateFarm(id, request, SecurityUtils.getCurrentUserId())
        );
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FarmResponse> reviewFarm(@PathVariable Long id,
                                                @Valid @RequestBody FarmReviewRequest request) {
        return ApiResponse.success(
                "Duyệt farm thành công",
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
                "Thay đổi approval status thành công",
                farmService.changeApprovalStatus(id, request.getApprovalStatus(), SecurityUtils.getCurrentUserId())
        );
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN','FARM')")
    public ApiResponse<FarmResponse> deactivateFarm(@PathVariable Long id) {
        return ApiResponse.success(
                "Ngừng kích hoạt farm thành công",
                farmService.deactivateFarm(id, SecurityUtils.getCurrentUserId())
        );
    }
}
