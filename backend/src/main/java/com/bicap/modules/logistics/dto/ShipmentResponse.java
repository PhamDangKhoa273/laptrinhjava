package com.bicap.modules.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO để trả về thông tin đơn vận chuyển
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentResponse {
    
    /**
     * ID đơn vận chuyển
     */
    private Long shipmentId;
    
    /**
     * ID đơn hàng
     */
    private Long orderId;
    
    /**
     * Thông tin tài xế
     */
    private DriverResponse driver;
    
    /**
     * Thông tin xe
     */
    private VehicleResponse vehicle;
    
    /**
     * Trạng thái vận chuyển (ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED)
     */
    private String status;
    
    /**
     * Thời gian giao đơn cho tài xế
     */
    private LocalDateTime assignedAt;
    
    /**
     * Thời gian tài xế lấy hàng từ Farm
     */
    private LocalDateTime pickedUpAt;
    
    /**
     * Thời gian giao hàng tại Retailer
     */
    private LocalDateTime deliveredAt;
    
    /**
     * Thời gian tạo
     */
    private LocalDateTime createdAt;
    
    /**
     * Thời gian cập nhật
     */
    private LocalDateTime updatedAt;
}
