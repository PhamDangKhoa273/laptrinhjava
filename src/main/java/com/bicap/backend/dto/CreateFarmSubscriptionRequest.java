package com.bicap.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateFarmSubscriptionRequest {
    private Long farmId;
    private Long packageId;
    private Long subscribedByUserId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String subscriptionStatus;
}