package com.bicap.modules.logistics.repository;

import com.bicap.modules.logistics.entity.ShippingQRCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShippingQRCodeRepository extends JpaRepository<ShippingQRCode, Long> {
    
    /**
     * Tìm mã QR dựa trên giá trị của nó (sử dụng khi tài xế quét QR)
     */
    Optional<ShippingQRCode> findByQrCodeValue(String qrCodeValue);
    
    /**
     * Tìm tất cả mã QR cho một đơn hàng cụ thể
     */
    List<ShippingQRCode> findByOrderId(Long orderId);
    
    /**
     * Tìm tất cả mã QR của một loại cụ thể (FARM_PICKUP hoặc RETAILER_DELIVERY)
     */
    List<ShippingQRCode> findByQrType(String qrType);
    
    /**
     * Tìm các mã QR chưa được quét cho một đơn hàng (scannedAt là null)
     */
    List<ShippingQRCode> findByOrderIdAndScannedAtIsNull(Long orderId);
}
