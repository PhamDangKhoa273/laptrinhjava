package com.bicap.modules.batch.dto;

import java.time.LocalDateTime;

public class BlockchainResult {
    private String txHash;
    private String status;
    private String message;
    private LocalDateTime timestamp;

    public String getTxHash() { return txHash; }
    public void setTxHash(String txHash) { this.txHash = txHash; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final BlockchainResult result = new BlockchainResult();

        public Builder txHash(String value) { result.setTxHash(value); return this; }
        public Builder status(String value) { result.setStatus(value); return this; }
        public Builder message(String value) { result.setMessage(value); return this; }
        public Builder timestamp(LocalDateTime value) { result.setTimestamp(value); return this; }
        public BlockchainResult build() { return result; }
    }
}
