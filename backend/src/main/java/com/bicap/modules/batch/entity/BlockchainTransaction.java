package com.bicap.modules.batch.entity;

import com.bicap.core.enums.BlockchainGovernanceStatus;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "governance_status", length = 30)
    private BlockchainGovernanceStatus governanceStatus;

    @Column(name = "governance_note", length = 500)
    private String governanceNote;

    @Column(name = "retry_count")
    private Integer retryCount;

    @Column(name = "last_retry_at")
    private LocalDateTime lastRetryAt;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (retryCount == null) {
            retryCount = 0;
        }
        if (governanceStatus == null) {
            governanceStatus = BlockchainGovernanceStatus.PENDING;
        }
    }

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
    public BlockchainGovernanceStatus getGovernanceStatus() { return governanceStatus; }
    public void setGovernanceStatus(BlockchainGovernanceStatus governanceStatus) { this.governanceStatus = governanceStatus; }
    public String getGovernanceNote() { return governanceNote; }
    public void setGovernanceNote(String governanceNote) { this.governanceNote = governanceNote; }
    public Integer getRetryCount() { return retryCount; }
    public void setRetryCount(Integer retryCount) { this.retryCount = retryCount; }
    public LocalDateTime getLastRetryAt() { return lastRetryAt; }
    public void setLastRetryAt(LocalDateTime lastRetryAt) { this.lastRetryAt = lastRetryAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
