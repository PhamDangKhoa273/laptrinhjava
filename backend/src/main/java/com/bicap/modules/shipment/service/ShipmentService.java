package com.bicap.modules.shipment.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.enums.OrderPaymentStatus;
import com.bicap.core.enums.OrderStatus;
import com.bicap.core.enums.ShipmentStatus;
import com.bicap.core.security.MetricsSecurityEvents;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.batch.entity.QrCode;
import com.bicap.modules.batch.repository.QrCodeRepository;
import com.bicap.modules.common.notification.service.NotificationDispatcher;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.logistics.entity.Driver;
import com.bicap.modules.logistics.entity.Vehicle;
import com.bicap.modules.logistics.repository.DriverRepository;
import com.bicap.modules.logistics.repository.VehicleRepository;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.retailer.entity.Retailer;
import com.bicap.modules.retailer.repository.RetailerRepository;
import com.bicap.modules.shipment.dto.*;
import com.bicap.modules.shipment.entity.Shipment;
import com.bicap.modules.shipment.entity.ShipmentLog;
import com.bicap.modules.shipment.entity.ShipmentReport;
import com.bicap.modules.shipment.repository.ShipmentLogRepository;
import com.bicap.modules.shipment.repository.ShipmentRepository;
import com.bicap.modules.shipment.repository.ShipmentReportRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
public class ShipmentService {
    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final FarmRepository farmRepository;
    private final RetailerRepository retailerRepository;
    private final QrCodeRepository qrCodeRepository;
    private final AuditLogService auditLogService;
    private final ShipmentLogRepository logRepository;
    private final ShipmentReportRepository reportRepository;
    private final NotificationDispatcher notificationDispatcher;
    private final MetricsSecurityEvents metrics;

    public ShipmentService(ShipmentRepository shipmentRepository, OrderRepository orderRepository, DriverRepository driverRepository, VehicleRepository vehicleRepository, FarmRepository farmRepository, RetailerRepository retailerRepository, QrCodeRepository qrCodeRepository, AuditLogService auditLogService, ShipmentLogRepository logRepository, ShipmentReportRepository reportRepository, NotificationDispatcher notificationDispatcher, MetricsSecurityEvents metrics) {
        this.shipmentRepository = shipmentRepository;
        this.orderRepository = orderRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
        this.farmRepository = farmRepository;
        this.retailerRepository = retailerRepository;
        this.qrCodeRepository = qrCodeRepository;
        this.auditLogService = auditLogService;
        this.logRepository = logRepository;
        this.reportRepository = reportRepository;
        this.notificationDispatcher = notificationDispatcher;
        this.metrics = metrics;
    }

    @Transactional
    public ShipmentResponse create(CreateShipmentRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Order order = orderRepository.findById(request.getOrderId()).orElseThrow(() -> new BusinessException("Không tìm thấy order để tạo shipment"));
        if (order.getStatusEnum() != OrderStatus.READY_FOR_SHIPMENT) throw new BusinessException("Chỉ order READY_FOR_SHIPMENT mới được tạo shipment");
        if (order.getPaymentStatusEnum() != OrderPaymentStatus.DEPOSIT_PAID) throw new BusinessException("Order phải đặt cọc trước khi tạo shipment");
        if (shipmentRepository.findByOrderId(request.getOrderId()).isPresent()) throw new BusinessException("Order này đã có shipment");

        Shipment shipment = new Shipment();
        shipment.setOrderId(order.getOrderId());
        shipment.setShippingManagerUserId(currentUserId);
        shipment.setStatus(ShipmentStatus.CREATED);
        shipment.setNote(request.getNote() != null ? request.getNote().trim() : null);
        shipment.setIdempotencyKey(request.getIdempotencyKey() != null ? request.getIdempotencyKey().trim() : null);

        if (request.getExpectedBatchCode() != null && !request.getExpectedBatchCode().trim().isBlank()) {
            String expectedBatchCode = request.getExpectedBatchCode().trim();
            boolean match = order.getOrderItems().stream().anyMatch(item -> item.getListing() != null && item.getListing().getBatch() != null && expectedBatchCode.equalsIgnoreCase(item.getListing().getBatch().getBatchCode()));
            if (!match) {
                shipment.setStatus(ShipmentStatus.DISPUTED);
                shipment.setCancelReason("Expected batch mismatch: " + expectedBatchCode);
                order.setStatus(OrderStatus.DISPUTED);
                order.setDisputeRaisedAt(LocalDateTime.now());
                order.setDisputeNote("Expected batch mismatch: " + expectedBatchCode);
                orderRepository.save(order);
            }
        }

        if (request.getDriverId() != null) {
            Driver driver = driverRepository.findById(request.getDriverId()).orElseThrow(() -> new BusinessException("Driver không tồn tại"));
            if (!"ACTIVE".equalsIgnoreCase(driver.getStatus())) throw new BusinessException("Driver hiện không khả dụng");
            shipment.setDriverId(driver.getDriverId());
            if (shipment.getStatus() != ShipmentStatus.DISPUTED) shipment.setStatus(ShipmentStatus.ASSIGNED);
            notifyDriverAssignment(shipment, driver);
        }

        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId()).orElseThrow(() -> new BusinessException("Vehicle không tồn tại"));
            if (!"ACTIVE".equalsIgnoreCase(vehicle.getStatus())) throw new BusinessException("Vehicle hiện không khả dụng");
            shipment.setVehicleId(vehicle.getVehicleId());
        }

        Shipment saved = shipmentRepository.save(shipment);
        try { if (metrics != null) metrics.shipmentThroughput.increment(); } catch (Exception ex) { log.debug("Không thể tăng metric shipmentThroughput", ex); }
        auditLogService.log(currentUserId, "CREATE_SHIPMENT", "SHIPMENT", saved.getShipmentId(), "orderId=" + saved.getOrderId() + ", status=" + saved.getStatus().name());
        notifyFarmShipmentEvent(saved, "Shipment vừa được tạo", "Shipment #" + saved.getShipmentId() + " đã được tạo cho order #" + saved.getOrderId(), "SHIPMENT_CREATED");
        return toResponse(saved);
    }

    public List<ShipmentResponse> getAll() { Long currentUserId = SecurityUtils.getCurrentUserId(); if (hasAnyRole("ADMIN")) return shipmentRepository.findAll().stream().map(this::toResponse).toList(); return shipmentRepository.findByShippingManagerUserIdOrderByCreatedAtDesc(currentUserId).stream().map(this::toResponse).toList(); }
    public List<ShipmentResponse> getMyShipments() { Long currentUserId = SecurityUtils.getCurrentUserId(); Driver driver = driverRepository.findByUserUserId(currentUserId).orElseThrow(() -> new BusinessException("User không gắn với Driver resource nào.")); return shipmentRepository.findByDriverId(driver.getDriverId()).stream().map(this::toResponse).toList(); }
    public List<ShipmentResponse> getFarmShipments() { Long currentUserId = SecurityUtils.getCurrentUserId(); Farm farm = farmRepository.findByOwnerUserUserId(currentUserId).orElseThrow(() -> new BusinessException("User không gắn với Farm resource nào.")); return shipmentRepository.findAllByFarmId(farm.getFarmId()).stream().map(this::toResponse).toList(); }
    public List<ShipmentResponse> getRetailerShipments() { Long currentUserId = SecurityUtils.getCurrentUserId(); Retailer retailer = retailerRepository.findByUserUserId(currentUserId).orElseThrow(() -> new BusinessException("User không gắn với Retailer resource nào.")); return shipmentRepository.findAllByRetailerId(retailer.getRetailerId()).stream().map(this::toResponse).toList(); }
    public ShipmentResponse getById(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId).orElseThrow(() -> new BusinessException("Không tìm thấy shipment"));
        assertCanViewShipment(shipment, SecurityUtils.getCurrentUserId());
        return toResponse(shipment);
    }
    public List<ShipmentResponse> getEligibleOrdersForShipment() {
        if (!hasAnyRole("ADMIN", "SHIPPING_MANAGER")) {
            throw new BusinessException("Bạn không có quyền xem danh sách order đủ điều kiện tạo shipment");
        }
        return orderRepository.findAll().stream()
                .filter(order -> order.getStatusEnum() == OrderStatus.READY_FOR_SHIPMENT)
                .filter(order -> order.getPaymentStatusEnum() == OrderPaymentStatus.DEPOSIT_PAID)
                .filter(order -> shipmentRepository.findByOrderId(order.getOrderId()).isEmpty())
                .map(this::toEligibleOrderShipmentResponse)
                .toList();
    }

    public List<ShipmentReportResponse> getReportsForReview() {
        if (!hasAnyRole("ADMIN", "SHIPPING_MANAGER")) {
            throw new BusinessException("Bạn không có quyền xem báo cáo sự cố shipment");
        }
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toReportResponse)
                .toList();
    }

    @Transactional
    public ShipmentResponse updateStatus(Long shipmentId, UpdateShipmentStatusRequest request) {
        Shipment shipment = shipmentRepository.findById(shipmentId).orElseThrow(() -> new BusinessException("Shipment không tồn tại"));
        assertCanManageShipment(shipment, SecurityUtils.getCurrentUserId());
        ShipmentStatus newStatus = ShipmentStatus.valueOf(request.getStatus().trim().toUpperCase());
        validateTransition(shipment, newStatus);
        shipment.setStatus(newStatus);
        if (newStatus == ShipmentStatus.PICKED_UP) shipment.setPickupConfirmedAt(LocalDateTime.now());
        if (newStatus == ShipmentStatus.DELIVERED) shipment.setDeliveryConfirmedAt(LocalDateTime.now());
        if (newStatus == ShipmentStatus.REJECTED || newStatus == ShipmentStatus.DISPUTED || newStatus == ShipmentStatus.ESCALATED) shipment.setCancelReason(request.getNote() != null ? request.getNote().trim() : "Shipment issue");
        if (newStatus == ShipmentStatus.CANCELLED) shipment.setCancelReason(request.getNote() != null ? request.getNote().trim() : "Shipment cancelled");
        Shipment saved = shipmentRepository.save(shipment);
        syncOrderStatus(saved);
        logRepository.save(makeLog(saved.getShipmentId(), newStatus.name(), request));
        return toResponse(saved);
    }

    @Transactional
    public ShipmentResponse confirmPickup(Long shipmentId, ConfirmPickupRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Driver driver = driverRepository.findByUserUserId(currentUserId).orElseThrow(() -> new BusinessException("User không gắn với Driver resource nào."));
        Shipment shipment = shipmentRepository.findById(shipmentId).orElseThrow(() -> new BusinessException("Shipment không tồn tại"));
        if (!driver.getDriverId().equals(shipment.getDriverId())) throw new BusinessException("Shipment này không được gán cho bạn.");
        Order order = orderRepository.findById(shipment.getOrderId()).orElseThrow(() -> new BusinessException("Không tìm thấy order của shipment"));
        String input = request.getQrCode() != null ? request.getQrCode().trim() : "";
        boolean validBatch = order.getOrderItems().stream().anyMatch(item -> {
            var batch = item.getListing().getBatch();
            QrCode qrCode = qrCodeRepository.findByBatch_BatchId(batch.getBatchId()).orElse(null);
            String traceCode = qrCode != null ? qrCode.getQrValue() : null;
            return (batch.getBatchCode() != null && batch.getBatchCode().equalsIgnoreCase(input)) || (traceCode != null && traceCode.equalsIgnoreCase(input));
        });
        if (!validBatch) {
            shipment.setStatus(ShipmentStatus.DISPUTED);
            shipment.setCancelReason("QR mismatch");
            shipmentRepository.save(shipment);
            order.setStatus(OrderStatus.DISPUTED);
            order.setDisputeRaisedAt(LocalDateTime.now());
            order.setDisputeNote("QR mismatch");
            orderRepository.save(order);
            notifyFarmShipmentEvent(shipment, "QR mismatch", "Shipment #" + shipment.getShipmentId() + " bị mismatch QR", "SHIPMENT_ISSUE");
            return toResponse(shipment);
        }
        shipment.setStatus(ShipmentStatus.PICKED_UP);
        shipment.setPickupConfirmedAt(LocalDateTime.now());
        Shipment saved = shipmentRepository.save(shipment);
        syncOrderStatus(saved);
        notifyFarmShipmentEvent(saved, "Driver đã pickup", "Shipment #" + saved.getShipmentId() + " vừa pickup hàng", "SHIPMENT_PICKED_UP");
        return toResponse(saved);
    }

    @Transactional
    public ShipmentResponse addCheckpoint(Long shipmentId, AddShipmentLogRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Driver driver = driverRepository.findByUserUserId(currentUserId).orElseThrow(() -> new BusinessException("User không gắn với Driver resource nào."));
        Shipment shipment = shipmentRepository.findById(shipmentId).orElseThrow(() -> new BusinessException("Shipment không tồn tại"));
        if (!driver.getDriverId().equals(shipment.getDriverId())) throw new BusinessException("Shipment này không được gán cho bạn.");
        ShipmentLog log = new ShipmentLog();
        log.setShipmentId(shipmentId);
        log.setType("CHECKPOINT");
        log.setLocation(request.getLocation());
        log.setNote(request.getNote());
        log.setImageUrl(request.getImageUrl());
        logRepository.save(log);
        return toResponse(shipment);
    }

    @Transactional
    public ShipmentResponse retailerRejectDelivery(Long shipmentId, String reason) {
        Shipment shipment = shipmentRepository.findById(shipmentId).orElseThrow(() -> new BusinessException("Shipment không tồn tại"));
        Order order = orderRepository.findById(shipment.getOrderId()).orElseThrow(() -> new BusinessException("Không tìm thấy order của shipment"));
        assertCurrentRetailerOwnsOrder(order, SecurityUtils.getCurrentUserId());
        String note = reason != null ? reason.trim() : "Retailer rejected delivery";
        shipment.setStatus(ShipmentStatus.REJECTED);
        shipment.setCancelReason(note);
        shipmentRepository.save(shipment);
        order.setStatus(OrderStatus.DISPUTED);
        order.setDisputeRaisedAt(LocalDateTime.now());
        order.setDisputeNote(note);
        orderRepository.save(order);
        notifyFarmShipmentEvent(shipment, "Retailer reject delivery", "Shipment #" + shipment.getShipmentId() + " bị từ chối bởi retailer", "SHIPMENT_REJECTED");
        notifyRetailerShipmentEvent(shipment, "Retailer reject delivery", "Shipment #" + shipment.getShipmentId() + " bị từ chối bởi retailer", "SHIPMENT_REJECTED");
        return toResponse(shipment);
    }

    @Transactional
    public ShipmentResponse escalateIssue(Long shipmentId, String reason) {
        Shipment shipment = shipmentRepository.findById(shipmentId).orElseThrow(() -> new BusinessException("Shipment không tồn tại"));
        assertCanManageShipment(shipment, SecurityUtils.getCurrentUserId());
        String note = reason != null ? reason.trim() : "Shipment issue escalated";
        shipment.setStatus(ShipmentStatus.ESCALATED);
        shipment.setCancelReason(note);
        shipmentRepository.save(shipment);
        Order order = orderRepository.findById(shipment.getOrderId()).orElseThrow(() -> new BusinessException("Không tìm thấy order của shipment"));
        order.setStatus(OrderStatus.DISPUTED);
        order.setDisputeRaisedAt(LocalDateTime.now());
        order.setDisputeNote(note);
        orderRepository.save(order);
        notifyFarmShipmentEvent(shipment, "Shipment issue escalated", "Shipment #" + shipment.getShipmentId() + " đã được escalated", "SHIPMENT_ESCALATED");
        notifyRetailerShipmentEvent(shipment, "Shipment issue escalated", "Shipment #" + shipment.getShipmentId() + " đã được escalated", "SHIPMENT_ESCALATED");
        return toResponse(shipment);
    }

    @Transactional
    public ShipmentResponse confirmHandover(Long shipmentId, UpdateShipmentStatusRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Driver driver = driverRepository.findByUserUserId(currentUserId).orElseThrow(() -> new BusinessException("User không gắn với Driver resource nào."));
        Shipment shipment = shipmentRepository.findById(shipmentId).orElseThrow(() -> new BusinessException("Shipment không tồn tại"));
        if (!driver.getDriverId().equals(shipment.getDriverId())) throw new BusinessException("Shipment này không được gán cho bạn.");
        request.setStatus(ShipmentStatus.DELIVERED.name());
        validateTransition(shipment, ShipmentStatus.DELIVERED);
        shipment.setStatus(ShipmentStatus.DELIVERED);
        shipment.setDeliveryConfirmedAt(LocalDateTime.now());
        Shipment saved = shipmentRepository.save(shipment);
        syncOrderStatus(saved);
        logRepository.save(makeLog(saved.getShipmentId(), ShipmentStatus.DELIVERED.name(), request));
        notifyRetailerShipmentEvent(saved, "Driver đã bàn giao hàng", "Shipment #" + saved.getShipmentId() + " đã được bàn giao", "SHIPMENT_DELIVERED");
        return toResponse(saved);
    }

    @Transactional
    public void reportIssue(Long shipmentId, CreateShipmentReportRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Driver driver = driverRepository.findByUserUserId(currentUserId).orElseThrow(() -> new BusinessException("Chỉ tài xế mới được báo cáo sự cố qua endpoint này."));
        Shipment shipment = shipmentRepository.findById(shipmentId).orElseThrow(() -> new BusinessException("Shipment không tồn tại"));
        if (!driver.getDriverId().equals(shipment.getDriverId())) throw new BusinessException("Shipment này không được gán cho bạn.");
        String issueType = request.getIssueType() != null ? request.getIssueType().trim().toUpperCase() : "";
        if (!Set.of("DELAY", "DAMAGED", "WRONG_BATCH", "SHORTAGE", "ROUTE_ISSUE").contains(issueType)) throw new BusinessException("Issue type không hợp lệ");
        ShipmentReport report = new ShipmentReport();
        report.setShipmentId(shipmentId);
        report.setDriverId(driver.getDriverId());
        report.setIssueType(issueType);
        report.setDescription(request.getDescription());
        report.setSeverity(request.getSeverity());
        reportRepository.save(report);
        shipment.setStatus(("DAMAGED".equals(issueType) || "SHORTAGE".equals(issueType) || "WRONG_BATCH".equals(issueType)) ? ShipmentStatus.DISPUTED : ShipmentStatus.ESCALATED);
        shipment.setCancelReason(request.getDescription());
        shipmentRepository.save(shipment);
        Order order = orderRepository.findById(shipment.getOrderId()).orElseThrow(() -> new BusinessException("Không tìm thấy order của shipment"));
        order.setStatus(OrderStatus.DISPUTED);
        order.setDisputeRaisedAt(LocalDateTime.now());
        order.setDisputeNote(issueType + ": " + request.getDescription());
        orderRepository.save(order);
        notifyShipmentIssue(shipment, driver, request);
        auditLogService.log(currentUserId, "DRIVER_REPORT_ISSUE", "SHIPMENT", shipmentId, "type=" + request.getIssueType() + ", note=" + request.getDescription());
    }

    private void notifyFarmShipmentEvent(Shipment shipment, String title, String message, String type) {
        Order order = orderRepository.findById(shipment.getOrderId()).orElse(null);
        if (order == null) return;
        Farm farm = farmRepository.findById(order.getFarmId()).orElse(null);
        if (farm == null || farm.getOwnerUser() == null) return;
        notificationDispatcher.send(farm.getOwnerUser().getUserId(), null, title, message, type, "SHIPMENT", shipment.getShipmentId());
    }

    private void notifyRetailerShipmentEvent(Shipment shipment, String title, String message, String type) {
        Order order = orderRepository.findById(shipment.getOrderId()).orElse(null);
        if (order == null) return;
        Retailer retailer = retailerRepository.findById(order.getRetailerId()).orElse(null);
        if (retailer == null || retailer.getUser() == null) return;
        notificationDispatcher.send(retailer.getUser().getUserId(), null, title, message, type, "SHIPMENT", shipment.getShipmentId());
    }

    private void notifyDriverAssignment(Shipment shipment, Driver driver) { if (driver == null || driver.getUser() == null) return; notificationDispatcher.send(driver.getUser().getUserId(), null, "Bạn được gán shipment mới", "Shipment #" + shipment.getShipmentId() + " đã được shipping manager phân công cho bạn.", "SHIPMENT_ASSIGNED", "SHIPMENT", shipment.getShipmentId()); }
    private void notifyShipmentIssue(Shipment shipment, Driver driver, CreateShipmentReportRequest request) { Order order = orderRepository.findById(shipment.getOrderId()).orElse(null); if (order == null) return; Farm farm = farmRepository.findById(order.getFarmId()).orElse(null); Retailer retailer = retailerRepository.findById(order.getRetailerId()).orElse(null); notificationDispatcher.send(null, "ADMIN", "Sự cố shipment #" + shipment.getShipmentId(), driver.getDriverCode() + " báo " + request.getIssueType() + ": " + request.getDescription(), "DRIVER_ISSUE", "SHIPMENT", shipment.getShipmentId()); if (farm != null && farm.getOwnerUser() != null) notificationDispatcher.send(farm.getOwnerUser().getUserId(), null, "Thông báo sự cố shipment #" + shipment.getShipmentId(), request.getDescription(), "DRIVER_ISSUE", "SHIPMENT", shipment.getShipmentId()); if (retailer != null && retailer.getUser() != null) notificationDispatcher.send(retailer.getUser().getUserId(), null, "Thông báo giao vận shipment #" + shipment.getShipmentId(), request.getDescription(), "DRIVER_ISSUE", "SHIPMENT", shipment.getShipmentId()); }
    private ShipmentLog makeLog(Long shipmentId, String type, UpdateShipmentStatusRequest request) { ShipmentLog log = new ShipmentLog(); log.setShipmentId(shipmentId); log.setType(type); log.setNote(request.getNote()); log.setQrEvidence(request.getEvidence()); log.setOverrideReason(request.getOverrideReason()); return log; }
    private void validateTransition(Shipment shipment, ShipmentStatus newStatus) { ShipmentStatus currentStatus = shipment.getStatus(); if (currentStatus == newStatus) throw new BusinessException("Shipment đã ở trạng thái " + newStatus.name()); boolean allowed = switch (currentStatus) { case CREATED -> newStatus == ShipmentStatus.ASSIGNED || newStatus == ShipmentStatus.CANCELLED || newStatus == ShipmentStatus.DISPUTED || newStatus == ShipmentStatus.ESCALATED || newStatus == ShipmentStatus.REJECTED; case ASSIGNED -> newStatus == ShipmentStatus.PICKED_UP || newStatus == ShipmentStatus.CANCELLED || newStatus == ShipmentStatus.DISPUTED || newStatus == ShipmentStatus.ESCALATED || newStatus == ShipmentStatus.REJECTED; case PICKED_UP -> newStatus == ShipmentStatus.IN_TRANSIT || newStatus == ShipmentStatus.DELIVERED || newStatus == ShipmentStatus.CANCELLED || newStatus == ShipmentStatus.DISPUTED || newStatus == ShipmentStatus.ESCALATED || newStatus == ShipmentStatus.REJECTED; case IN_TRANSIT -> newStatus == ShipmentStatus.DELIVERED || newStatus == ShipmentStatus.CANCELLED || newStatus == ShipmentStatus.DISPUTED || newStatus == ShipmentStatus.ESCALATED || newStatus == ShipmentStatus.REJECTED; case DELIVERED, CANCELLED, REJECTED, DISPUTED, ESCALATED -> false; default -> false; }; if (!allowed) throw new BusinessException("Không thể chuyển shipment từ " + currentStatus.name() + " sang " + newStatus.name()); }
    private void syncOrderStatus(Shipment shipment) { Order order = orderRepository.findById(shipment.getOrderId()).orElseThrow(() -> new BusinessException("Không tìm thấy order của shipment")); if ((shipment.getStatus() == ShipmentStatus.PICKED_UP || shipment.getStatus() == ShipmentStatus.IN_TRANSIT) && order.getStatusEnum() == OrderStatus.READY_FOR_SHIPMENT) { order.setStatus(OrderStatus.SHIPPING); orderRepository.save(order); } else if (shipment.getStatus() == ShipmentStatus.DELIVERED) { order.setStatus(OrderStatus.DELIVERED); orderRepository.save(order); } else if (shipment.getStatus() == ShipmentStatus.CANCELLED && order.getStatusEnum() == OrderStatus.READY_FOR_SHIPMENT) { order.setStatus(OrderStatus.CONFIRMED); orderRepository.save(order); } else if (shipment.getStatus() == ShipmentStatus.DISPUTED || shipment.getStatus() == ShipmentStatus.REJECTED || shipment.getStatus() == ShipmentStatus.ESCALATED) { order.setStatus(OrderStatus.DISPUTED); order.setDisputeRaisedAt(LocalDateTime.now()); order.setDisputeNote(shipment.getCancelReason()); orderRepository.save(order); } }

    private void assertCanViewShipment(Shipment shipment, Long currentUserId) {
        if (hasAnyRole("ADMIN")) return;
        if (hasAnyRole("SHIPPING_MANAGER") && currentUserId.equals(shipment.getShippingManagerUserId())) return;
        if (hasAnyRole("DRIVER")) {
            Driver driver = driverRepository.findByUserUserId(currentUserId).orElse(null);
            if (driver != null && driver.getDriverId().equals(shipment.getDriverId())) return;
        }
        Order order = orderRepository.findById(shipment.getOrderId()).orElseThrow(() -> new BusinessException("Không tìm thấy order của shipment"));
        Farm farm = farmRepository.findByOwnerUserUserId(currentUserId).orElse(null);
        if (farm != null && farm.getFarmId().equals(order.getFarmId())) return;
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId).orElse(null);
        if (retailer != null && retailer.getRetailerId().equals(order.getRetailerId())) return;
        throw new BusinessException("Bạn không có quyền xem shipment này");
    }

    private void assertCanManageShipment(Shipment shipment, Long currentUserId) {
        if (hasAnyRole("ADMIN")) return;
        if (hasAnyRole("SHIPPING_MANAGER") && currentUserId.equals(shipment.getShippingManagerUserId())) return;
        throw new BusinessException("Bạn không có quyền cập nhật shipment này");
    }

    private void assertCurrentRetailerOwnsOrder(Order order, Long currentUserId) {
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId).orElseThrow(() -> new BusinessException("User không gắn với Retailer resource nào."));
        if (!retailer.getRetailerId().equals(order.getRetailerId())) throw new BusinessException("Bạn không có quyền thao tác shipment của order này");
    }

    private boolean hasAnyRole(String... roles) {
        var principal = SecurityUtils.getCurrentUserOrNull();
        if (principal == null || principal.getAuthorities() == null) return false;
        Set<String> granted = principal.getAuthorities().stream().map(a -> a.getAuthority()).collect(java.util.stream.Collectors.toSet());
        for (String role : roles) if (granted.contains(role) || granted.contains("ROLE_" + role)) return true;
        return false;
    }
    private ShipmentReportResponse toReportResponse(ShipmentReport report) { ShipmentReportResponse response = new ShipmentReportResponse(); response.setReportId(report.getReportId()); response.setShipmentId(report.getShipmentId()); response.setDriverId(report.getDriverId()); response.setIssueType(report.getIssueType()); response.setDescription(report.getDescription()); response.setSeverity(report.getSeverity()); response.setStatus(report.getStatus()); response.setCreatedAt(report.getCreatedAt()); return response; }
    private ShipmentResponse toResponse(Shipment shipment) { ShipmentResponse response = new ShipmentResponse(); Order order = orderRepository.findById(shipment.getOrderId()).orElse(null); Driver driver = shipment.getDriverId() != null ? driverRepository.findById(shipment.getDriverId()).orElse(null) : null; Vehicle vehicle = shipment.getVehicleId() != null ? vehicleRepository.findById(shipment.getVehicleId()).orElse(null) : null; Farm farm = order != null ? farmRepository.findById(order.getFarmId()).orElse(null) : null; Retailer retailer = order != null ? retailerRepository.findById(order.getRetailerId()).orElse(null) : null; response.setShipmentId(shipment.getShipmentId()); response.setOrderId(shipment.getOrderId()); if (order != null) { response.setOrderStatus(order.getStatusEnum().name()); response.setPaymentStatus(order.getPaymentStatusEnum().name()); } response.setRetailerName(retailer != null ? retailer.getRetailerName() : null); response.setFarmName(farm != null ? farm.getFarmName() : null); if (order != null && !order.getOrderItems().isEmpty()) { var batch = order.getOrderItems().get(0).getListing().getBatch(); response.setBatchCode(batch.getBatchCode()); QrCode qrCode = qrCodeRepository.findByBatch_BatchId(batch.getBatchId()).orElse(null); response.setTraceCode(qrCode != null ? qrCode.getQrValue() : null); response.setQrCodeUrl(qrCode != null ? qrCode.getQrUrl() : null); } response.setShippingManagerUserId(shipment.getShippingManagerUserId()); response.setDriverId(shipment.getDriverId()); response.setDriverCode(driver != null ? driver.getDriverCode() : null); response.setDriverName(driver != null && driver.getUser() != null ? driver.getUser().getFullName() : null); response.setVehicleId(shipment.getVehicleId()); response.setVehiclePlateNo(vehicle != null ? vehicle.getPlateNo() : null); response.setVehicleType(vehicle != null ? vehicle.getVehicleType() : null); response.setStatus(shipment.getStatus().name()); response.setNote(shipment.getNote()); response.setPickupConfirmedAt(shipment.getPickupConfirmedAt()); response.setDeliveryConfirmedAt(shipment.getDeliveryConfirmedAt()); response.setCancelReason(shipment.getCancelReason()); response.setReports(reportRepository.findByShipmentIdOrderByCreatedAtDesc(shipment.getShipmentId()).stream().map(this::toReportResponse).toList()); response.setCreatedAt(shipment.getCreatedAt()); response.setUpdatedAt(shipment.getUpdatedAt()); return response; }
    private ShipmentResponse toEligibleOrderShipmentResponse(Order order) { ShipmentResponse response = new ShipmentResponse(); Farm farm = farmRepository.findById(order.getFarmId()).orElse(null); Retailer retailer = retailerRepository.findById(order.getRetailerId()).orElse(null); response.setOrderId(order.getOrderId()); response.setOrderStatus(order.getStatusEnum().name()); response.setPaymentStatus(order.getPaymentStatusEnum().name()); response.setRetailerName(retailer != null ? retailer.getRetailerName() : null); response.setFarmName(farm != null ? farm.getFarmName() : null); if (!order.getOrderItems().isEmpty()) { var batch = order.getOrderItems().get(0).getListing().getBatch(); response.setBatchCode(batch.getBatchCode()); QrCode qrCode = qrCodeRepository.findByBatch_BatchId(batch.getBatchId()).orElse(null); response.setTraceCode(qrCode != null ? qrCode.getQrValue() : null); response.setQrCodeUrl(qrCode != null ? qrCode.getQrUrl() : null); } response.setStatus("READY_FOR_SHIPMENT"); response.setCreatedAt(order.getCreatedAt()); response.setUpdatedAt(order.getUpdatedAt()); return response; }
}
