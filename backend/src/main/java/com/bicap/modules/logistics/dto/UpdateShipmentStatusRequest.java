package com.bicap.modules.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO để cập nhật trạng thái shipment (thay đổi thủ công)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateShipmentStatusRequest {
    
    /**
     * Trạng thái mới (ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED)
     */
    @NotBlank(message = "Trạng thái mới không được để trống")
    private String newStatus;
    
    /**
     * Lý do thay đổi (tùy chọn)
     */
    private String reason;
}
