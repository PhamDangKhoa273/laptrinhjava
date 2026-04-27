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
    private LocalDateTime activeFrom;
    private LocalDateTime activeTo;

    public Long getSubscriptionId() { return subscriptionId; }
    public void setSubscriptionId(Long id) { this.subscriptionId = id; }
    public Long getFarmId() { return farmId; }
    public void setFarmId(Long id) { this.farmId = id; }
    public String getFarmName() { return farmName; }
    public void setFarmName(String s) { this.farmName = s; }
    public Long getPackageId() { return packageId; }
    public void setPackageId(Long id) { this.packageId = id; }
    public String getPackageCode() { return packageCode; }
    public void setPackageCode(String s) { this.packageCode = s; }
    public String getPackageName() { return packageName; }
    public void setPackageName(String s) { this.packageName = s; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime t) { this.startDate = t; }
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime t) { this.endDate = t; }
    public LocalDateTime getActiveFrom() { return activeFrom; }
    public void setActiveFrom(LocalDateTime t) { this.activeFrom = t; }
    public LocalDateTime getActiveTo() { return activeTo; }
    public void setActiveTo(LocalDateTime t) { this.activeTo = t; }

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
        public Builder startDate(LocalDateTime t) { r.setStartDate(t); r.setActiveFrom(t); return this; }
        public Builder startDate(LocalDate d) { LocalDateTime t = d != null ? d.atStartOfDay() : null; r.setStartDate(t); r.setActiveFrom(t); return this; }
        public Builder endDate(LocalDateTime t) { r.setEndDate(t); r.setActiveTo(t); return this; }
        public Builder endDate(LocalDate d) { LocalDateTime t = d != null ? d.atStartOfDay() : null; r.setEndDate(t); r.setActiveTo(t); return this; }
        public Builder subscribedByUserId(Long l) { return this; }
        public Builder subscribedByFullName(String s) { return this; }
        public FarmSubscriptionResponse build() { return r; }
    }
}
