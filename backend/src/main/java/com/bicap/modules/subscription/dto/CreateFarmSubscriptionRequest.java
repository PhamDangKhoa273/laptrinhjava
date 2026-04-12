package com.bicap.modules.subscription.dto;

import java.time.LocalDate;

public class CreateFarmSubscriptionRequest {
    private Long farmId;
    private Long packageId;
    private LocalDate startDate;

    public Long getFarmId() { return farmId; }
    public void setFarmId(Long id) { this.farmId = id; }
    public Long getPackageId() { return packageId; }
    public void setPackageId(Long id) { this.packageId = id; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate d) { this.startDate = d; }
}
