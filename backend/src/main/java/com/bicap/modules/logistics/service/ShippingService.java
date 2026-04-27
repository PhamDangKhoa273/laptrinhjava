package com.bicap.modules.logistics.service;

import com.bicap.core.exception.BadRequestException;
import com.bicap.core.exception.ResourceNotFoundException;
import com.bicap.modules.logistics.dto.AssignShipmentRequest;
import com.bicap.modules.logistics.dto.ShipmentHistoryResponse;
import com.bicap.modules.logistics.dto.ShipmentResponse;
import com.bicap.modules.logistics.entity.*;
import com.bicap.modules.logistics.repository.*;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service quản lý vận chuyển: giao đơn, quét QR, cập nhật trạng thái
 */
@Service
@RequiredArgsConstructor
public class ShippingService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentHistoryRepository shipmentHistoryRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ShippingQRCodeRepository qrCodeRepository;

    /**
     * Giao đơn hàng cho tài xế
     */
    @Transactional
    public ShipmentResponse assignShipment(AssignShipmentRequest request, Long shippingManagerId) {
        // 1. Kiểm tra đơn hàng tồn tại
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        
        // 2. Kiểm tra tài xế tồn tại
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Tài xế không tồn tại"));
        
        // 3. Kiểm tra xe tồn tại
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Xe không tồn tại"));
        
        // 4. Kiểm tra xe có sẵn
        if (!"AVAILABLE".equals(vehicle.getStatus())) {
            throw new BadRequestException("Xe này không sẵn sàng (trạng thái: " + vehicle.getStatus() + ")");
        }
        
        // 5. Kiểm tra shipment chưa tồn tại cho đơn hàng này
        if (shipmentRepository.findByOrderId(request.getOrderId()).isPresent()) {
            throw new BadRequestException("Đơn hàng này đã có shipment rồi");
        }
        
        // 6. Tạo shipment mới
        Shipment shipment = new Shipment();
        shipment.setOrder(order);
        shipment.setDriver(driver);
        shipment.setVehicle(vehicle);
        shipment.setShippingManager(userRepository.findById(shippingManagerId)
                .orElseThrow(() -> new ResourceNotFoundException("Quản lý vận chuyển không tồn tại")));
        shipment.setStatus("ASSIGNED");
        
        Shipment saved = shipmentRepository.save(shipment);
        
        // 7. Ghi lịch sử
        recordShipmentHistory(saved, null, "ASSIGNED", shippingManagerId, "Giao đơn cho tài xế");
        
        // 8. Cập nhật trạng thái xe thành IN_USE
        vehicle.setStatus("IN_USE");
        vehicleRepository.save(vehicle);
        
        // 9. Cập nhật trạng thái tài xế thành ON_DELIVERY
        driver.setStatus("ON_DELIVERY");
        driverRepository.save(driver);
        
        return toShipmentResponse(saved);
    }

    /**
     * Quét mã QR và cập nhật trạng thái shipment
     */
    @Transactional
    public ShipmentResponse scanQRCode(String qrCodeValue, Long driverId) {
        // 1. Tìm QR code
        ShippingQRCode qrCode = qrCodeRepository.findByQrCodeValue(qrCodeValue)
                .orElseThrow(() -> new ResourceNotFoundException("Mã QR không hợp lệ"));
        
        // 2. Kiểm tra QR code này chưa được quét
        if (qrCode.getScannedAt() != null) {
            throw new BadRequestException("Mã QR này đã được quét rồi lúc: " + qrCode.getScannedAt());
        }
        
        // 3. Tìm shipment của đơn hàng này
        Shipment shipment = shipmentRepository.findByOrderId(qrCode.getOrder().getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy shipment cho đơn hàng này"));
        
        // 4. Kiểm tra tài xế là người được giao đơn
        if (!shipment.getDriver().getDriverId().equals(driverId)) {
            throw new BadRequestException("Bạn không phải là tài xế được giao đơn này");
        }
        
        // 5. Cập nhật thời gian quét
        qrCode.setScannedAt(LocalDateTime.now());
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Tài xế không tồn tại"));
        qrCode.setScannedBy(driver);
        qrCodeRepository.save(qrCode);
        
        // 6. Cập nhật trạng thái shipment dựa trên loại QR
        String newStatus = null;
        if ("FARM_PICKUP".equals(qrCode.getQrType())) {
            if (!"ASSIGNED".equals(shipment.getStatus())) {
                throw new BadRequestException("Shipment phải ở trạng thái ASSIGNED để quét QR pickup");
            }
            newStatus = "PICKED_UP";
            shipment.setPickedUpAt(LocalDateTime.now());
        } else if ("RETAILER_DELIVERY".equals(qrCode.getQrType())) {
            if (!"IN_TRANSIT".equals(shipment.getStatus())) {
                throw new BadRequestException("Shipment phải ở trạng thái IN_TRANSIT để quét QR delivery");
            }
            newStatus = "DELIVERED";
            shipment.setDeliveredAt(LocalDateTime.now());
        }
        
        // 7. Ghi lịch sử
        String oldStatus = shipment.getStatus();
        shipment.setStatus(newStatus);
        Shipment saved = shipmentRepository.save(shipment);
        
        recordShipmentHistory(saved, oldStatus, newStatus, driverId, "Quét QR: " + qrCode.getQrType());
        
        // 8. Nếu đã giao xong, cập nhật trạng thái xe và tài xế
        if ("DELIVERED".equals(newStatus)) {
            Vehicle vehicle = shipment.getVehicle();
            if (vehicle != null) {
                vehicle.setStatus("AVAILABLE");
                vehicleRepository.save(vehicle);
            }
            
            Driver driverEntity = shipment.getDriver();
            driverEntity.setStatus("ACTIVE");
            driverRepository.save(driverEntity);
        }
        
        return toShipmentResponse(saved);
    }

    /**
     * Cập nhật trạng thái shipment (thay đổi thủ công)
     */
    @Transactional
    public ShipmentResponse updateShipmentStatus(Long shipmentId, String newStatus, String reason, Long userId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment không tồn tại"));
        
        // Kiểm tra trạng thái hợp lệ
        if (!isValidStatus(newStatus)) {
            throw new BadRequestException("Trạng thái không hợp lệ: " + newStatus);
        }
        
        String oldStatus = shipment.getStatus();
        shipment.setStatus(newStatus);
        
        // Cập nhật thời gian nếu là PICKED_UP hoặc DELIVERED
        if ("PICKED_UP".equals(newStatus)) {
            shipment.setPickedUpAt(LocalDateTime.now());
        } else if ("DELIVERED".equals(newStatus)) {
            shipment.setDeliveredAt(LocalDateTime.now());
        }
        
        Shipment saved = shipmentRepository.save(shipment);
        
        // Ghi lịch sử
        recordShipmentHistory(saved, oldStatus, newStatus, userId, reason);
        
        return toShipmentResponse(saved);
    }

    /**
     * Lấy tất cả shipments của một tài xế
     */
    @Transactional(readOnly = true)
    public List<ShipmentResponse> getMyShipments(Long driverId) {
        return shipmentRepository.findByDriverId(driverId).stream()
                .map(this::toShipmentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết một shipment
     */
    @Transactional(readOnly = true)
    public ShipmentResponse getShipmentById(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment không tồn tại"));
        return toShipmentResponse(shipment);
    }

    /**
     * Lấy lịch sử thay đổi trạng thái của một shipment
     */
    @Transactional(readOnly = true)
    public List<ShipmentHistoryResponse> getShipmentHistory(Long shipmentId) {
        return shipmentHistoryRepository.findByShipmentIdOrderByChangedAtDesc(shipmentId).stream()
                .map(this::toHistoryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Ghi lịch sử thay đổi shipment
     */
    private void recordShipmentHistory(Shipment shipment, String previousStatus, String newStatus, Long userId, String reason) {
        ShipmentHistory history = new ShipmentHistory();
        history.setShipment(shipment);
        history.setPreviousStatus(previousStatus);
        history.setNewStatus(newStatus);
        history.setReason(reason);
        history.setChangedBy(userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại")));
        
        shipmentHistoryRepository.save(history);
    }

    /**
     * Kiểm tra trạng thái hợp lệ
     */
    private boolean isValidStatus(String status) {
        return status != null && (status.equals("ASSIGNED") || status.equals("PICKED_UP") || 
                status.equals("IN_TRANSIT") || status.equals("DELIVERED") || status.equals("CANCELLED"));
    }

    /**
     * Convert entity sang DTO
     */
    private ShipmentResponse toShipmentResponse(Shipment shipment) {
        return ShipmentResponse.builder()
                .shipmentId(shipment.getShipmentId())
                .orderId(shipment.getOrder().getOrderId())
                .driver(shipment.getDriver() != null ? toDriverDto(shipment.getDriver()) : null)
                .vehicle(shipment.getVehicle() != null ? toVehicleDto(shipment.getVehicle()) : null)
                .status(shipment.getStatus())
                .assignedAt(shipment.getAssignedAt())
                .pickedUpAt(shipment.getPickedUpAt())
                .deliveredAt(shipment.getDeliveredAt())
                .createdAt(shipment.getCreatedAt())
                .updatedAt(shipment.getUpdatedAt())
                .build();
    }

    private ShipmentHistoryResponse toHistoryResponse(ShipmentHistory history) {
        return ShipmentHistoryResponse.builder()
                .historyId(history.getHistoryId())
                .shipmentId(history.getShipment().getShipmentId())
                .previousStatus(history.getPreviousStatus())
                .newStatus(history.getNewStatus())
                .changedByName(history.getChangedBy().getFullName())
                .changedAt(history.getChangedAt())
                .reason(history.getReason())
                .latitude(history.getLatitude())
                .longitude(history.getLongitude())
                .build();
    }

    private com.bicap.modules.logistics.dto.DriverResponse toDriverDto(Driver driver) {
        return com.bicap.modules.logistics.dto.DriverResponse.builder()
                .driverId(driver.getDriverId())
                .driverCode(driver.getDriverCode())
                .licenseNo(driver.getLicenseNo())
                .userId(driver.getUser().getUserId())
                .userFullName(driver.getUser().getFullName())
                .managerUserId(driver.getManagerUser().getUserId())
                .managerFullName(driver.getManagerUser().getFullName())
                .status(driver.getStatus())
                .build();
    }

    private com.bicap.modules.logistics.dto.VehicleResponse toVehicleDto(Vehicle vehicle) {
        return com.bicap.modules.logistics.dto.VehicleResponse.builder()
                .vehicleId(vehicle.getVehicleId())
                .plateNo(vehicle.getPlateNo())
                .vehicleType(vehicle.getVehicleType())
                .capacity(vehicle.getCapacity())
                .status(vehicle.getStatus())
                .managerUserId(vehicle.getManagerUser() != null ? vehicle.getManagerUser().getUserId() : null)
                .managerFullName(vehicle.getManagerUser() != null ? vehicle.getManagerUser().getFullName() : null)
                .build();
    }
}
