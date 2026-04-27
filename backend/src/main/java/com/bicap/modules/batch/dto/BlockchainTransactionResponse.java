package com.bicap.modules.batch.dto;

import java.time.LocalDateTime;

public class BlockchainTransactionResponse {
    private Long txId;
    private String relatedEntityType;
    private Long relatedEntityId;
    private String actionType;
    private String txHash;
    private String txStatus;
    private String governanceStatus;
    private String governanceNote;
    private Integer retryCount;
    private LocalDateTime lastRetryAt;
    private LocalDateTime createdAt;

    public Long getTxId() { return txId; }
    public void setTxId(Long txId) { this.txId = txId; }
    public String getRelatedEntityType() { return relatedEntityType; }
    public void setRelatedEntityType(String relatedEntityType) { this.relatedEntityType = relatedEntityType; }
    public Long getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(Long relatedEntityId) { this.relatedEntityId = relatedEntityId; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getTxHash() { return txHash; }
    public void setTxHash(String txHash) { this.txHash = txHash; }
    public String getTxStatus() { return txStatus; }
    public void setTxStatus(String txStatus) { this.txStatus = txStatus; }
    public String getGovernanceStatus() { return governanceStatus; }
    public void setGovernanceStatus(String governanceStatus) { this.governanceStatus = governanceStatus; }
    public String getGovernanceNote() { return governanceNote; }
    public void setGovernanceNote(String governanceNote) { this.governanceNote = governanceNote; }
    public Integer getRetryCount() { return retryCount; }
    public void setRetryCount(Integer retryCount) { this.retryCount = retryCount; }
    public LocalDateTime getLastRetryAt() { return lastRetryAt; }
    public void setLastRetryAt(LocalDateTime lastRetryAt) { this.lastRetryAt = lastRetryAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
