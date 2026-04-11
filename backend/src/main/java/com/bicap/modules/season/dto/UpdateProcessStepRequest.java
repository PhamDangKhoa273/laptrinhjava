package com.bicap.modules.season.dto;

import java.time.LocalDateTime;

public class UpdateProcessStepRequest {
    private Integer stepNo;
    private String stepName;
    private LocalDateTime performedAt;
    private String description;
    private String imageUrl;

    public Integer getStepNo() { return stepNo; }
    public void setStepNo(Integer i) { this.stepNo = i; }
    public String getStepName() { return stepName; }
    public void setStepName(String s) { this.stepName = s; }
    public LocalDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDateTime t) { this.performedAt = t; }
    public String getDescription() { return description; }
    public void setDescription(String s) { this.description = s; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String s) { this.imageUrl = s; }
}
