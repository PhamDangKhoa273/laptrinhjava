package com.bicap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "qr_codes")
@Getter
@Setter
public class QrCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "qr_code_id")
    private Long qrCodeId;

    @OneToOne(optional = false)
    @JoinColumn(name = "batch_id", nullable = false, unique = true)
    private ProductBatch batch;

    @Column(name = "qr_value", nullable = false, columnDefinition = "TEXT")
    private String qrValue;

    @Column(name = "qr_url", length = 255)
    private String qrUrl;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    @PrePersist
    public void onCreate() {
        this.generatedAt = LocalDateTime.now();
    }
}

