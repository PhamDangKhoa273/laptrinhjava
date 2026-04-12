package com.bicap.modules.batch.dto;

import java.time.LocalDateTime;
import java.time.LocalDate;

public class ProcessTraceItemDto {
    private Integer stepNo;
    private String action;
    private String description;
    private LocalDateTime timestamp;
    private String txHash;
    private String status;
    private String operatorName;

    public Integer getStepNo() { return stepNo; }
    public void setStepNo(Integer i) { this.stepNo = i; }
    
    public String getAction() { return action; }
    public void setAction(String s) { this.action = s; }
    
    public String getDescription() { return description; }
    public void setDescription(String s) { this.description = s; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime t) { this.timestamp = t; }
    
    public String getTxHash() { return txHash; }
    public void setTxHash(String s) { this.txHash = s; }
    
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    
    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String s) { this.operatorName = s; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private ProcessTraceItemDto r = new ProcessTraceItemDto();
        public Builder stepNo(Integer i) { r.setStepNo(i); return this; }
        public Builder action(String s) { r.setAction(s); return this; }
        public Builder actionType(String s) { r.setAction(s); return this; }
        public Builder stage(String s) { r.setAction(s); return this; }
        public Builder description(String s) { r.setDescription(s); return this; }
        public Builder notes(String s) { r.setDescription(s); return this; }
        public Builder timestamp(LocalDateTime t) { r.setTimestamp(t); return this; }
        public Builder recordedAt(LocalDateTime t) { r.setTimestamp(t); return this; }
        public Builder processDate(LocalDate d) { r.setTimestamp(d != null ? d.atStartOfDay() : null); return this; }
        public Builder txHash(String s) { r.setTxHash(s); return this; }
        public Builder status(String s) { r.setStatus(s); return this; }
        public Builder operatorName(String s) { r.setOperatorName(s); return this; }
        public Builder processName(String s) { r.setAction(s); return this; }
        public Builder processCode(String s) { return this; }
        public ProcessTraceItemDto build() { return r; }
    }
}
