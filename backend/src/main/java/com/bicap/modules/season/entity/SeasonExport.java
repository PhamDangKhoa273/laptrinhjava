package com.bicap.modules.season.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "season_exports")
public class SeasonExport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "export_id")
    private Long exportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id", nullable = false)
    private FarmingSeason season;

    @Column(name = "trace_code", nullable = false, length = 100)
    private String traceCode;

    @Column(name = "public_trace_url", nullable = false, length = 500)
    private String publicTraceUrl;

    @Column(name = "data_hash", nullable = false, length = 100)
    private String dataHash;

    @Column(name = "vechain_tx_id", length = 100)
    private String vechainTxId;

    @Lob
    @Column(name = "payload_json", columnDefinition = "LONGTEXT")
    private String payloadJson;

    @Lob
    @Column(name = "qr_image_base64", columnDefinition = "LONGTEXT")
    private String qrImageBase64;

    @Column(name = "exported_at", nullable = false)
    private LocalDateTime exportedAt;

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;

    public Long getExportId() { return exportId; }
    public void setExportId(Long exportId) { this.exportId = exportId; }

    public FarmingSeason getSeason() { return season; }
    public void setSeason(FarmingSeason season) { this.season = season; }

    public String getTraceCode() { return traceCode; }
    public void setTraceCode(String traceCode) { this.traceCode = traceCode; }

    public String getPublicTraceUrl() { return publicTraceUrl; }
    public void setPublicTraceUrl(String publicTraceUrl) { this.publicTraceUrl = publicTraceUrl; }

    public String getDataHash() { return dataHash; }
    public void setDataHash(String dataHash) { this.dataHash = dataHash; }

    public String getPayloadJson() { return payloadJson; }
    public void setPayloadJson(String payloadJson) { this.payloadJson = payloadJson; }

    public String getVechainTxId() { return vechainTxId; }
    public void setVechainTxId(String vechainTxId) { this.vechainTxId = vechainTxId; }

    public String getQrImageBase64() { return qrImageBase64; }
    public void setQrImageBase64(String qrImageBase64) { this.qrImageBase64 = qrImageBase64; }

    public LocalDateTime getExportedAt() { return exportedAt; }
    public void setExportedAt(LocalDateTime exportedAt) { this.exportedAt = exportedAt; }

    public Long getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(Long createdByUserId) { this.createdByUserId = createdByUserId; }
}
