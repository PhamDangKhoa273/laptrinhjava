package com.bicap.backend.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.enums.OrderPaymentStatus;
import com.bicap.core.enums.OrderStatus;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.logistics.entity.Driver;
import com.bicap.modules.logistics.entity.Vehicle;
import com.bicap.modules.logistics.repository.DriverRepository;
import com.bicap.modules.logistics.repository.VehicleRepository;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.shipment.dto.CreateShipmentRequest;
import com.bicap.modules.shipment.dto.ShipmentResponse;
import com.bicap.modules.shipment.dto.UpdateShipmentStatusRequest;
import com.bicap.modules.shipment.entity.Shipment;
import com.bicap.modules.shipment.repository.ShipmentRepository;
import com.bicap.modules.shipment.service.ShipmentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceTests {

    @Mock private ShipmentRepository shipmentRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private DriverRepository driverRepository;
    @Mock private VehicleRepository vehicleRepository;
    @Mock private AuditLogService auditLogService;

    @InjectMocks
    private ShipmentService shipmentService;

    @Test
    void create_shouldRequireDepositPaid() {
        Order order = new Order();
        order.setOrderId(1L);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setPaymentStatus(OrderPaymentStatus.UNPAID);

        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setOrderId(1L);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(9L);
            assertThrows(BusinessException.class, () -> shipmentService.create(request));
        }
    }

    @Test
    void create_shouldMoveOrderToShippingWhenValid() {
        Order order = new Order();
        order.setOrderId(1L);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setPaymentStatus(OrderPaymentStatus.DEPOSIT_PAID);

        Driver driver = new Driver();
        driver.setDriverId(11L);
        driver.setStatus("ACTIVE");

        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleId(12L);
        vehicle.setStatus("ACTIVE");

        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setOrderId(1L);
        request.setDriverId(11L);
        request.setVehicleId(12L);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(shipmentRepository.findByOrderId(1L)).thenReturn(Optional.empty());
        when(driverRepository.findById(11L)).thenReturn(Optional.of(driver));
        when(vehicleRepository.findById(12L)).thenReturn(Optional.of(vehicle));
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(invocation -> {
            Shipment shipment = invocation.getArgument(0);
            shipment.setShipmentId(100L);
            return shipment;
        });
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(9L);
            ShipmentResponse response = shipmentService.create(request);
            assertEquals("ASSIGNED", response.getStatus());
            assertEquals(OrderStatus.SHIPPING, order.getStatusEnum());
        }
    }

    @Test
    void updateStatus_shouldRejectInvalidTransition() {
        Shipment shipment = new Shipment();
        shipment.setShipmentId(1L);
        shipment.setOrderId(1L);
        shipment.setStatus(com.bicap.core.enums.ShipmentStatus.CREATED);

        UpdateShipmentStatusRequest request = new UpdateShipmentStatusRequest();
        request.setStatus("DELIVERED");

        when(shipmentRepository.findById(1L)).thenReturn(Optional.of(shipment));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(9L);
            assertThrows(BusinessException.class, () -> shipmentService.updateStatus(1L, request));
        }
    }
}
