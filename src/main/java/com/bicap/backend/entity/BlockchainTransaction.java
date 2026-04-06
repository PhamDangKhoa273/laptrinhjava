package com.bicap.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blockchain_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockchainTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tx_id")
    private Long id;

    @Column(name = "related_entity_type", nullable = false)
    private String relatedEntityType;

    @Column(name = "related_entity_id", nullable = false)
    private Long relatedEntityId;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @Column(name = "tx_hash", nullable = false, unique = true)
    private String txHash;

    @Column(name = "tx_status", nullable = false)
    private String txStatus;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
