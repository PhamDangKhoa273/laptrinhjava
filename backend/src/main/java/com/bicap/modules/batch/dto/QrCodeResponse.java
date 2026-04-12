package com.bicap.modules.batch.dto;

import java.time.LocalDateTime;

public class QrCodeResponse {
    private Long id;
    private String serialNo;
    private String qrCodeData;
    private String qrImageBase64;
    private String status;
    private LocalDateTime generatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSerialNo() { return serialNo; }
    public void setSerialNo(String s) { this.serialNo = s; }
    public String getQrCodeData() { return qrCodeData; }
    public void setQrCodeData(String s) { this.qrCodeData = s; }
    public String getQrImageBase64() { return qrImageBase64; }
    public void setQrImageBase64(String s) { this.qrImageBase64 = s; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime t) { this.generatedAt = t; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private QrCodeResponse r = new QrCodeResponse();
        public Builder id(Long l) { r.setId(l); return this; }
        public Builder qrCodeId(Long l) { r.setId(l); return this; }
        public Builder batchId(Long l) { return this; }
        public Builder serialNo(String s) { r.setSerialNo(s); return this; }
        public Builder qrCodeData(String s) { r.setQrCodeData(s); return this; }
        public Builder qrImageBase64(String s) { r.setQrImageBase64(s); return this; }
        public Builder qrValue(String s) { r.setQrCodeData(s); return this; }
        public Builder status(String s) { r.setStatus(s); return this; }
        public Builder generatedAt(LocalDateTime t) { r.setGeneratedAt(t); return this; }
        public QrCodeResponse build() { return r; }
    }
}
