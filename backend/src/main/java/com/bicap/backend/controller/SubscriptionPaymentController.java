<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/controller/SubscriptionPaymentController.java
package com.bicap.backend.controller;

import com.bicap.backend.dto.CreateSubscriptionPaymentRequest;
import com.bicap.backend.dto.SubscriptionPaymentResponse;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.security.SecurityUtils;
import com.bicap.backend.service.SubscriptionPaymentService;
=======
package com.bicap.modules.subscription.controller;

import com.bicap.core.dto.ApiResponse;

import com.bicap.modules.subscription.dto.CreateSubscriptionPaymentRequest;
import com.bicap.modules.subscription.dto.SubscriptionPaymentResponse;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.subscription.service.SubscriptionPaymentService;
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/subscription/controller/SubscriptionPaymentController.java
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
                "Táº¡o thanh toÃ¡n subscription thÃ nh cÃ´ng",
                subscriptionPaymentService.create(request, SecurityUtils.getCurrentUserId())
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARM','ADMIN')")
    public ApiResponse<SubscriptionPaymentResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(subscriptionPaymentService.getById(id, SecurityUtils.getCurrentUserId()));
    }
}
