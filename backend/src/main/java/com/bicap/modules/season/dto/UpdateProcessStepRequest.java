package com.bicap.modules.season.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class UpdateProcessStepRequest {
    @Min(value = 1, message = "step_no must be greater than 0")
    private Integer stepNo;

    @Size(max = 255, message = "step_name must be at most 255 characters")
    private String stepName;

    private LocalDateTime performedAt;

    @Size(max = 2000, message = "description must be at most 2000 characters")
    private String description;

    @Size(max = 1000, message = "image_url must be at most 1000 characters")
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
