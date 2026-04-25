package com.bicap.modules.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

/**
 * DTO để giao một đơn hàng cho tài xế
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignShipmentRequest {
    
    /**
     * ID đơn hàng cần giao
     */
    @NotNull(message = "ID đơn hàng không được để trống")
    private Long orderId;
    
    /**
     * ID tài xế nhận đơn
     */
    @NotNull(message = "ID tài xế không được để trống")
    private Long driverId;
    
    /**
     * ID xe sẽ dùng để giao hàng
     */
    @NotNull(message = "ID xe không được để trống")
    private Long vehicleId;
}
