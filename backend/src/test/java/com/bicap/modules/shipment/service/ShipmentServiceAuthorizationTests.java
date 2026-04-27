package com.bicap.modules.shipment.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.MetricsSecurityEvents;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;


import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

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
    @Mock MetricsSecurityEvents metrics;

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

    @Test
    void getEligibleOrdersForShipment_shouldRejectNonShippingRoleAtServiceBoundary() {
        var principal = new com.bicap.core.security.CustomUserPrincipal(
                9L,
                "retailer@example.com",
                "N/A",
                "Retailer",
                List.of(new SimpleGrantedAuthority("ROLE_RETAILER")));
        var authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        assertThatThrownBy(() -> service.getEligibleOrdersForShipment())
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("không có quyền");
    }

    @Test
    void getById_shouldRejectUnrelatedAuthenticatedUserEvenWhenShipmentIdIsKnown() {
        Shipment shipment = new Shipment();
        shipment.setShipmentId(1L);
        shipment.setOrderId(2L);
        shipment.setShippingManagerUserId(77L);
        shipment.setDriverId(10L);
        Order order = new Order();
        order.setOrderId(2L);
        order.setFarmId(100L);
        order.setRetailerId(200L);

        when(shipmentRepository.findById(1L)).thenReturn(java.util.Optional.of(shipment));
        when(orderRepository.findById(2L)).thenReturn(java.util.Optional.of(order));
        when(farmRepository.findByOwnerUserUserId(9L)).thenReturn(java.util.Optional.empty());
        when(retailerRepository.findByUserUserId(9L)).thenReturn(java.util.Optional.empty());

        try (var security = org.mockito.Mockito.mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            var principal = new com.bicap.core.security.CustomUserPrincipal(
                    9L,
                    "outsider@example.com",
                    "N/A",
                    "Outsider",
                    List.of(new SimpleGrantedAuthority("ROLE_RETAILER")));
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(9L);
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserOrNull).thenReturn(principal);

            assertThatThrownBy(() -> service.getById(1L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("không có quyền");
        }
    }
}

