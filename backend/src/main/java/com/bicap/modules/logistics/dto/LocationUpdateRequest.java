package com.bicap.modules.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

/**
 * DTO để cập nhật vị trí GPS của tài xế
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationUpdateRequest {
    
    /**
     * ID đơn vận chuyển đang vận chuyển
     */
    @NotNull(message = "ID đơn vận chuyển không được để trống")
    private Long shipmentId;
    
    /**
     * Vĩ độ (latitude)
     */
    @NotNull(message = "Vĩ độ không được để trống")
    private Double latitude;
    
    /**
     * Kinh độ (longitude)
     */
    @NotNull(message = "Kinh độ không được để trống")
    private Double longitude;
    
    /**
     * Độ chính xác của vị trí (meters)
     */
    private Float accuracy;
}
