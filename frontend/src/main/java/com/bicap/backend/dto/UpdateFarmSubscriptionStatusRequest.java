package com.bicap.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateFarmSubscriptionStatusRequest {

    @NotBlank(message = "subscriptionStatus không được để trống")
    private String subscriptionStatus;
}