package com.bicap.modules.batch.entity;

import com.bicap.core.enums.QrCodeStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "qr_codes")
public class QrCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "qr_code_id")
    private Long qrCodeId;

    @Transient
    private String serialNo;
    
    private String qrValue;
    
    @Column(name = "qr_url")
    private String qrUrl;
    
    private String status;
    private LocalDateTime generatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private ProductBatch batch;

    public Long getQrCodeId() { return qrCodeId; }
    public void setQrCodeId(Long id) { this.qrCodeId = id; }
    public String getQrValue() { return qrValue; }
    public void setQrValue(String s) { this.qrValue = s; }
    public String getQrUrl() { return qrUrl; }
    public void setQrUrl(String s) { this.qrUrl = s; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public String getSerialNo() { return serialNo; }
    public void setSerialNo(String s) { this.serialNo = s; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime t) { this.generatedAt = t; }
    public void setBatch(ProductBatch b) { this.batch = b; }
    public ProductBatch getBatch() { return batch; }
    public QrCodeStatus getStatusEnum() { return status == null ? null : QrCodeStatus.valueOf(status); }
    public void setStatus(QrCodeStatus status) { this.status = status != null ? status.name() : null; }
}
