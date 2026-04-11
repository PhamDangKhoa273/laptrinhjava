package com.bicap.modules.subscription.dto;

import java.time.LocalDateTime;
import java.time.LocalDate;

public class FarmSubscriptionResponse {
    private Long subscriptionId;
    private Long farmId;
    private String farmName;
    private Long packageId;
    private String packageCode;
    private String packageName;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    public void setSubscriptionId(Long id) { this.subscriptionId = id; }
    public void setFarmId(Long id) { this.farmId = id; }
    public void setFarmName(String s) { this.farmName = s; }
    public void setPackageId(Long id) { this.packageId = id; }
    public void setPackageCode(String s) { this.packageCode = s; }
    public void setPackageName(String s) { this.packageName = s; }
    public void setStatus(String s) { this.status = s; }
    public void setStartDate(LocalDateTime t) { this.startDate = t; }
    public void setEndDate(LocalDateTime t) { this.endDate = t; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private FarmSubscriptionResponse r = new FarmSubscriptionResponse();
        public Builder subscriptionId(Long l) { r.setSubscriptionId(l); return this; }
        public Builder farmId(Long l) { r.setFarmId(l); return this; }
        public Builder farmName(String s) { r.setFarmName(s); return this; }
        public Builder packageId(Long l) { r.setPackageId(l); return this; }
        public Builder packageCode(String s) { r.setPackageCode(s); return this; }
        public Builder packageName(String s) { r.setPackageName(s); return this; }
        public Builder status(String s) { r.setStatus(s); return this; }
        public Builder subscriptionStatus(String s) { r.setStatus(s); return this; }
        public Builder startDate(LocalDateTime t) { r.setStartDate(t); return this; }
        public Builder startDate(LocalDate d) { r.setStartDate(d != null ? d.atStartOfDay() : null); return this; }
        public Builder endDate(LocalDateTime t) { r.setEndDate(t); return this; }
        public Builder endDate(LocalDate d) { r.setEndDate(d != null ? d.atStartOfDay() : null); return this; }
        public Builder subscribedByUserId(Long l) { return this; }
        public Builder subscribedByFullName(String s) { return this; }
        public FarmSubscriptionResponse build() { return r; }
    }
}
