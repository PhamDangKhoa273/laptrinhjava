package com.bicap.modules.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO để trả về thông tin vị trí GPS
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackingLocationResponse {
    
    /**
     * ID vị trí theo dõi
     */
    private Long locationId;
    
    /**
     * ID đơn vận chuyển
     */
    private Long shipmentId;
    
    /**
     * ID tài xế
     */
    private Long driverId;
    
    /**
     * Vĩ độ (latitude)
     */
    private Double latitude;
    
    /**
     * Kinh độ (longitude)
     */
    private Double longitude;
    
    /**
     * Độ chính xác (meters)
     */
    private Float accuracy;
    
    /**
     * Thời gian ghi nhận vị trí
     */
    private LocalDateTime createdAt;
}
