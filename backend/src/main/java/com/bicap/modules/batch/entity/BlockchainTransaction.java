package com.bicap.modules.batch.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blockchain_transactions")
public class BlockchainTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tx_id")
    private Long txId;

    private String relatedEntityType;
    private Long relatedEntityId;
    private String actionType;
    private String txHash;
    private String txStatus;
    private LocalDateTime createdAt;

    public Long getTxId() { return txId; }
    public void setTxId(Long id) { this.txId = id; }
    public Long getId() { return txId; }
    public void setId(Long id) { this.txId = id; }

    public String getRelatedEntityType() { return relatedEntityType; }
    public void setRelatedEntityType(String s) { this.relatedEntityType = s; }
    public Long getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(Long id) { this.relatedEntityId = id; }
    public String getActionType() { return actionType; }
    public void setActionType(String s) { this.actionType = s; }
    public String getTxHash() { return txHash; }
    public void setTxHash(String s) { this.txHash = s; }
    public String getTxStatus() { return txStatus; }
    public void setTxStatus(String s) { this.txStatus = s; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
