package com.bicap.modules.batch.dto;

public class VerifyTraceResponse {
    private Long batchId;
    private String localHash;
    private String onChainHash;
    private boolean matched;

    public VerifyTraceResponse() {
    }

    public VerifyTraceResponse(Long batchId, String localHash, String onChainHash, boolean matched) {
        this.batchId = batchId;
        this.localHash = localHash;
        this.onChainHash = onChainHash;
        this.matched = matched;
    }

    public Long getBatchId() {
        return batchId;
    }

    public void setBatchId(Long batchId) {
        this.batchId = batchId;
    }

    public String getLocalHash() {
        return localHash;
    }

    public void setLocalHash(String localHash) {
        this.localHash = localHash;
    }

    public String getOnChainHash() {
        return onChainHash;
    }

    public void setOnChainHash(String onChainHash) {
        this.onChainHash = onChainHash;
    }

    public boolean isMatched() {
        return matched;
    }

    public void setMatched(boolean matched) {
        this.matched = matched;
    }
}
