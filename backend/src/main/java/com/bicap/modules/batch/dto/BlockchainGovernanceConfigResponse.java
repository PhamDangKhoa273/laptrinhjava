package com.bicap.modules.batch.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class BlockchainGovernanceConfigResponse {
    private String contractName;
    private String contractAddress;
    private String contractVersion;
    private String contractNetwork;
    private boolean enabled;
    private boolean active;
    private String deploymentStatus;
    private String governanceStatus;
    private String governanceNote;
    private int readinessScore;
    private List<String> missingRequirements = new ArrayList<>();
    private boolean writeMode;
    private boolean safeMode;
    private LocalDateTime lastCheckedAt;

    public String getContractName() { return contractName; }
    public void setContractName(String contractName) { this.contractName = contractName; }
    public String getContractAddress() { return contractAddress; }
    public void setContractAddress(String contractAddress) { this.contractAddress = contractAddress; }
    public String getContractVersion() { return contractVersion; }
    public void setContractVersion(String contractVersion) { this.contractVersion = contractVersion; }
    public String getContractNetwork() { return contractNetwork; }
    public void setContractNetwork(String contractNetwork) { this.contractNetwork = contractNetwork; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getDeploymentStatus() { return deploymentStatus; }
    public void setDeploymentStatus(String deploymentStatus) { this.deploymentStatus = deploymentStatus; }
    public String getGovernanceStatus() { return governanceStatus; }
    public void setGovernanceStatus(String governanceStatus) { this.governanceStatus = governanceStatus; }
    public String getGovernanceNote() { return governanceNote; }
    public void setGovernanceNote(String governanceNote) { this.governanceNote = governanceNote; }
    public int getReadinessScore() { return readinessScore; }
    public void setReadinessScore(int readinessScore) { this.readinessScore = readinessScore; }
    public List<String> getMissingRequirements() { return missingRequirements; }
    public void setMissingRequirements(List<String> missingRequirements) { this.missingRequirements = missingRequirements != null ? missingRequirements : new ArrayList<>(); }
    public boolean isWriteMode() { return writeMode; }
    public void setWriteMode(boolean writeMode) { this.writeMode = writeMode; }
    public boolean isSafeMode() { return safeMode; }
    public void setSafeMode(boolean safeMode) { this.safeMode = safeMode; }
    public LocalDateTime getLastCheckedAt() { return lastCheckedAt; }
    public void setLastCheckedAt(LocalDateTime lastCheckedAt) { this.lastCheckedAt = lastCheckedAt; }
}
