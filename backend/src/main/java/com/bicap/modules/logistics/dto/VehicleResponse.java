package com.bicap.modules.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để trả về thông tin xe
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleResponse {
    /**
     * ID xe
     */
    private Long vehicleId;
    
    /**
     * Biển số xe
     */
    private String plateNo;
    
    /**
     * Loại xe (tải, pickup, ...)
     */
    private String vehicleType;
    
    /**
     * Sức chứa (kg hoặc tấn)
     */
    private Integer capacity;
    
    /**
     * Trạng thái xe (ACTIVE, INACTIVE, IN_USE, MAINTENANCE)
     */
    private String status;
    
    /**
     * ID quản lý xe
     */
    private Long managerUserId;
    
    /**
     * Tên quản lý xe
     */
    private String managerFullName;
}
