package com.bicap.modules.season.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class CreateProcessStepRequest {
    @NotNull(message = "step_no is required")
    @Min(value = 1, message = "step_no must be greater than 0")
    private Integer stepNo;

    @NotBlank(message = "step_name is required")
    @Size(max = 255, message = "step_name must be at most 255 characters")
    private String stepName;

    @NotNull(message = "performed_at is required")
    private LocalDateTime performedAt;

    @Size(max = 2000, message = "description must be at most 2000 characters")
    private String description;

    @Size(max = 1000, message = "image_url must be at most 1000 characters")
    private String imageUrl;

    public Integer getStepNo() { return stepNo; }
    public void setStepNo(Integer stepNo) { this.stepNo = stepNo; }

    public String getStepName() { return stepName; }
    public void setStepName(String stepName) { this.stepName = stepName; }

    public LocalDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDateTime performedAt) { this.performedAt = performedAt; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
