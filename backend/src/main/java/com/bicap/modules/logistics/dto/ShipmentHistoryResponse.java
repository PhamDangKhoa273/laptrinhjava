package com.bicap.modules.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentHistoryResponse {
    private Long historyId;
    private Long shipmentId;
    private String previousStatus;
    private String newStatus;
    private String changedByName;
    private LocalDateTime changedAt;
    private String reason;
    private Double latitude;
    private Double longitude;
}
