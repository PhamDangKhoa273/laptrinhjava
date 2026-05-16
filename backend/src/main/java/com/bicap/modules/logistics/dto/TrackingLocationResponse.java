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
public class TrackingLocationResponse {
    private Long locationId;
    private Long shipmentId;
    private Long driverId;
    private Double latitude;
    private Double longitude;
    private Float accuracy;
    private LocalDateTime createdAt;
}
