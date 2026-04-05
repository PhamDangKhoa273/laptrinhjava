package com.bicap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "blockchain_transactions")
@Getter
@Setter
public class BlockchainTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blockchain_tx_id")
    private Long blockchainTxId;

    @Column(name = "related_entity_type", nullable = false, length = 50)
    private String relatedEntityType;

    @Column(name = "related_entity_id", nullable = false)
    private Long relatedEntityId;

    @Column(name = "action_type", nullable = false, length = 30)
    private String actionType;

    @Column(name = "tx_hash", nullable = false, length = 255)
    private String txHash;

    @Column(name = "tx_status", nullable = false, length = 30)
    private String txStatus;

    @Column(name = "message", length = 255)
    private String message;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

