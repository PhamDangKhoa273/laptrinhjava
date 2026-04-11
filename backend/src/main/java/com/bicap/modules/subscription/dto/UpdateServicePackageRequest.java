package com.bicap.modules.subscription.dto;
import java.math.BigDecimal;
public class UpdateServicePackageRequest {
    private String packageName;
    private BigDecimal price;
    private Integer durationDays;
    private Integer maxSeasons;
    private Integer maxListings;
    private String description;
    private String status;
    public String getPackageName() { return packageName; }
    public void setPackageName(String s) { packageName = s; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal d) { price = d; }
    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer i) { durationDays = i; }
    public Integer getMaxSeasons() { return maxSeasons; }
    public void setMaxSeasons(Integer i) { maxSeasons = i; }
    public Integer getMaxListings() { return maxListings; }
    public void setMaxListings(Integer i) { maxListings = i; }
    public String getDescription() { return description; }
    public void setDescription(String s) { description = s; }
    public String getStatus() { return status; }
    public void setStatus(String s) { status = s; }
}
