package com.bicap.modules.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO để trả về lịch sử thay đổi trạng thái của đơn vận chuyển
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentHistoryResponse {
    
    /**
     * ID bản ghi lịch sử
     */
    private Long historyId;
    
    /**
     * ID đơn vận chuyển
     */
    private Long shipmentId;
    
    /**
     * Trạng thái trước đó
     */
    private String previousStatus;
    
    /**
     * Trạng thái mới
     */
    private String newStatus;
    
    /**
     * Người thực hiện thay đổi
     */
    private String changedByName;
    
    /**
     * Thời gian thay đổi
     */
    private LocalDateTime changedAt;
    
    /**
     * Lý do thay đổi (nếu có)
     */
    private String reason;
    
    /**
     * Vĩ độ (latitude) nơi thay đổi xảy ra
     */
    private Double latitude;
    
    /**
     * Kinh độ (longitude) nơi thay đổi xảy ra
     */
    private Double longitude;
}
