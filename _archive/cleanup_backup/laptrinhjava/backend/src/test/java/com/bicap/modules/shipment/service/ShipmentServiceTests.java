package com.bicap.modules.shipment.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.security.MetricsSecurityEvents;
import com.bicap.core.enums.OrderPaymentStatus;
import com.bicap.core.enums.OrderStatus;
import com.bicap.core.enums.ShipmentStatus;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.logistics.entity.Driver;
import com.bicap.modules.logistics.entity.Vehicle;
import com.bicap.modules.logistics.repository.DriverRepository;
import com.bicap.modules.logistics.repository.VehicleRepository;
import com.bicap.modules.common.notification.service.NotificationDispatcher;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.retailer.entity.Retailer;
import com.bicap.modules.retailer.repository.RetailerRepository;
import com.bicap.modules.shipment.dto.CreateShipmentReportRequest;
import com.bicap.modules.shipment.dto.CreateShipmentRequest;
import com.bicap.modules.shipment.dto.UpdateShipmentStatusRequest;
import com.bicap.modules.shipment.entity.Shipment;
import com.bicap.modules.shipment.repository.ShipmentLogRepository;
import com.bicap.modules.shipment.repository.ShipmentRepository;
import com.bicap.modules.shipment.repository.ShipmentReportRepository;
import com.bicap.modules.batch.repository.QrCodeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceTests {

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

    @InjectMocks ShipmentService shipmentService;

    private Shipment shipment;
    private Order order;
    private Driver driver;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        shipment = new Shipment();
        shipment.setShipmentId(10L);
        shipment.setOrderId(100L);
        shipment.setDriverId(20L);
        shipment.setStatus(ShipmentStatus.CREATED);

        order = new Order();
        order.setOrderId(100L);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setPaymentStatus(OrderPaymentStatus.DEPOSIT_PAID);
        order.setFarmId(30L);
        order.setRetailerId(40L);

        driver = new Driver();
        driver.setDriverId(20L);
        driver.setStatus("ACTIVE");
        driver.setDriverCode("DRV-1");

        vehicle = new Vehicle();
        vehicle.setVehicleId(50L);
        vehicle.setStatus("ACTIVE");
    }

    @Test
    void create_shipment_saves_and_assigns() {
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setOrderId(100L);
        request.setDriverId(20L);
        request.setVehicleId(50L);
        request.setNote("  note  ");

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(shipmentRepository.findByOrderId(100L)).thenReturn(Optional.empty());
        when(driverRepository.findById(20L)).thenReturn(Optional.of(driver));
        when(vehicleRepository.findById(50L)).thenReturn(Optional.of(vehicle));
        when(shipmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(1L);
            security.when(SecurityUtils::getCurrentUser).thenThrow(new UnsupportedOperationException());

            shipmentService.create(request);
        }

        verify(shipmentRepository).save(any(Shipment.class));
    }

    @Test
    void create_shipment_shouldRejectSecondAttemptForSameOrder() {
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setOrderId(100L);
        request.setDriverId(20L);
        request.setVehicleId(50L);
        request.setNote("note");

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(shipmentRepository.findByOrderId(100L)).thenReturn(Optional.of(shipment));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(1L);
            assertThatThrownBy(() -> shipmentService.create(request)).isInstanceOf(BusinessException.class);
        }

        verify(shipmentRepository, times(0)).save(any(Shipment.class));
    }

    @Test
    void update_status_delivered_logs_transition() {
        UpdateShipmentStatusRequest request = new UpdateShipmentStatusRequest();
        shipment.setStatus(ShipmentStatus.IN_TRANSIT);
        request.setStatus(ShipmentStatus.DELIVERED.name());
        request.setNote("done");

        when(shipmentRepository.findById(10L)).thenReturn(Optional.of(shipment));
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(shipmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(1L);
            shipmentService.updateStatus(10L, request);
        }

        assertThat(shipment.getStatus()).isEqualTo(ShipmentStatus.DELIVERED);
        verify(logRepository).save(any());
    }

    @Test
    void report_issue_persists_report_and_notifies() {
        CreateShipmentReportRequest request = new CreateShipmentReportRequest();
        request.setIssueType("DAMAGED");
        request.setDescription("Seal damaged");
        request.setSeverity("HIGH");

        when(driverRepository.findByUserUserId(1L)).thenReturn(Optional.of(driver));
        when(shipmentRepository.findById(10L)).thenReturn(Optional.of(shipment));
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(farmRepository.findById(30L)).thenReturn(Optional.of(new Farm()));
        when(retailerRepository.findById(40L)).thenReturn(Optional.of(new Retailer()));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(1L);
            shipmentService.reportIssue(10L, request);
        }

        verify(reportRepository).save(any());
        verify(notificationDispatcher).send(any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void report_issue_marks_dispute_for_shortage() {
        CreateShipmentReportRequest request = new CreateShipmentReportRequest();
        request.setIssueType("SHORTAGE");
        request.setDescription("Thiếu 2 thùng");
        request.setSeverity("HIGH");

        when(driverRepository.findByUserUserId(1L)).thenReturn(Optional.of(driver));
        when(shipmentRepository.findById(10L)).thenReturn(Optional.of(shipment));
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(farmRepository.findById(30L)).thenReturn(Optional.of(new Farm()));
        when(retailerRepository.findById(40L)).thenReturn(Optional.of(new Retailer()));
        when(shipmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(1L);
            shipmentService.reportIssue(10L, request);
        }

        assertThat(shipment.getStatus()).isEqualTo(ShipmentStatus.DISPUTED);
        assertThat(order.getStatusEnum()).isEqualTo(OrderStatus.DISPUTED);
    }

    @Test
    void retailer_reject_delivery_marks_order_disputed() {
        when(shipmentRepository.findById(10L)).thenReturn(Optional.of(shipment));
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(shipmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        shipmentService.retailerRejectDelivery(10L, "Sai batch");

        assertThat(shipment.getStatus()).isEqualTo(ShipmentStatus.REJECTED);
        assertThat(order.getStatusEnum()).isEqualTo(OrderStatus.DISPUTED);
    }

    @Test
    void create_shipment_with_wrong_batch_enters_dispute_state() {
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setOrderId(100L);
        request.setExpectedBatchCode("BATCH-X");

        var listing = new com.bicap.modules.listing.entity.ProductListing();
        var batch = new com.bicap.modules.batch.entity.ProductBatch();
        batch.setBatchCode("BATCH-Y");
        listing.setBatch(batch);
        var item = new com.bicap.modules.order.entity.OrderItem();
        item.setListing(listing);
        order.getOrderItems().add(item);

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(shipmentRepository.findByOrderId(100L)).thenReturn(Optional.empty());
        when(shipmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(1L);
            shipmentService.create(request);
        }

        assertThat(order.getStatusEnum()).isEqualTo(OrderStatus.DISPUTED);
    }
}
