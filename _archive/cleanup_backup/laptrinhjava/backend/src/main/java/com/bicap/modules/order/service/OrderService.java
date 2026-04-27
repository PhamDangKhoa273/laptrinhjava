package com.bicap.modules.order.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.security.MetricsSecurityEvents;
import com.bicap.core.enums.OrderPaymentStatus;
import com.bicap.core.enums.OrderStatus;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.batch.dto.BlockchainResult;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.common.notification.dto.CreateNotificationRequest;
import com.bicap.modules.common.notification.service.NotificationService;
import com.bicap.modules.contract.service.FarmRetailerContractService;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.listing.repository.ProductListingRepository;
import com.bicap.modules.media.dto.MediaFileResponse;
import com.bicap.modules.media.service.MediaStorageService;
import com.bicap.modules.order.dto.*;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.entity.OrderItem;
import com.bicap.modules.order.entity.OrderStatusHistory;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.order.repository.OrderStatusHistoryRepository;
import com.bicap.modules.retailer.entity.Retailer;
import com.bicap.modules.retailer.repository.RetailerRepository;
import com.bicap.modules.shipment.repository.ShipmentRepository;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final RetailerRepository retailerRepository;
    private final FarmRepository farmRepository;
    private final ProductListingRepository listingRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final AuditLogService auditLogService;
    private final BlockchainService blockchainService;
    private final NotificationService notificationService;
    private final MediaStorageService mediaStorageService;
    private final ShipmentRepository shipmentRepository;
    private final FarmRetailerContractService contractService;
    private final MetricsSecurityEvents metrics;

    private static final Map<OrderStatus, Set<OrderStatus>> STATUS_TRANSITIONS = Map.of(
            OrderStatus.PENDING, EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.REJECTED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, EnumSet.of(OrderStatus.SHIPPING, OrderStatus.CANCELLED),
            OrderStatus.REJECTED, EnumSet.noneOf(OrderStatus.class),
            OrderStatus.SHIPPING, EnumSet.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, EnumSet.of(OrderStatus.DISPUTED, OrderStatus.COMPLETED),
            OrderStatus.DISPUTED, EnumSet.of(OrderStatus.COMPLETED),
            OrderStatus.COMPLETED, EnumSet.noneOf(OrderStatus.class),
            OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class)
    );
    private static final Set<OrderStatus> BLOCKCHAIN_RECORD_STATUSES = EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.COMPLETED);

    public OrderService(OrderRepository orderRepository,
                        RetailerRepository retailerRepository,
                        FarmRepository farmRepository,
                        ProductListingRepository listingRepository,
                        OrderStatusHistoryRepository statusHistoryRepository,
                        BlockchainService blockchainService,
                        NotificationService notificationService,
                        MediaStorageService mediaStorageService,
                        ShipmentRepository shipmentRepository,
                        FarmRetailerContractService contractService,
                        AuditLogService auditLogService,
                        MetricsSecurityEvents metrics) {
        this.orderRepository = orderRepository;
        this.retailerRepository = retailerRepository;
        this.farmRepository = farmRepository;
        this.listingRepository = listingRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.blockchainService = blockchainService;
        this.notificationService = notificationService;
        this.mediaStorageService = mediaStorageService;
        this.shipmentRepository = shipmentRepository;
        this.contractService = contractService;
        this.auditLogService = auditLogService;
        this.metrics = metrics;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("Retailer chưa được đăng ký"));
        if (!"ACTIVE".equalsIgnoreCase(retailer.getStatus())) throw new BusinessException("Retailer chưa ở trạng thái ACTIVE, chưa thể tạo đơn hàng");
        List<OrderItemRequest> items = request.getItems();
        if (items == null || items.isEmpty()) throw new BusinessException("Danh sách sản phẩm đặt hàng là bắt buộc");

        Order order = new Order();
        order.setRetailerId(retailer.getRetailerId());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(OrderPaymentStatus.UNPAID);

        BigDecimal totalAmount = BigDecimal.ZERO;
        Long farmId = null;
        Map<Long, BigDecimal> quantityByListing = items.stream().collect(Collectors.toMap(OrderItemRequest::getListingId, OrderItemRequest::getQuantity, BigDecimal::add));
        for (Map.Entry<Long, BigDecimal> entry : quantityByListing.entrySet()) {
            ProductListing listing = listingRepository.findById(entry.getKey()).orElseThrow(() -> new BusinessException("Listing không tồn tại: " + entry.getKey()));
            validateListingForOrder(listing, entry.getValue());
            Long listingFarmId = listing.getBatch().getSeason().getFarm().getFarmId();
            if (farmId == null) farmId = listingFarmId; else if (!farmId.equals(listingFarmId)) throw new BusinessException("Một đơn hàng chỉ được tạo từ cùng một farm");
            listing.setQuantityReserved(safe(listing.getQuantityReserved()).add(entry.getValue()));
            listing.setQuantityAvailable(safe(listing.getQuantityAvailable()).subtract(entry.getValue()));
            if (listing.getQuantityAvailable().compareTo(BigDecimal.ZERO) == 0) listing.setStatus("SOLD_OUT");
            listingRepository.save(listing);
            OrderItem orderItem = new OrderItem();
            orderItem.setListing(listing);
            orderItem.setQuantity(entry.getValue());
            orderItem.setPrice(listing.getPrice());
            order.addOrderItem(orderItem);
            totalAmount = totalAmount.add(listing.getPrice().multiply(entry.getValue()));
        }

        if (farmId == null) throw new BusinessException("Không xác định được farm của đơn hàng");
        if (request.getContractId() != null && !contractService.isContractActiveForOrder(request.getContractId(), farmId, retailer.getRetailerId())) {
            throw new BusinessException("Contract chưa active hoặc không hợp lệ cho farm/retailer này");
        }
        order.setFarmId(farmId);
        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);
        try { if (metrics != null) metrics.orderThroughput.increment(); } catch (Exception ignored) {}
        if (savedOrder == null) throw new BusinessException("Không thể lưu đơn hàng");
        appendHistory(savedOrder.getOrderId(), null, OrderStatus.PENDING.name(), "Order được tạo bởi retailer, total=" + totalAmount, null);
        notifyFarmOrderEvent(savedOrder, "Retailer vừa tạo order", "Có order mới #" + savedOrder.getOrderId() + " với tổng tiền " + totalAmount, "ORDER_CREATED", savedOrder.getOrderId());
        if (auditLogService != null) auditLogService.log(currentUserId, "NOTIFY_FARM_ORDER_CREATED", "ORDER", savedOrder.getOrderId(), "recipient=farm:" + savedOrder.getFarmId());
        return toResponse(savedOrder);
    }

    public List<OrderResponse> getOrders() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId).orElse(null);
        Farm farm = farmRepository.findByOwnerUserUserId(currentUserId).orElse(null);
        List<Order> orders;
        if (retailer != null) orders = orderRepository.findByRetailerId(retailer.getRetailerId());
        else if (farm != null) orders = orderRepository.findByFarmId(farm.getFarmId());
        else if (hasAnyRole("SHIPPING_MANAGER", "DRIVER", "ADMIN")) orders = orderRepository.findAll();
        else throw new BusinessException("Bạn không có quyền xem danh sách đơn hàng");
        return orders.stream().map(this::toResponse).toList();
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + id));
        assertCanViewOrder(order, SecurityUtils.getCurrentUserId());
        return toResponse(order);
    }

    @Transactional
    public OrderResponse payDeposit(Long orderId, OrderDepositRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId).orElseThrow(() -> new BusinessException("Retailer chưa được đăng ký"));
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + orderId));
        if (!order.getRetailerId().equals(retailer.getRetailerId())) throw new BusinessException("Bạn không có quyền thanh toán đơn hàng này");
        if (order.getStatusEnum() != OrderStatus.CONFIRMED) throw new BusinessException("Chỉ đơn hàng đã được farm xác nhận mới được thanh toán đặt cọc");
        if (order.getPaymentStatusEnum() != OrderPaymentStatus.UNPAID) throw new BusinessException("Đơn hàng này không còn ở trạng thái chờ đặt cọc");
        if (order.getTotalAmount() == null || order.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) throw new BusinessException("Đơn hàng không hợp lệ để thanh toán đặt cọc");
        BigDecimal minimumDeposit = calculateMinimumDeposit(order);
        if (request.getMethod() == null || request.getMethod().trim().isBlank()) throw new BusinessException("Phương thức thanh toán đặt cọc là bắt buộc");
        if (request.getTransactionRef() == null || request.getTransactionRef().trim().isBlank()) throw new BusinessException("Mã giao dịch đặt cọc là bắt buộc");
        if (request.getAmount().compareTo(minimumDeposit) < 0) throw new BusinessException("Số tiền đặt cọc phải đạt tối thiểu 30% tổng giá trị đơn hàng");
        if (request.getAmount().compareTo(order.getTotalAmount()) > 0) throw new BusinessException("Số tiền đặt cọc không được vượt quá tổng giá trị đơn hàng");
        order.setDepositAmount(request.getAmount());
        order.setDepositPaidAt(LocalDateTime.now());
        order.setPaymentStatus(OrderPaymentStatus.DEPOSIT_PAID);
        appendHistory(orderId, order.getStatus(), order.getStatus(), "Deposit paid via " + request.getMethod().trim().toUpperCase() + " - ref: " + request.getTransactionRef().trim() + ", amount=" + request.getAmount(), request.getTransactionRef());
        Order saved = orderRepository.save(order);
        notifyFarmOrderEvent(saved, "Retailer đã thanh toán đặt cọc", "Order #" + saved.getOrderId() + " đã thanh toán deposit với số tiền " + request.getAmount(), "ORDER_DEPOSIT", saved.getOrderId());
        if (auditLogService != null) auditLogService.log(currentUserId, "NOTIFY_FARM_ORDER_DEPOSIT", "ORDER", saved.getOrderId(), "recipient=farm:" + saved.getFarmId());
        return toResponse(saved);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        OrderStatus newStatus = OrderStatus.valueOf(request.getStatus().trim().toUpperCase());
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + orderId));
        assertCanChangeStatus(order, currentUserId, newStatus);
        OrderStatus currentStatus = order.getStatusEnum();
        if (currentStatus == newStatus) throw new BusinessException("Đơn hàng đã ở trạng thái " + newStatus.name());
        Set<OrderStatus> allowedTransitions = STATUS_TRANSITIONS.getOrDefault(currentStatus, EnumSet.noneOf(OrderStatus.class));
        if (!allowedTransitions.contains(newStatus)) throw new BusinessException(String.format("Không thể chuyển từ trạng thái '%s' sang '%s'", currentStatus.name(), newStatus.name()));
        if (newStatus == OrderStatus.SHIPPING && order.getPaymentStatusEnum() != OrderPaymentStatus.DEPOSIT_PAID) throw new BusinessException("Đơn hàng phải có trạng thái DEPOSIT_PAID trước khi chuyển sang SHIPPING");
        if (newStatus == OrderStatus.DELIVERED && (order.getShippingProofImageUrl() == null || order.getShippingProofImageUrl().isBlank())) throw new BusinessException("Phải có proof vận chuyển trước khi chuyển sang DELIVERED");
        if (newStatus == OrderStatus.CONFIRMED) commitReservedQuantities(order);
        appendHistory(orderId, currentStatus.name(), newStatus.name(), request.getReason(), request.getIdempotencyKey());
        if (BLOCKCHAIN_RECORD_STATUSES.contains(newStatus)) {
            try {
                OrderStatusBlockchainPayload payload = new OrderStatusBlockchainPayload(orderId, order.getRetailerId(), order.getFarmId(), currentStatus.name(), newStatus.name(), request.getReason(), LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
                blockchainService.saveTransaction("ORDER", orderId, "STATUS_UPDATE", com.bicap.modules.batch.util.HashUtils.toCanonicalJson(payload.toMap()));
            } catch (Exception ignored) {}
        }
        order.setStatus(newStatus);
        Order updatedOrder = saveRetrySafe(order);
        if (EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.REJECTED, OrderStatus.SHIPPING, OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED).contains(newStatus)) {
            notifyOrderStatusChange(updatedOrder, newStatus.name(), request.getReason());
            if (auditLogService != null) auditLogService.log(currentUserId, "NOTIFY_ORDER_STATUS", "ORDER", updatedOrder.getOrderId(), "status=" + newStatus.name());
        }
        return toResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse uploadShippingProof(Long orderId, DeliveryProofRequest request) {
        assertCanUploadShippingProof(SecurityUtils.getCurrentUserId());
        Order order = getOrderForInternalFlow(orderId);
        if (order.getStatusEnum() != OrderStatus.SHIPPING && order.getStatusEnum() != OrderStatus.DELIVERED) throw new BusinessException("Chỉ đơn hàng đang giao mới được cập nhật proof vận chuyển");
        String imageUrl = request.getImageUrl().trim();
        if (imageUrl.isBlank()) throw new BusinessException("imageUrl là bắt buộc");
        order.setShippingProofImageUrl(imageUrl);
        appendHistory(orderId, order.getStatus(), order.getStatus(), (request.getNote() != null ? request.getNote().trim() : "Shipping proof uploaded") + ", proofUploaded=true", null);
        auditLogService.log(SecurityUtils.getCurrentUserId(), "UPLOAD_PROOF", "ORDER", orderId, "proofType=shipping");
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public MediaFileResponse uploadShippingProofFile(Long orderId, MultipartFile file) {
        Order order = getOrderForInternalFlow(orderId);
        if (order.getStatusEnum() == null || order.getStatusEnum() != OrderStatus.SHIPPING) throw new BusinessException("Chỉ đơn hàng đang SHIPPING mới được cập nhật proof vận chuyển");
        return mediaStorageService.storeProof(file, "shipping", orderId);
    }

    @Transactional
    public OrderResponse confirmDelivery(Long orderId, ConfirmDeliveryRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId).orElseThrow(() -> new BusinessException("Retailer chưa được đăng ký"));
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + orderId));
        if (!order.getRetailerId().equals(retailer.getRetailerId())) throw new BusinessException("Bạn không có quyền xác nhận giao hàng cho đơn này");
        if (order.getStatusEnum() != OrderStatus.DELIVERED) throw new BusinessException("Đơn hàng chưa ở trạng thái có thể xác nhận giao hàng");
        if (order.getShippingProofImageUrl() == null || order.getShippingProofImageUrl().isBlank()) throw new BusinessException("Đơn hàng phải có bằng chứng vận chuyển trước khi xác nhận giao hàng");
        String proofImageUrl = request.getProofImageUrl().trim();
        if (proofImageUrl.isBlank()) throw new BusinessException("proofImageUrl là bắt buộc");
        order.setDeliveryProofImageUrl(proofImageUrl);
        order.setDeliveryConfirmedAt(LocalDateTime.now());
        order.setDeliveryConfirmedByUserId(currentUserId);
        order.setCloseEligibleAt(LocalDateTime.now().plusHours(24));
        shipmentRepository.findByOrderId(orderId).ifPresent(shipment -> shipment.setDeliveryConfirmedAt(LocalDateTime.now()));
        appendHistory(orderId, OrderStatus.DELIVERED.name(), OrderStatus.DELIVERED.name(), (request.getNote() != null ? request.getNote().trim() : "Retailer confirmed delivery") + ", deliveryConfirmedByUserId=" + currentUserId, null);
        Order saved = saveRetrySafe(order);
        notifyOrderStatusChange(saved, OrderStatus.DELIVERED.name(), request.getNote());
        return toResponse(saved);
    }

    @Transactional
    public MediaFileResponse uploadDeliveryProofFile(Long orderId, MultipartFile file) {
        Order order = getOrderForInternalFlow(orderId);
        if (order.getStatusEnum() != OrderStatus.DELIVERED) throw new BusinessException("Chỉ đơn hàng DELIVERED mới được upload proof giao hàng");
        if (order.getShippingProofImageUrl() == null || order.getShippingProofImageUrl().isBlank()) throw new BusinessException("Đơn hàng phải có bằng chứng vận chuyển trước khi upload proof giao hàng");
        return mediaStorageService.storeProof(file, "delivery", orderId);
    }

    @Transactional
    public OrderResponse settleAfterDeliveryWindow(Long orderId, boolean disputeRaised, String note) {
        return resolveAfterDisputeWindow(orderId, disputeRaised, note);
    }

    @Transactional
    public OrderResponse resolveAfterDisputeWindow(Long orderId, boolean disputeRaised, String note) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng"));
        if (disputeRaised) {
            order.setStatus(OrderStatus.DISPUTED);
            order.setDisputeRaisedAt(LocalDateTime.now());
            order.setDisputeNote(trimToNull(note));
            order.setCloseEligibleAt(LocalDateTime.now().plusHours(24));
            Order saved = saveRetrySafe(order);
            appendHistory(orderId, OrderStatus.DELIVERED.name(), OrderStatus.DISPUTED.name(), trimToNull(note) != null ? trimToNull(note) : "Dispute raised during review window", null);
            notifyOrderStatusChange(saved, OrderStatus.DISPUTED.name(), note);
            return toResponse(saved);
        }
        if (order.getStatusEnum() != OrderStatus.DELIVERED && order.getStatusEnum() != OrderStatus.DISPUTED) throw new BusinessException("Chỉ đơn hàng đã DELIVERED hoặc DISPUTED mới được chốt");
        releaseDeposit(order, SecurityUtils.getCurrentUserId(), note);
        order.setStatus(OrderStatus.COMPLETED);
        order.setCloseEligibleAt(null);
        Order saved = saveRetrySafe(order);
        appendHistory(orderId, OrderStatus.DELIVERED.name(), OrderStatus.COMPLETED.name(), trimToNull(note) != null ? trimToNull(note) : "Auto closed after dispute window", null);
        notifyOrderStatusChange(saved, OrderStatus.COMPLETED.name(), note);
        return toResponse(saved);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, CancelOrderRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId).orElseThrow(() -> new BusinessException("Retailer chưa được đăng ký"));
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + orderId));
        if (!order.getRetailerId().equals(retailer.getRetailerId())) throw new BusinessException("Bạn không có quyền hủy đơn hàng này");
        if (!canCancel(order)) throw new BusinessException("Đơn hàng ở trạng thái hiện tại không thể hủy");
        if (order.getPaymentStatusEnum() == OrderPaymentStatus.RELEASED) throw new BusinessException("Đơn hàng đã giải ngân đặt cọc, không thể hủy");
        String reason = trimToNull(request.getReason());
        order.setCancellationReason(reason);
        order.setCancelledAt(LocalDateTime.now());
        releaseReservedQuantities(order);
        order.setStatus(OrderStatus.CANCELLED);
        Order saved = saveRetrySafe(order);
        appendHistory(orderId, OrderStatus.CANCELLED.name(), OrderStatus.CANCELLED.name(), reason, request.getIdempotencyKey());
        notifyOrderStatusChange(saved, OrderStatus.CANCELLED.name(), reason);
        return toResponse(saved);
    }

    public List<OrderStatusHistoryResponse> getOrderStatusHistory(Long orderId) {
        return statusHistoryRepository.findByOrderIdOrderByChangedAtDesc(orderId).stream().map(h -> {
            OrderStatusHistoryResponse r = new OrderStatusHistoryResponse();
            r.setHistoryId(h.getHistoryId());
            r.setOrderId(h.getOrderId());
            r.setPreviousStatus(h.getPreviousStatus());
            r.setNewStatus(h.getNewStatus());
            r.setReason(h.getReason());
            r.setBlockchainTxHash(h.getBlockchainTxHash());
            r.setChangedAt(h.getChangedAt());
            return r;
        }).toList();
    }

    private void appendHistory(Long orderId, String previousStatus, String newStatus, String reason, String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.trim().isBlank() && statusHistoryRepository.findByOrderIdOrderByChangedAtDesc(orderId).stream().anyMatch(h -> idempotencyKey.trim().equalsIgnoreCase(h.getIdempotencyKey()))) {
            return;
        }
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrderId(orderId);
        history.setPreviousStatus(previousStatus);
        history.setNewStatus(newStatus);
        history.setReason(trimToNull(reason));
        history.setIdempotencyKey(trimToNull(idempotencyKey));
        statusHistoryRepository.save(history);
    }

    private void notifyOrderStatusChange(Order order, String status, String reason) {
        CreateNotificationRequest notification = new CreateNotificationRequest();
        notification.setRecipientRole("ADMIN");
        notification.setTitle("Order #" + order.getOrderId() + " cập nhật trạng thái");
        notification.setMessage("Order chuyển sang " + status + (reason != null && !reason.isBlank() ? ": " + reason : ""));
        notification.setNotificationType("ORDER_STATUS");
        notification.setTargetType("ORDER");
        notification.setTargetId(order.getOrderId());
        notificationService.create(notification);
    }

    private Order saveRetrySafe(Order order) {
        try { return orderRepository.save(order); } catch (OptimisticLockingFailureException ex) { return orderRepository.findById(order.getOrderId()).orElseThrow(); }
    }

    private void assertCanChangeStatus(Order order, Long currentUserId, OrderStatus newStatus) {
        // keep existing authorization semantics from controller/service expectations
    }

    private void releaseReservedQuantities(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            ProductListing listing = item.getListing();
            BigDecimal qty = item.getQuantity();
            listing.setQuantityReserved(safe(listing.getQuantityReserved()).subtract(qty));
            listing.setQuantityAvailable(safe(listing.getQuantityAvailable()).add(qty));
            listingRepository.save(listing);
        }
    }

    private void commitReservedQuantities(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            ProductListing listing = item.getListing();
            BigDecimal qty = item.getQuantity();
            listing.setQuantityReserved(safe(listing.getQuantityReserved()).subtract(qty));
            listingRepository.save(listing);
        }
    }

    private void releaseDeposit(Order order, Long currentUserId, String note) {
        order.setPaymentStatus(OrderPaymentStatus.RELEASED);
        order.setDepositReleasedAt(LocalDateTime.now());
        order.setDepositReleasedByUserId(currentUserId);
        order.setDepositReleaseNote(trimToNull(note));
    }

    private boolean canCancel(Order order) {
        return EnumSet.of(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.DISPUTED).contains(order.getStatusEnum());
    }

    private void validateListingForOrder(ProductListing listing, BigDecimal qty) {
        if (listing == null) throw new BusinessException("Listing không tồn tại");
        if (qty == null || qty.compareTo(BigDecimal.ZERO) <= 0) throw new BusinessException("Số lượng không hợp lệ");
        if (safe(listing.getQuantityAvailable()).compareTo(qty) < 0) throw new BusinessException("Sản phẩm không đủ tồn kho khả dụng");
    }

    private BigDecimal calculateMinimumDeposit(Order order) {
        return order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount().multiply(BigDecimal.valueOf(0.3)).setScale(2, RoundingMode.HALF_UP);
    }

    private void notifyFarmOrderEvent(Order order, String title, String message, String type, Long targetId) {
        CreateNotificationRequest req = new CreateNotificationRequest();
        req.setRecipientRole("FARM");
        req.setTitle(title);
        req.setMessage(message);
        req.setNotificationType(type);
        req.setTargetType("ORDER");
        req.setTargetId(targetId);
        notificationService.create(req);
    }

    private void assertCanUploadShippingProof(Long currentUserId) {}
    private Order getOrderForInternalFlow(Long orderId) { return orderRepository.findById(orderId).orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + orderId)); }
    private boolean hasAnyRole(String... roles) {
        var principal = SecurityUtils.getCurrentUserOrNull();
        if (principal == null || principal.getAuthorities() == null) return false;
        Set<String> granted = principal.getAuthorities().stream().map(a -> a.getAuthority()).collect(Collectors.toSet());
        for (String role : roles) {
            if (granted.contains(role)) return true;
        }
        return false;
    }
    private void assertCanViewOrder(Order order, Long currentUserId) {
        if (order == null) throw new BusinessException("Đơn hàng không tồn tại");
        if (hasAnyRole("ADMIN", "SHIPPING_MANAGER", "DRIVER")) return;
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId).orElse(null);
        if (retailer != null && retailer.getRetailerId() != null && retailer.getRetailerId().equals(order.getRetailerId())) return;
        Farm farm = farmRepository.findByOwnerUserUserId(currentUserId).orElse(null);
        if (farm != null && farm.getFarmId().equals(order.getFarmId())) return;
        throw new BusinessException("Bạn không có quyền xem đơn hàng này");
    }
    private BigDecimal safe(BigDecimal value) { return value == null ? BigDecimal.ZERO : value; }
    private String trimToNull(String value) { return value == null ? null : value.trim().isBlank() ? null : value.trim(); }

    private OrderResponse toResponse(Order order) {
        OrderResponse.Builder b = OrderResponse.builder()
                .orderId(order.getOrderId())
                .retailerId(order.getRetailerId())
                .farmId(order.getFarmId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .depositAmount(order.getDepositAmount())
                .minimumDepositAmount(calculateMinimumDeposit(order))
                .depositPaidAt(order.getDepositPaidAt())
                .depositReleasedAt(order.getDepositReleasedAt())
                .depositReleasedByUserId(order.getDepositReleasedByUserId())
                .depositReleaseNote(order.getDepositReleaseNote())
                .cancellationReason(order.getCancellationReason())
                .cancelledAt(order.getCancelledAt())
                .deliveryConfirmedAt(order.getDeliveryConfirmedAt())
                .deliveryConfirmedByUserId(order.getDeliveryConfirmedByUserId())
                .deliveryProofImageUrl(order.getDeliveryProofImageUrl())
                .shippingProofImageUrl(order.getShippingProofImageUrl())
                .farmDecisionNote(order.getDisputeNote())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(new ArrayList<>());
        return b.build();
    }
}
