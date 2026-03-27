package com.bicap.backend.controller;

import com.bicap.backend.dto.CreateFarmSubscriptionRequest;
import com.bicap.backend.dto.FarmSubscriptionResponse;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.service.FarmSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farm-subscriptions")
@RequiredArgsConstructor
public class FarmSubscriptionController {

    private final FarmSubscriptionService farmSubscriptionService;

    @PostMapping
    public ApiResponse<FarmSubscriptionResponse> createSubscription(@RequestBody CreateFarmSubscriptionRequest request) {
        return ApiResponse.success("Tạo subscription thành công",
                farmSubscriptionService.createSubscription(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<FarmSubscriptionResponse> getSubscriptionById(@PathVariable Long id) {
        return ApiResponse.success(farmSubscriptionService.getSubscriptionById(id));
    }
}