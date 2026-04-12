package com.bicap.modules.season.dto;

import com.bicap.modules.season.entity.FarmingProcess;
import java.time.LocalDateTime;

public class ProcessStepResponse {
    private Long id;
    private Integer stepNo;
    private String stepName;
    private LocalDateTime performedAt;
    private String description;
    private String imageUrl;
    private String recordedByName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
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
    
    public String getRecordedByName() { return recordedByName; }
    public void setRecordedByName(String s) { this.recordedByName = s; }

    public static ProcessStepResponse fromEntity(FarmingProcess p, String recorderName) {
        ProcessStepResponse r = new ProcessStepResponse();
        r.setId(p.getProcessId());
        r.setStepNo(p.getStepNo());
        r.setStepName(p.getProcessName());
        r.setPerformedAt(p.getPerformedAt());
        r.setDescription(p.getDescription());
        r.setImageUrl(p.getImageUrl());
        r.setRecordedByName(recorderName);
        return r;
    }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private ProcessStepResponse r = new ProcessStepResponse();
        public Builder id(Long l) { r.setId(l); return this; }
        public Builder stepNo(Integer i) { r.setStepNo(i); return this; }
        public Builder stepName(String s) { r.setStepName(s); return this; }
        public Builder performedAt(LocalDateTime t) { r.setPerformedAt(t); return this; }
        public Builder description(String s) { r.setDescription(s); return this; }
        public Builder imageUrl(String s) { r.setImageUrl(s); return this; }
        public Builder recordedByName(String s) { r.setRecordedByName(s); return this; }
        public ProcessStepResponse build() { return r; }
    }
}
