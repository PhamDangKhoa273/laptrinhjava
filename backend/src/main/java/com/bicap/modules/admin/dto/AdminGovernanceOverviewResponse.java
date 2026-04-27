package com.bicap.modules.admin.dto;

import java.util.List;

public class AdminGovernanceOverviewResponse {
    private List<?> pendingListings;
    private List<?> openReports;
    private List<?> shipmentIssues;
    private List<?> blockchainTransactions;

    public List<?> getPendingListings() { return pendingListings; }
    public void setPendingListings(List<?> pendingListings) { this.pendingListings = pendingListings; }
    public List<?> getOpenReports() { return openReports; }
    public void setOpenReports(List<?> openReports) { this.openReports = openReports; }
    public List<?> getShipmentIssues() { return shipmentIssues; }
    public void setShipmentIssues(List<?> shipmentIssues) { this.shipmentIssues = shipmentIssues; }
    public List<?> getBlockchainTransactions() { return blockchainTransactions; }
    public void setBlockchainTransactions(List<?> blockchainTransactions) { this.blockchainTransactions = blockchainTransactions; }
}
