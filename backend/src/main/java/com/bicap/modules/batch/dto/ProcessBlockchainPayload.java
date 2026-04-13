package com.bicap.modules.batch.dto;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

public class ProcessBlockchainPayload {
    private Long processId;
    private Long seasonId;
    private Integer stepNo;
    private String stepName;
    private LocalDateTime performedAt;
    private String description;

    public Long getProcessId() { return processId; }
    public void setProcessId(Long processId) { this.processId = processId; }
    public Long getSeasonId() { return seasonId; }
    public void setSeasonId(Long seasonId) { this.seasonId = seasonId; }
    public Integer getStepNo() { return stepNo; }
    public void setStepNo(Integer stepNo) { this.stepNo = stepNo; }
    public String getStepName() { return stepName; }
    public void setStepName(String stepName) { this.stepName = stepName; }
    public LocalDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDateTime performedAt) { this.performedAt = performedAt; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Map<String, Object> toMap() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("processId", processId);
        payload.put("seasonId", seasonId);
        payload.put("stepNo", stepNo);
        payload.put("stepName", stepName);
        payload.put("performedAt", performedAt);
        payload.put("description", description);
        return payload;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ProcessBlockchainPayload payload = new ProcessBlockchainPayload();

        public Builder processId(Long value) { payload.setProcessId(value); return this; }
        public Builder seasonId(Long value) { payload.setSeasonId(value); return this; }
        public Builder stepNo(Integer value) { payload.setStepNo(value); return this; }
        public Builder stepName(String value) { payload.setStepName(value); return this; }
        public Builder performedAt(LocalDateTime value) { payload.setPerformedAt(value); return this; }
        public Builder description(String value) { payload.setDescription(value); return this; }
        public ProcessBlockchainPayload build() { return payload; }
    }
}
