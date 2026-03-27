package com.bicap.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class FarmSubscriptionResponse {
    private Long subscriptionId;
    private Long farmId;
    private String farmName;
    private Long packageId;
    private String packageName;
    private Long subscribedByUserId;
    private String subscribedByFullName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String subscriptionStatus;
}