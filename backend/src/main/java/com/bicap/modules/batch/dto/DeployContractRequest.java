package com.bicap.modules.batch.dto;

public class DeployContractRequest {
    /**
     * Dry-run mode validates configuration without attempting to deploy.
     */
    private boolean dryRun = true;
    private String contractAddress;
    private String actionType;

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

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }
}

