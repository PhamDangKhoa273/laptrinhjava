package com.bicap.modules.subscription.dto;

import java.math.BigDecimal;

public class ServicePackageResponse {
    private Long packageId;
    private String packageCode;
    private String packageName;
    private BigDecimal price;
    private Integer durationDays;
    private Integer maxSeasons;
    private Integer maxListings;
    private String description;
    private String status;

    public Long getPackageId() { return packageId; }
    public void setPackageId(Long id) { this.packageId = id; }
    public String getPackageCode() { return packageCode; }
    public void setPackageCode(String s) { this.packageCode = s; }
    public String getPackageName() { return packageName; }
    public void setPackageName(String s) { this.packageName = s; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal d) { this.price = d; }
    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer i) { this.durationDays = i; }
    public Integer getMaxSeasons() { return maxSeasons; }
    public void setMaxSeasons(Integer i) { this.maxSeasons = i; }
    public Integer getMaxListings() { return maxListings; }
    public void setMaxListings(Integer i) { this.maxListings = i; }
    public String getDescription() { return description; }
    public void setDescription(String s) { this.description = s; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long packageId;
        private String packageCode;
        private String packageName;
        private BigDecimal price;
        private Integer durationDays;
        private Integer maxSeasons;
        private Integer maxListings;
        private String description;
        private String status;

        public Builder packageId(Long l) { this.packageId = l; return this; }
        public Builder packageCode(String s) { this.packageCode = s; return this; }
        public Builder packageName(String s) { this.packageName = s; return this; }
        public Builder price(BigDecimal d) { this.price = d; return this; }
        public Builder durationDays(Integer i) { this.durationDays = i; return this; }
        public Builder maxSeasons(Integer i) { this.maxSeasons = i; return this; }
        public Builder maxListings(Integer i) { this.maxListings = i; return this; }
        public Builder description(String s) { this.description = s; return this; }
        public Builder status(String s) { this.status = s; return this; }
        public ServicePackageResponse build() {
             ServicePackageResponse r = new ServicePackageResponse();
             r.setPackageId(packageId); r.setPackageCode(packageCode); r.setPackageName(packageName);
             r.setPrice(price); r.setDurationDays(durationDays); r.setMaxSeasons(maxSeasons);
             r.setMaxListings(maxListings); r.setDescription(description); r.setStatus(status);
             return r;
        }
    }
}
