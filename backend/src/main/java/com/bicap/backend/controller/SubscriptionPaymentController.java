package com.bicap.backend.controller;

import com.bicap.backend.dto.CreateSubscriptionPaymentRequest;
import com.bicap.backend.dto.SubscriptionPaymentResponse;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.security.SecurityUtils;
import com.bicap.backend.service.SubscriptionPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscription-payments")
@RequiredArgsConstructor
public class SubscriptionPaymentController {

    private final SubscriptionPaymentService subscriptionPaymentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('FARM','ADMIN')")
    public ApiResponse<SubscriptionPaymentResponse> create(@Valid @RequestBody CreateSubscriptionPaymentRequest request) {
        return ApiResponse.success(
                "Tạo thanh toán subscription thành công",
                subscriptionPaymentService.create(request, SecurityUtils.getCurrentUserId())
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARM','ADMIN')")
    public ApiResponse<SubscriptionPaymentResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(subscriptionPaymentService.getById(id, SecurityUtils.getCurrentUserId()));
    }
}