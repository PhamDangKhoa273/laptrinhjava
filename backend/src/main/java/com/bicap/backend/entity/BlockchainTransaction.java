package com.bicap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

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
    private Long txId;

    @Column(name = "related_entity_type", nullable = false)
    private String relatedEntityType;

    @Column(name = "related_entity_id", nullable = false)
    private Long relatedEntityId;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @Column(name = "tx_hash", nullable = false, unique = true)
    private String txHash;

    @Column(name = "tx_status", nullable = false)
    private String txStatus = "PENDING";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Manual Builder as fallback
    public static class BlockchainTransactionBuilder {
        private String relatedEntityType;
        private Long relatedEntityId;
        private String actionType;
        private String txHash;
        private String txStatus;

        public BlockchainTransactionBuilder relatedEntityType(String type) { this.relatedEntityType = type; return this; }
        public BlockchainTransactionBuilder relatedEntityId(Long id) { this.relatedEntityId = id; return this; }
        public BlockchainTransactionBuilder actionType(String type) { this.actionType = type; return this; }
        public BlockchainTransactionBuilder txHash(String hash) { this.txHash = hash; return this; }
        public BlockchainTransactionBuilder txStatus(String status) { this.txStatus = status; return this; }

        public BlockchainTransaction build() {
            BlockchainTransaction tx = new BlockchainTransaction();
            tx.setRelatedEntityType(this.relatedEntityType);
            tx.setRelatedEntityId(this.relatedEntityId);
            tx.setActionType(this.actionType);
            tx.setTxHash(this.txHash);
            tx.setTxStatus(this.txStatus != null ? this.txStatus : "PENDING");
            return tx;
        }
    }

    public static BlockchainTransactionBuilder builder() {
        return new BlockchainTransactionBuilder();
    }

    public String getTxHash() { return txHash; }
}
