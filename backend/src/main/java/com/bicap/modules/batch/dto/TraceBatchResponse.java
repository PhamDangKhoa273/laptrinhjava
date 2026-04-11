package com.bicap.modules.batch.dto;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.math.BigDecimal;

public class TraceBatchResponse {
    private BatchResponse batch;
    private QrCodeResponse qrInfo;
    private List<ProcessTraceItemDto> timeline;
    private Map<String, Object> seasonInfo;
    private List<Map<String, Object>> processList;
    private String note;

    public void setBatch(BatchResponse b) { this.batch = b; }
    public void setQrInfo(QrCodeResponse q) { this.qrInfo = q; }
    public void setTimeline(List<ProcessTraceItemDto> l) { this.timeline = l; }
    public void setSeasonInfo(Map<String, Object> m) { this.seasonInfo = m; }
    public void setProcessList(List<Map<String, Object>> l) { this.processList = l; }
    public void setNote(String s) { this.note = s; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private TraceBatchResponse r = new TraceBatchResponse();
        public Builder batch(BatchResponse b) { r.setBatch(b); return this; }
        public Builder qrInfo(QrCodeResponse q) { r.setQrInfo(q); return this; }
        public Builder seasonInfo(Map<String, Object> m) { r.setSeasonInfo(m); return this; }
        public Builder processList(List<Map<String, Object>> l) { r.setProcessList(l); return this; }
        public Builder note(String s) { r.setNote(s); return this; }
        public Builder batchId(Long l) { return this; }
        public Builder batchCode(String s) { return this; }
        public Builder harvestDate(LocalDate d) { return this; }
        public Builder quantity(BigDecimal d) { return this; }
        public Builder availableQuantity(BigDecimal d) { return this; }
        public Builder qualityGrade(String s) { return this; }
        public Builder batchStatus(String s) { return this; }
        public Builder expiryDate(LocalDate d) { return this; }
        public Builder productId(Long l) { return this; }
        public Builder seasonId(Long l) { return this; }
        public Builder timeline(List<ProcessTraceItemDto> l) { r.setTimeline(l); return this; }
        public TraceBatchResponse build() { return r; }
    }
}
