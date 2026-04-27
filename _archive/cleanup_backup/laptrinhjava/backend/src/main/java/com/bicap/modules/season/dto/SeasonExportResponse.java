package com.bicap.modules.season.dto;

import java.time.LocalDateTime;

public class SeasonExportResponse {
    private Long exportId;
    private Long seasonId;
    private String seasonCode;
    private String traceCode;
    private String publicTraceUrl;
    private String dataHash;
    private String vechainTxId;
    private String vechainTxStatus;
    private String vechainReceiptNote;
    private String qrImageBase64;
    private LocalDateTime exportedAt;

    public Long getExportId() { return exportId; }
    public void setExportId(Long exportId) { this.exportId = exportId; }
    public Long getSeasonId() { return seasonId; }
    public void setSeasonId(Long seasonId) { this.seasonId = seasonId; }
    public String getSeasonCode() { return seasonCode; }
    public void setSeasonCode(String seasonCode) { this.seasonCode = seasonCode; }
    public String getTraceCode() { return traceCode; }
    public void setTraceCode(String traceCode) { this.traceCode = traceCode; }
    public String getPublicTraceUrl() { return publicTraceUrl; }
    public void setPublicTraceUrl(String publicTraceUrl) { this.publicTraceUrl = publicTraceUrl; }
    public String getDataHash() { return dataHash; }
    public void setDataHash(String dataHash) { this.dataHash = dataHash; }
    public String getVechainTxId() { return vechainTxId; }
    public void setVechainTxId(String vechainTxId) { this.vechainTxId = vechainTxId; }
    public String getVechainTxStatus() { return vechainTxStatus; }
    public void setVechainTxStatus(String vechainTxStatus) { this.vechainTxStatus = vechainTxStatus; }
    public String getVechainReceiptNote() { return vechainReceiptNote; }
    public void setVechainReceiptNote(String vechainReceiptNote) { this.vechainReceiptNote = vechainReceiptNote; }
    public String getQrImageBase64() { return qrImageBase64; }
    public void setQrImageBase64(String qrImageBase64) { this.qrImageBase64 = qrImageBase64; }
    public LocalDateTime getExportedAt() { return exportedAt; }
    public void setExportedAt(LocalDateTime exportedAt) { this.exportedAt = exportedAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final SeasonExportResponse r = new SeasonExportResponse();
        public Builder exportId(Long v) { r.setExportId(v); return this; }
        public Builder seasonId(Long v) { r.setSeasonId(v); return this; }
        public Builder seasonCode(String v) { r.setSeasonCode(v); return this; }
        public Builder traceCode(String v) { r.setTraceCode(v); return this; }
        public Builder publicTraceUrl(String v) { r.setPublicTraceUrl(v); return this; }
        public Builder dataHash(String v) { r.setDataHash(v); return this; }
        public Builder vechainTxId(String v) { r.setVechainTxId(v); return this; }
        public Builder vechainTxStatus(String v) { r.setVechainTxStatus(v); return this; }
        public Builder vechainReceiptNote(String v) { r.setVechainReceiptNote(v); return this; }
        public Builder qrImageBase64(String v) { r.setQrImageBase64(v); return this; }
        public Builder exportedAt(LocalDateTime v) { r.setExportedAt(v); return this; }
        public SeasonExportResponse build() { return r; }
    }
}
