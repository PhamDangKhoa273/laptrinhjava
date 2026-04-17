package com.bicap.modules.order.dto;

import java.util.HashMap;
import java.util.Map;

public class OrderStatusBlockchainPayload {
    
    private Long orderId;
    private Long retailerId;
    private Long farmId;
    private String previousStatus;
    private String newStatus;
    private String reason;
    private String timestamp;

    public OrderStatusBlockchainPayload() {
    }

    public OrderStatusBlockchainPayload(Long orderId, Long retailerId, Long farmId, 
                                        String previousStatus, String newStatus, 
                                        String reason, String timestamp) {
        this.orderId = orderId;
        this.retailerId = retailerId;
        this.farmId = farmId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.reason = reason;
        this.timestamp = timestamp;
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("orderId", orderId);
        map.put("retailerId", retailerId);
        map.put("farmId", farmId);
        map.put("previousStatus", previousStatus);
        map.put("newStatus", newStatus);
        map.put("reason", reason != null ? reason : "");
        map.put("timestamp", timestamp);
        return map;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getRetailerId() {
        return retailerId;
    }

    public void setRetailerId(Long retailerId) {
        this.retailerId = retailerId;
    }

    public Long getFarmId() {
        return farmId;
    }

    public void setFarmId(Long farmId) {
        this.farmId = farmId;
    }

    public String getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
