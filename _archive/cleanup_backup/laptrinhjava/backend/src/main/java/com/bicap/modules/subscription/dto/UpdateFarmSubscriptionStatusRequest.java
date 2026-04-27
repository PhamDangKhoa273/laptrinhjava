package com.bicap.modules.subscription.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateFarmSubscriptionStatusRequest {

    @NotBlank(message = "SubscriptionStatus is required")
    private String subscriptionStatus;

    public String getSubscriptionStatus() { return subscriptionStatus; }
    public void setSubscriptionStatus(String s) { this.subscriptionStatus = s; }
}
