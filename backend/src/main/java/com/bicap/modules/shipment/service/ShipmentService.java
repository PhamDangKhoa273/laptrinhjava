package com.bicap.modules.shipment.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.enums.OrderStatus;
import com.bicap.core.enums.ShipmentStatus;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.logistics.entity.Driver;
import com.bicap.modules.logistics.entity.Vehicle;
import com.bicap.core.enums.OrderPaymentStatus;
import com.bicap.modules.logistics.repository.DriverRepository;
import com.bicap.modules.logistics.repository.VehicleRepository;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.shipment.dto.CreateShipmentRequest;
import com.bicap.modules.shipment.dto.ShipmentResponse;
import com.bicap.modules.shipment.dto.UpdateShipmentStatusRequest;
import com.bicap.modules.shipment.entity.Shipment;
import com.bicap.modules.shipment.repository.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final AuditLogService auditLogService;

    public ShipmentService(ShipmentRepository shipmentRepository,
                           OrderRepository orderRepository,
                           DriverRepository driverRepository,
                           VehicleRepository vehicleRepository,
                           AuditLogService auditLogService) {
        this.shipmentRepository = shipmentRepository;
        this.orderRepository = orderRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ShipmentResponse create(CreateShipmentRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy order để tạo shipment"));
        if (order.getStatusEnum() != OrderStatus.CONFIRMED && order.getStatusEnum() != OrderStatus.SHIPPING) {
            throw new BusinessException("Chỉ order đã CONFIRMED hoặc SHIPPING mới được tạo shipment");
        }
        if (order.getPaymentStatusEnum() != OrderPaymentStatus.DEPOSIT_PAID) {
            throw new BusinessException("Order phải đặt cọc trước khi tạo shipment");
        }
        if (shipmentRepository.findByOrderId(request.getOrderId()).isPresent()) {
            throw new BusinessException("Order này đã có shipment");
        }

        Shipment shipment = new Shipment();
        shipment.setOrderId(order.getOrderId());
        shipment.setShippingManagerUserId(currentUserId);
        shipment.setStatus(ShipmentStatus.CREATED);

        if (request.getDriverId() != null) {
            Driver driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new BusinessException("Driver không tồn tại"));
            if (!"ACTIVE".equalsIgnoreCase(driver.getStatus())) {
                throw new BusinessException("Driver hiện không khả dụng");
            }
            shipment.setDriverId(driver.getDriverId());
            shipment.setStatus(ShipmentStatus.ASSIGNED);
        }
        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new BusinessException("Vehicle không tồn tại"));
            if (!"ACTIVE".equalsIgnoreCase(vehicle.getStatus())) {
                throw new BusinessException("Vehicle hiện không khả dụng");
            }
            shipment.setVehicleId(vehicle.getVehicleId());
        }

        Shipment saved = shipmentRepository.save(shipment);
        if (order.getStatusEnum() == OrderStatus.CONFIRMED) {
            order.setStatus(OrderStatus.SHIPPING);
            orderRepository.save(order);
        }
        auditLogService.log(currentUserId, "CREATE_SHIPMENT", "SHIPMENT", saved.getShipmentId(), "orderId=" + saved.getOrderId());
        return toResponse(saved);
    }

    public List<ShipmentResponse> getAll() {
        return shipmentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public ShipmentResponse updateStatus(Long shipmentId, UpdateShipmentStatusRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new BusinessException("Shipment không tồn tại"));
        ShipmentStatus newStatus;
        try {
            newStatus = ShipmentStatus.valueOf(request.getStatus().trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("Trạng thái shipment không hợp lệ");
        }

        validateTransition(shipment, newStatus);
        shipment.setStatus(newStatus);
        if (newStatus == ShipmentStatus.IN_TRANSIT) {
            shipment.setPickupConfirmedAt(LocalDateTime.now());
        }
        if (newStatus == ShipmentStatus.DELIVERED) {
            shipment.setDeliveryConfirmedAt(LocalDateTime.now());
        }
        if (newStatus == ShipmentStatus.CANCELLED) {
            shipment.setCancelReason(request.getNote() != null ? request.getNote().trim() : "Shipment cancelled");
        }

        Shipment saved = shipmentRepository.save(shipment);
        syncOrderStatus(saved);
        auditLogService.log(currentUserId, "UPDATE_SHIPMENT_STATUS", "SHIPMENT", saved.getShipmentId(), "status=" + saved.getStatus().name());
        return toResponse(saved);
    }

    private void validateTransition(Shipment shipment, ShipmentStatus newStatus) {
        ShipmentStatus currentStatus = shipment.getStatus();
        if (currentStatus == newStatus) {
            throw new BusinessException("Shipment đã ở trạng thái " + newStatus.name());
        }
        boolean allowed = switch (currentStatus) {
            case CREATED -> newStatus == ShipmentStatus.ASSIGNED || newStatus == ShipmentStatus.CANCELLED;
            case ASSIGNED -> newStatus == ShipmentStatus.IN_TRANSIT || newStatus == ShipmentStatus.CANCELLED;
            case IN_TRANSIT -> newStatus == ShipmentStatus.DELIVERED || newStatus == ShipmentStatus.CANCELLED;
            case DELIVERED, CANCELLED -> false;
        };
        if (!allowed) {
            throw new BusinessException("Không thể chuyển shipment từ " + currentStatus.name() + " sang " + newStatus.name());
        }
        if (newStatus == ShipmentStatus.IN_TRANSIT && (shipment.getDriverId() == null || shipment.getVehicleId() == null)) {
            throw new BusinessException("Shipment phải được gán driver và vehicle trước khi bắt đầu vận chuyển");
        }
    }

    private void syncOrderStatus(Shipment shipment) {
        Order order = orderRepository.findById(shipment.getOrderId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy order của shipment"));
        if (shipment.getStatus() == ShipmentStatus.IN_TRANSIT && order.getStatusEnum() == OrderStatus.CONFIRMED) {
            order.setStatus(OrderStatus.SHIPPING);
            orderRepository.save(order);
            return;
        }
        if (shipment.getStatus() == ShipmentStatus.DELIVERED) {
            order.setStatus(OrderStatus.DELIVERED);
            orderRepository.save(order);
            return;
        }
        if (shipment.getStatus() == ShipmentStatus.CANCELLED && order.getStatusEnum() == OrderStatus.SHIPPING) {
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
        }
    }

    private ShipmentResponse toResponse(Shipment shipment) {
        ShipmentResponse response = new ShipmentResponse();
        response.setShipmentId(shipment.getShipmentId());
        response.setOrderId(shipment.getOrderId());
        response.setShippingManagerUserId(shipment.getShippingManagerUserId());
        response.setDriverId(shipment.getDriverId());
        response.setVehicleId(shipment.getVehicleId());
        response.setStatus(shipment.getStatus().name());
        response.setPickupConfirmedAt(shipment.getPickupConfirmedAt());
        response.setDeliveryConfirmedAt(shipment.getDeliveryConfirmedAt());
        response.setCancelReason(shipment.getCancelReason());
        response.setCreatedAt(shipment.getCreatedAt());
        response.setUpdatedAt(shipment.getUpdatedAt());
        return response;
    }
}
