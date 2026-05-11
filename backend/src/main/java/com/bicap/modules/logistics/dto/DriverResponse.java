package com.bicap.modules.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để trả về thông tin tài xế
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverResponse {
    /**
     * ID tài xế
     */
    private Long driverId;
    
    /**
     * Mã tài xế
     */
    private String driverCode;
    
    /**
     * Số giấy phép lái xe
     */
    private String licenseNo;
    
    /**
     * Trạng thái (ACTIVE, INACTIVE, ON_DELIVERY)
     */
    private String status;
    
    /**
     * ID người dùng
     */
    private Long userId;
    
    /**
     * Tên đầy đủ của tài xế
     */
    private String userFullName;
    
    /**
     * ID quản lý vận chuyển
     */
    private Long managerUserId;
    
    /**
     * Tên quản lý vận chuyển
     */
    private String managerFullName;
}
