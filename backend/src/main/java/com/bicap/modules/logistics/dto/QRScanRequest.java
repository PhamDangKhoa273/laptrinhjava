package com.bicap.modules.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO để gửi yêu cầu quét mã QR
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QRScanRequest {
    
    /**
     * Giá trị mã QR được quét (base64 hoặc chuỗi text)
     */
    @NotBlank(message = "Giá trị mã QR không được để trống")
    private String qrCodeValue;
    
    /**
     * Loại QR (FARM_PICKUP hoặc RETAILER_DELIVERY)
     */
    private String qrType;
}
