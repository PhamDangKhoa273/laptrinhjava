package com.bicap.backend.controller;

import com.bicap.backend.dto.CreateSubscriptionPaymentRequest;
import com.bicap.backend.dto.SubscriptionPaymentResponse;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.service.SubscriptionPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscription-payments")
@RequiredArgsConstructor
public class SubscriptionPaymentController {

    private final SubscriptionPaymentService subscriptionPaymentService;

    @PostMapping
    public ApiResponse<SubscriptionPaymentResponse> createPayment(@RequestBody CreateSubscriptionPaymentRequest request) {
        return ApiResponse.success("Tạo payment thành công",
                subscriptionPaymentService.createPayment(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<SubscriptionPaymentResponse> getPaymentById(@PathVariable Long id) {
        return ApiResponse.success(subscriptionPaymentService.getPaymentById(id));
    }
}