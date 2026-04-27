package com.bicap.modules.batch.dto;

import java.time.LocalDateTime;

public class TraceProcessStepDto {
    private Integer stepNo;
    private String stepName;
    private LocalDateTime performedAt;
    private String description;
    private String imageUrl;
    private String recordedBy;

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
    public String getRecordedBy() { return recordedBy; }
    public void setRecordedBy(String recordedBy) { this.recordedBy = recordedBy; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final TraceProcessStepDto dto = new TraceProcessStepDto();

        public Builder stepNo(Integer value) { dto.setStepNo(value); return this; }
        public Builder stepName(String value) { dto.setStepName(value); return this; }
        public Builder performedAt(LocalDateTime value) { dto.setPerformedAt(value); return this; }
        public Builder description(String value) { dto.setDescription(value); return this; }
        public Builder imageUrl(String value) { dto.setImageUrl(value); return this; }
        public Builder recordedBy(String value) { dto.setRecordedBy(value); return this; }
        public TraceProcessStepDto build() { return dto; }
    }
}
