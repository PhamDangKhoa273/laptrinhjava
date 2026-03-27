package com.bicap.backend.controller;

import com.bicap.backend.dto.request.FarmReviewRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.entity.Farm;
import com.bicap.backend.service.FarmService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farms")
@RequiredArgsConstructor
public class FarmController {

    private final FarmService farmService;

    @PostMapping
    public ApiResponse<Farm> createFarm(@RequestBody Farm farm,
                                        @RequestParam Long ownerUserId) {
        return ApiResponse.success("Tạo farm thành công",
                farmService.createFarm(farm, ownerUserId));
    }

    @GetMapping
    public ApiResponse<?> getAllFarms() {
        return ApiResponse.success(farmService.getAllFarms());
    }

    @GetMapping("/{id}")
    public ApiResponse<Farm> getFarmById(@PathVariable Long id) {
        return ApiResponse.success(farmService.getFarmById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Farm> updateFarm(@PathVariable Long id,
                                        @RequestBody Farm farm) {
        return ApiResponse.success("Cập nhật farm thành công",
                farmService.updateFarm(id, farm));
    }

    @PutMapping("/{id}/review")
    public ApiResponse<Farm> reviewFarm(@PathVariable Long id,
                                        @RequestParam Long reviewerUserId,
                                        @Valid @RequestBody FarmReviewRequest request) {
        return ApiResponse.success("Duyệt farm thành công",
                farmService.reviewFarm(
                        id,
                        reviewerUserId,
                        request.getApprovalStatus(),
                        request.getCertificationStatus()
                ));
    }
}