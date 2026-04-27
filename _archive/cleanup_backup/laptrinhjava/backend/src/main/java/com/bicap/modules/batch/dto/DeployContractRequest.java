package com.bicap.modules.batch.dto;

public class DeployContractRequest {
    /**
     * Dry-run mode validates configuration without attempting to deploy.
     */
    private boolean dryRun = true;
    private String contractAddress;

    public boolean isDryRun() {
        return dryRun;
    }

    public void setDryRun(boolean dryRun) {
        this.dryRun = dryRun;
    }

    public String getContractAddress() {
        return contractAddress;
    }

    public void setContractAddress(String contractAddress) {
        this.contractAddress = contractAddress;
    }
}

