package com.bicap.modules.subscription.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.subscription.dto.CreateSubscriptionPaymentRequest;
import com.bicap.modules.subscription.dto.SubscriptionPaymentResponse;
import com.bicap.modules.subscription.service.SubscriptionPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1/subscription-payments")
@RequiredArgsConstructor
public class SubscriptionPaymentController {

    private final SubscriptionPaymentService subscriptionPaymentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('FARM','ADMIN')")
    public ApiResponse<SubscriptionPaymentResponse> create(@Valid @RequestBody CreateSubscriptionPaymentRequest request) {
        return ApiResponse.success(
                "Táº¡o thanh toÃ¡n subscription thÃ nh cÃ´ng",
                subscriptionPaymentService.create(request, SecurityUtils.getCurrentUserId())
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARM','ADMIN')")
    public ApiResponse<SubscriptionPaymentResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(subscriptionPaymentService.getById(id, SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<List<SubscriptionPaymentResponse>> getMyPayments() {
        return ApiResponse.success(subscriptionPaymentService.getMyPayments(SecurityUtils.getCurrentUserId()));
    }
}
