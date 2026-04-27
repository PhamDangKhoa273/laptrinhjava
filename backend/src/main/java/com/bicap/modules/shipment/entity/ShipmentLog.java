package com.bicap.modules.shipment.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipment_logs")
public class ShipmentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @Column(name = "shipment_id", nullable = false)
    private Long shipmentId;

    @Column(name = "type", nullable = false, length = 30)
    private String type; // CHECKPOINT, PICKUP, HANDOVER

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "qr_evidence", length = 500)
    private String qrEvidence;

    @Column(name = "override_reason", length = 500)
    private String overrideReason;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    public void onCreate() {
        if (recordedAt == null) {
            recordedAt = LocalDateTime.now();
        }
    }

    public Long getLogId() { return logId; }
    public void setLogId(Long logId) { this.logId = logId; }
    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getQrEvidence() { return qrEvidence; }
    public void setQrEvidence(String qrEvidence) { this.qrEvidence = qrEvidence; }
    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
}
