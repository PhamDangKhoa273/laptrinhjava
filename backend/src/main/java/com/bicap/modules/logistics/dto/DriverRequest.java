package com.bicap.modules.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO để tạo hoặc cập nhật thông tin tài xế
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverRequest {
    
    /**
     * ID của người dùng (phải là tài xế trong hệ thống)
     */
    @NotNull(message = "ID người dùng không được để trống")
    private Long userId;
    
    /**
     * Số giấy phép lái xe
     */
    @NotBlank(message = "Số giấy phép lái xe không được để trống")
    private String licensePlate;
    
    /**
     * Số điện thoại của tài xế
     */
    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;
    
    /**
     * Trạng thái tài xế (ACTIVE, INACTIVE, ON_DELIVERY)
     */
    private String status;
}
