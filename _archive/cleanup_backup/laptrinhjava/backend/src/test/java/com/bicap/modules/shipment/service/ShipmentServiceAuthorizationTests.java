package com.bicap.modules.shipment.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.batch.repository.QrCodeRepository;
import com.bicap.modules.common.notification.service.NotificationDispatcher;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.logistics.repository.DriverRepository;
import com.bicap.modules.logistics.repository.VehicleRepository;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.retailer.repository.RetailerRepository;
import com.bicap.modules.shipment.entity.Shipment;
import com.bicap.modules.shipment.repository.ShipmentLogRepository;
import com.bicap.modules.shipment.repository.ShipmentRepository;
import com.bicap.modules.shipment.repository.ShipmentReportRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;


import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceAuthorizationTests {

    @Mock ShipmentRepository shipmentRepository;
    @Mock OrderRepository orderRepository;
    @Mock DriverRepository driverRepository;
    @Mock VehicleRepository vehicleRepository;
    @Mock FarmRepository farmRepository;
    @Mock RetailerRepository retailerRepository;
    @Mock QrCodeRepository qrCodeRepository;
    @Mock AuditLogService auditLogService;
    @Mock ShipmentLogRepository logRepository;
    @Mock ShipmentReportRepository reportRepository;
    @Mock NotificationDispatcher notificationDispatcher;

    @InjectMocks ShipmentService service;

    @Test
    void confirmPickup_shouldRejectUnassignedDriver() {
        Shipment shipment = new Shipment();
        shipment.setShipmentId(1L);
        shipment.setOrderId(2L);
        shipment.setDriverId(10L);
        Order order = new Order();
        order.setOrderId(2L);

        try (var security = org.mockito.Mockito.mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(1L);
            assertThatThrownBy(() -> service.confirmPickup(1L, new com.bicap.modules.shipment.dto.ConfirmPickupRequest())).isInstanceOf(BusinessException.class);
        }
    }
}
