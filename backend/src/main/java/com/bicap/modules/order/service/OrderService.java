package com.bicap.modules.order.service;

import com.bicap.core.enums.OrderPaymentStatus;
import com.bicap.core.enums.OrderStatus;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.batch.dto.BlockchainResult;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.common.notification.dto.CreateNotificationRequest;
import com.bicap.modules.common.notification.service.NotificationService;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.listing.repository.ProductListingRepository;
import com.bicap.modules.media.dto.MediaFileResponse;
import com.bicap.modules.media.service.MediaStorageService;
import com.bicap.modules.order.dto.CancelOrderRequest;
import com.bicap.modules.order.dto.ConfirmDeliveryRequest;
import com.bicap.modules.order.dto.CreateOrderRequest;
import com.bicap.modules.order.dto.DeliveryProofRequest;
import com.bicap.modules.order.dto.OrderDepositRequest;
import com.bicap.modules.order.dto.OrderItemRequest;
import com.bicap.modules.order.dto.OrderItemResponse;
import com.bicap.modules.order.dto.OrderResponse;
import com.bicap.modules.order.dto.OrderStatusBlockchainPayload;
import com.bicap.modules.order.dto.OrderStatusHistoryResponse;
import com.bicap.modules.order.dto.UpdateOrderStatusRequest;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.entity.OrderItem;
import com.bicap.modules.order.entity.OrderStatusHistory;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.order.repository.OrderStatusHistoryRepository;
import com.bicap.modules.retailer.entity.Retailer;
import com.bicap.modules.retailer.repository.RetailerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.LinkedHashSet;
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
    private final BlockchainService blockchainService;
    private final NotificationService notificationService;
    private final MediaStorageService mediaStorageService;

    private static final Set<OrderStatus> VALID_STATUSES = EnumSet.allOf(OrderStatus.class);

    private static final Map<OrderStatus, Set<OrderStatus>> STATUS_TRANSITIONS = Map.of(
            OrderStatus.PENDING, EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, EnumSet.of(OrderStatus.SHIPPING, OrderStatus.CANCELLED),
            OrderStatus.SHIPPING, EnumSet.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, EnumSet.of(OrderStatus.COMPLETED),
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
                        MediaStorageService mediaStorageService) {
        this.orderRepository = orderRepository;
        this.retailerRepository = retailerRepository;
        this.farmRepository = farmRepository;
        this.listingRepository = listingRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.blockchainService = blockchainService;
        this.notificationService = notificationService;
        this.mediaStorageService = mediaStorageService;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("Retailer chưa được đăng ký"));

        if (!"ACTIVE".equalsIgnoreCase(retailer.getStatus())) {
            throw new BusinessException("Retailer chưa ở trạng thái ACTIVE, chưa thể tạo đơn hàng");
        }

        List<OrderItemRequest> items = request.getItems();
        if (items == null || items.isEmpty()) {
            throw new BusinessException("Danh sách sản phẩm đặt hàng là bắt buộc");
        }

        Order order = new Order();
        order.setRetailerId(retailer.getRetailerId());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(OrderPaymentStatus.UNPAID);

        BigDecimal totalAmount = BigDecimal.ZERO;
        Long farmId = null;

        Map<Long, BigDecimal> quantityByListing = items.stream()
                .collect(Collectors.toMap(OrderItemRequest::getListingId,
                        OrderItemRequest::getQuantity,
                        BigDecimal::add));

        for (Map.Entry<Long, BigDecimal> entry : quantityByListing.entrySet()) {
            Long listingId = entry.getKey();
            BigDecimal orderQuantity = entry.getValue();

            ProductListing listing = listingRepository.findById(listingId)
                    .orElseThrow(() -> new BusinessException("Listing không tồn tại: " + listingId));
            validateListingForOrder(listing, orderQuantity);

            Long listingFarmId = listing.getBatch().getSeason().getFarm().getFarmId();
            if (farmId == null) {
                farmId = listingFarmId;
            } else if (!farmId.equals(listingFarmId)) {
                throw new BusinessException("Một đơn hàng chỉ được tạo từ cùng một farm");
            }

            listing.setQuantityAvailable(listing.getQuantityAvailable().subtract(orderQuantity));
            if (listing.getQuantityAvailable().compareTo(BigDecimal.ZERO) == 0) {
                listing.setStatus("SOLD_OUT");
            }
            listingRepository.save(listing);

            OrderItem orderItem = new OrderItem();
            orderItem.setListing(listing);
            orderItem.setQuantity(orderQuantity);
            orderItem.setPrice(listing.getPrice());
            order.addOrderItem(orderItem);

            totalAmount = totalAmount.add(listing.getPrice().multiply(orderQuantity));
        }

        if (farmId == null) {
            throw new BusinessException("Không xác định được farm của đơn hàng");
        }

        order.setFarmId(farmId);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        appendHistory(savedOrder.getOrderId(), null, OrderStatus.PENDING.name(), "Order được tạo bởi retailer");
        return toResponse(savedOrder);
    }

    public List<OrderResponse> getOrders() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId).orElse(null);
        Farm farm = farmRepository.findByOwnerUserUserId(currentUserId).orElse(null);

        List<Order> orders;
        if (retailer != null) {
            orders = orderRepository.findByRetailerId(retailer.getRetailerId());
        } else if (farm != null) {
            orders = orderRepository.findByFarmId(farm.getFarmId());
        } else if (hasAnyRole("SHIPPING_MANAGER", "DRIVER", "ADMIN")) {
            orders = orderRepository.findAll();
        } else {
            throw new BusinessException("Bạn không có quyền xem danh sách đơn hàng");
        }

        return orders.stream().map(this::toResponse).toList();
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + id));
        assertCanViewOrder(order, SecurityUtils.getCurrentUserId());
        return toResponse(order);
    }

    @Transactional
    public OrderResponse payDeposit(Long orderId, OrderDepositRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("Retailer chưa được đăng ký"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + orderId));

        if (!order.getRetailerId().equals(retailer.getRetailerId())) {
            throw new BusinessException("Bạn không có quyền thanh toán đơn hàng này");
        }
        if (order.getStatusEnum() != OrderStatus.PENDING) {
            throw new BusinessException("Chỉ đơn hàng ở trạng thái PENDING mới được thanh toán đặt cọc");
        }
        if (order.getPaymentStatusEnum() != OrderPaymentStatus.UNPAID) {
            throw new BusinessException("Đơn hàng này không còn ở trạng thái chờ đặt cọc");
        }
        if (order.getTotalAmount() == null || order.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Đơn hàng không hợp lệ để thanh toán đặt cọc");
        }

        BigDecimal minimumDeposit = calculateMinimumDeposit(order);
        if (request.getMethod() == null || request.getMethod().trim().isBlank()) {
            throw new BusinessException("Phương thức thanh toán đặt cọc là bắt buộc");
        }
        if (request.getTransactionRef() == null || request.getTransactionRef().trim().isBlank()) {
            throw new BusinessException("Mã giao dịch đặt cọc là bắt buộc");
        }
        if (request.getAmount().compareTo(minimumDeposit) < 0) {
            throw new BusinessException("Số tiền đặt cọc phải đạt tối thiểu 30% tổng giá trị đơn hàng");
        }
        if (request.getAmount().compareTo(order.getTotalAmount()) > 0) {
            throw new BusinessException("Số tiền đặt cọc không được vượt quá tổng giá trị đơn hàng");
        }

        order.setDepositAmount(request.getAmount());
        order.setDepositPaidAt(LocalDateTime.now());
        order.setPaymentStatus(OrderPaymentStatus.DEPOSIT_PAID);

        appendHistory(orderId, order.getStatus(), order.getStatus(), "Deposit paid via " + request.getMethod().trim().toUpperCase() + " - ref: " + request.getTransactionRef().trim());
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(request.getStatus().trim().toUpperCase());
        } catch (Exception ex) {
            throw new BusinessException("Trạng thái không hợp lệ: " + request.getStatus());
        }
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new BusinessException("Trạng thái không hợp lệ: " + newStatus.name());
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + orderId));

        assertCanChangeStatus(order, currentUserId, newStatus);

        OrderStatus currentStatus = order.getStatusEnum();
        if (currentStatus == newStatus) {
            throw new BusinessException("Đơn hàng đã ở trạng thái " + newStatus.name());
        }

        Set<OrderStatus> allowedTransitions = STATUS_TRANSITIONS.getOrDefault(currentStatus, EnumSet.noneOf(OrderStatus.class));
        if (!allowedTransitions.contains(newStatus)) {
            throw new BusinessException(String.format("Không thể chuyển từ trạng thái '%s' sang '%s'", currentStatus.name(), newStatus.name()));
        }

        if (newStatus == OrderStatus.CONFIRMED && order.getPaymentStatusEnum() != OrderPaymentStatus.DEPOSIT_PAID) {
            throw new BusinessException("Đơn hàng phải được thanh toán đặt cọc trước khi xác nhận");
        }
        if (newStatus == OrderStatus.SHIPPING && order.getPaymentStatusEnum() != OrderPaymentStatus.DEPOSIT_PAID) {
            throw new BusinessException("Đơn hàng phải có trạng thái DEPOSIT_PAID trước khi chuyển sang SHIPPING");
        }
        if (newStatus == OrderStatus.DELIVERED && (order.getShippingProofImageUrl() == null || order.getShippingProofImageUrl().isBlank())) {
            throw new BusinessException("Phải có proof vận chuyển trước khi chuyển sang DELIVERED");
        }

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrderId(orderId);
        history.setPreviousStatus(currentStatus.name());
        history.setNewStatus(newStatus.name());
        history.setReason(trimToNull(request.getReason()));

        if (BLOCKCHAIN_RECORD_STATUSES.contains(newStatus)) {
            try {
                OrderStatusBlockchainPayload payload = new OrderStatusBlockchainPayload(
                        orderId,
                        order.getRetailerId(),
                        order.getFarmId(),
                        currentStatus.name(),
                        newStatus.name(),
                        request.getReason(),
                        LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
                );

                BlockchainResult blockchainResult = blockchainService.saveTransaction(
                        "ORDER",
                        orderId,
                        "STATUS_UPDATE",
                        com.bicap.modules.batch.util.HashUtils.toCanonicalJson(payload.toMap())
                );

                history.setBlockchainTxHash(blockchainResult.getTxHash());
            } catch (Exception ignored) {
            }
        }

        statusHistoryRepository.save(history);
        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        if (EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.SHIPPING, OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED).contains(newStatus)) {
            notifyOrderStatusChange(updatedOrder, newStatus.name(), request.getReason());
        }

        return toResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse uploadShippingProof(Long orderId, DeliveryProofRequest request) {
        assertCanUploadShippingProof(SecurityUtils.getCurrentUserId());
        Order order = getOrderForInternalFlow(orderId);
        if (order.getStatusEnum() != OrderStatus.SHIPPING && order.getStatusEnum() != OrderStatus.DELIVERED) {
            throw new BusinessException("Chỉ đơn hàng đang giao mới được cập nhật proof vận chuyển");
        }

        String imageUrl = request.getImageUrl().trim();
        if (imageUrl.isBlank()) {
            throw new BusinessException("imageUrl là bắt buộc");
        }

        order.setShippingProofImageUrl(imageUrl);
        appendHistory(orderId, order.getStatus(), order.getStatus(), request.getNote() != null ? request.getNote().trim() : "Shipping proof uploaded");
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse confirmDelivery(Long orderId, ConfirmDeliveryRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("Retailer chưa được đăng ký"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + orderId));

        if (!order.getRetailerId().equals(retailer.getRetailerId())) {
            throw new BusinessException("Bạn không có quyền xác nhận giao hàng cho đơn này");
        }
        if (order.getStatusEnum() != OrderStatus.DELIVERED) {
            throw new BusinessException("Đơn hàng chưa ở trạng thái có thể xác nhận giao hàng");
        }
        if (order.getShippingProofImageUrl() == null || order.getShippingProofImageUrl().isBlank()) {
            throw new BusinessException("Đơn hàng phải có bằng chứng vận chuyển trước khi xác nhận giao hàng");
        }

        String proofImageUrl = request.getProofImageUrl().trim();
        if (proofImageUrl.isBlank()) {
            throw new BusinessException("proofImageUrl là bắt buộc");
        }

        order.setStatus(OrderStatus.COMPLETED);
        order.setDeliveryProofImageUrl(proofImageUrl);
        order.setDeliveryConfirmedAt(LocalDateTime.now());
        order.setDeliveryConfirmedByUserId(currentUserId);
        releaseDeposit(order, currentUserId, request.getNote());
        appendHistory(orderId, OrderStatus.DELIVERED.name(), OrderStatus.COMPLETED.name(), request.getNote() != null ? request.getNote().trim() : "Retailer confirmed delivery");

        Order saved = orderRepository.save(order);
        notifyOrderStatusChange(saved, OrderStatus.COMPLETED.name(), request.getNote());
        return toResponse(saved);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, CancelOrderRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("Retailer chưa được đăng ký"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + orderId));

        if (!order.getRetailerId().equals(retailer.getRetailerId())) {
            throw new BusinessException("Bạn không có quyền hủy đơn hàng này");
        }
        if (!canCancel(order)) {
            throw new BusinessException("Đơn hàng ở trạng thái hiện tại không thể hủy");
        }
        if (order.getPaymentStatusEnum() == OrderPaymentStatus.RELEASED) {
            throw new BusinessException("Đơn hàng đã giải ngân đặt cọc, không thể hủy");
        }

        String reason = trimToNull(request.getReason());
        if (reason == null) {
            throw new BusinessException("Lý do hủy là bắt buộc");
        }

        String previousStatus = order.getStatus();
        restoreListingQuantities(order);
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(reason);
        order.setCancelledAt(LocalDateTime.now());
        appendHistory(orderId, previousStatus, OrderStatus.CANCELLED.name(), reason);

        Order saved = orderRepository.save(order);
        notifyOrderStatusChange(saved, OrderStatus.CANCELLED.name(), reason);
        return toResponse(saved);
    }

    public List<OrderStatusHistoryResponse> getOrderStatusHistory(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + orderId));
        assertCanViewOrder(order, SecurityUtils.getCurrentUserId());

        return statusHistoryRepository.findByOrderIdOrderByChangedAtDesc(orderId).stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    @Transactional
    public MediaFileResponse uploadShippingProofFile(Long orderId, MultipartFile file) {
        assertCanUploadShippingProof(SecurityUtils.getCurrentUserId());
        Order order = getOrderForInternalFlow(orderId);
        if (order.getStatusEnum() != OrderStatus.SHIPPING && order.getStatusEnum() != OrderStatus.DELIVERED) {
            throw new BusinessException("Chỉ đơn hàng đang giao mới được upload bằng chứng vận chuyển");
        }
        MediaFileResponse media = mediaStorageService.storeProof(file, "ORDER_SHIPPING_PROOF", orderId);
        order.setShippingProofImageUrl(media.getFileUrl());
        orderRepository.save(order);
        appendHistory(orderId, order.getStatus(), order.getStatus(), "Shipping proof file uploaded");
        return media;
    }

    @Transactional
    public MediaFileResponse uploadDeliveryProofFile(Long orderId, MultipartFile file) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("Retailer chưa được đăng ký"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + orderId));

        if (!order.getRetailerId().equals(retailer.getRetailerId())) {
            throw new BusinessException("Bạn không có quyền upload bằng chứng giao hàng cho đơn này");
        }
        if (order.getStatusEnum() != OrderStatus.DELIVERED) {
            throw new BusinessException("Chỉ đơn hàng đã DELIVERED mới được upload bằng chứng giao hàng");
        }
        if (order.getShippingProofImageUrl() == null || order.getShippingProofImageUrl().isBlank()) {
            throw new BusinessException("Đơn hàng phải có bằng chứng vận chuyển trước khi upload bằng chứng giao hàng");
        }

        MediaFileResponse media = mediaStorageService.storeProof(file, "ORDER_DELIVERY_PROOF", orderId);
        order.setDeliveryProofImageUrl(media.getFileUrl());
        orderRepository.save(order);
        appendHistory(orderId, order.getStatus(), order.getStatus(), "Delivery proof file uploaded");
        return media;
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(this::toItemResponse)
                .toList();
        Retailer retailer = retailerRepository.findById(order.getRetailerId()).orElse(null);
        Farm farm = farmRepository.findById(order.getFarmId()).orElse(null);

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .retailerId(order.getRetailerId())
                .farmId(order.getFarmId())
                .retailerName(retailer != null ? retailer.getRetailerName() : null)
                .farmName(farm != null ? farm.getFarmName() : null)
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
                .canPayDeposit(canPayDeposit(order))
                .canCancel(canCancel(order))
                .canConfirmDelivery(canConfirmDelivery(order))
                .canUploadDeliveryProof(canUploadDeliveryProof(order))
                .canUpdateShippingProof(canUpdateShippingProof(order))
                .allowedActions(getAllowedActions(order))
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(items)
                .build();
    }

    private void validateListingForOrder(ProductListing listing, BigDecimal orderQuantity) {
        if (!"ACTIVE".equalsIgnoreCase(listing.getStatus())) {
            throw new BusinessException("Listing " + listing.getListingId() + " không khả dụng");
        }
        if (!"APPROVED".equalsIgnoreCase(listing.getApprovalStatus())) {
            throw new BusinessException("Listing " + listing.getListingId() + " chưa được phê duyệt để giao dịch");
        }
        if (listing.getQuantityAvailable() == null || listing.getQuantityAvailable().compareTo(orderQuantity) < 0) {
            throw new BusinessException("Số lượng đặt hàng không được lớn hơn quantity_available của listing " + listing.getListingId());
        }
        if (listing.getPrice() == null || listing.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Listing " + listing.getListingId() + " chưa có giá hợp lệ");
        }
        if (listing.getBatch() == null || listing.getBatch().getSeason() == null || listing.getBatch().getSeason().getFarm() == null) {
            throw new BusinessException("Listing " + listing.getListingId() + " không liên kết farm hợp lệ");
        }
        if (listing.getBatch().getExpiryDate() != null && listing.getBatch().getExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Listing " + listing.getListingId() + " đã quá hạn sử dụng");
        }
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .listingId(item.getListing().getListingId())
                .title(item.getListing().getTitle())
                .batchCode(item.getListing().getBatch().getBatchCode())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subTotal(item.getPrice().multiply(item.getQuantity()))
                .build();
    }

    private OrderStatusHistoryResponse toHistoryResponse(OrderStatusHistory history) {
        return OrderStatusHistoryResponse.builder()
                .historyId(history.getHistoryId())
                .orderId(history.getOrderId())
                .previousStatus(history.getPreviousStatus())
                .newStatus(history.getNewStatus())
                .reason(history.getReason())
                .blockchainTxHash(history.getBlockchainTxHash())
                .changedAt(history.getChangedAt())
                .build();
    }

    private BigDecimal calculateMinimumDeposit(Order order) {
        if (order.getTotalAmount() == null) return BigDecimal.ZERO;
        return order.getTotalAmount().multiply(BigDecimal.valueOf(0.3)).setScale(2, RoundingMode.HALF_UP);
    }

    private boolean canPayDeposit(Order order) {
        return order.getStatusEnum() == OrderStatus.PENDING && order.getPaymentStatusEnum() == OrderPaymentStatus.UNPAID;
    }

    private boolean canCancel(Order order) {
        return EnumSet.of(OrderStatus.PENDING, OrderStatus.CONFIRMED).contains(order.getStatusEnum())
                && order.getPaymentStatusEnum() != OrderPaymentStatus.RELEASED;
    }

    private boolean canConfirmDelivery(Order order) {
        return order.getStatusEnum() == OrderStatus.DELIVERED
                && order.getShippingProofImageUrl() != null
                && !order.getShippingProofImageUrl().isBlank();
    }

    private boolean canUploadDeliveryProof(Order order) {
        return order.getStatusEnum() == OrderStatus.DELIVERED
                && order.getShippingProofImageUrl() != null
                && !order.getShippingProofImageUrl().isBlank();
    }

    private boolean canUpdateShippingProof(Order order) {
        return order.getStatusEnum() == OrderStatus.SHIPPING || order.getStatusEnum() == OrderStatus.DELIVERED;
    }

    private List<String> getAllowedActions(Order order) {
        Set<String> actions = new LinkedHashSet<>();
        if (canPayDeposit(order)) actions.add("PAY_DEPOSIT");
        if (canCancel(order)) actions.add("CANCEL_ORDER");
        if (canConfirmDelivery(order)) actions.add("CONFIRM_DELIVERY");
        if (canUploadDeliveryProof(order)) actions.add("UPLOAD_DELIVERY_PROOF");
        if (canUpdateShippingProof(order)) actions.add("UPLOAD_SHIPPING_PROOF");
        return new ArrayList<>(actions);
    }

    private void restoreListingQuantities(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            ProductListing listing = item.getListing();
            listing.setQuantityAvailable(listing.getQuantityAvailable().add(item.getQuantity()));
            if ("SOLD_OUT".equalsIgnoreCase(listing.getStatus()) && listing.getQuantityAvailable().compareTo(BigDecimal.ZERO) > 0) {
                listing.setStatus("ACTIVE");
            }
            listingRepository.save(listing);
        }
    }

    private void releaseDeposit(Order order, Long releasedByUserId, String note) {
        if (order.getPaymentStatusEnum() != OrderPaymentStatus.DEPOSIT_PAID) {
            throw new BusinessException("Chỉ đơn đã đặt cọc mới được giải ngân");
        }
        order.setPaymentStatus(OrderPaymentStatus.RELEASED);
        order.setDepositReleasedAt(LocalDateTime.now());
        order.setDepositReleasedByUserId(releasedByUserId);
        order.setDepositReleaseNote(note != null && !note.isBlank() ? note.trim() : "Deposit released after retailer delivery confirmation");
    }

    private void appendHistory(Long orderId, String previousStatus, String newStatus, String reason) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrderId(orderId);
        history.setPreviousStatus(previousStatus == null ? "CREATED" : previousStatus);
        history.setNewStatus(newStatus);
        history.setReason(reason);
        statusHistoryRepository.save(history);
    }

    private Order getOrderForInternalFlow(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + orderId));
    }

    private void notifyOrderStatusChange(Order order, String status, String reason) {
        CreateNotificationRequest notification = new CreateNotificationRequest();
        notification.setRecipientRole("ADMIN");
        notification.setTitle("Cập nhật đơn hàng #" + order.getOrderId());
        notification.setMessage("Đơn hàng chuyển sang trạng thái " + status + (reason != null && !reason.isBlank() ? ": " + reason : ""));
        notification.setNotificationType("ORDER_STATUS");
        notification.setTargetType("ORDER");
        notification.setTargetId(order.getOrderId());
        notificationService.create(notification);
    }

    private void assertCanChangeStatus(Order order, Long currentUserId, OrderStatus newStatus) {
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId).orElse(null);
        Farm farm = farmRepository.findByOwnerUserUserId(currentUserId).orElse(null);

        if (newStatus == OrderStatus.CONFIRMED) {
            if (farm == null || !farm.getFarmId().equals(order.getFarmId())) {
                throw new BusinessException("Chỉ farm sở hữu đơn hàng mới được xác nhận đơn");
            }
            return;
        }

        if (newStatus == OrderStatus.SHIPPING || newStatus == OrderStatus.DELIVERED) {
            if (!hasAnyRole("SHIPPING_MANAGER", "DRIVER")) {
                throw new BusinessException("Chỉ logistics mới được cập nhật trạng thái vận chuyển");
            }
            return;
        }

        if (newStatus == OrderStatus.CANCELLED) {
            if (retailer == null || !retailer.getRetailerId().equals(order.getRetailerId())) {
                throw new BusinessException("Chỉ retailer sở hữu đơn hàng mới được hủy đơn");
            }
            return;
        }

        if (newStatus == OrderStatus.COMPLETED) {
            if (retailer == null || !retailer.getRetailerId().equals(order.getRetailerId())) {
                throw new BusinessException("Chỉ retailer sở hữu đơn hàng mới được hoàn tất đơn");
            }
            if (order.getDeliveryProofImageUrl() == null || order.getDeliveryProofImageUrl().isBlank()) {
                throw new BusinessException("Phải có proof giao hàng trước khi hoàn tất đơn");
            }
        }
    }

    private void assertCanUploadShippingProof(Long currentUserId) {
        if (!hasAnyRole("SHIPPING_MANAGER", "DRIVER")) {
            throw new BusinessException("Chỉ logistics mới được upload proof vận chuyển");
        }
    }

    private void assertCanViewOrder(Order order, Long currentUserId) {
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId).orElse(null);
        if (retailer != null && order.getRetailerId().equals(retailer.getRetailerId())) {
            return;
        }

        Farm farm = farmRepository.findByOwnerUserUserId(currentUserId).orElse(null);
        if (farm != null && order.getFarmId().equals(farm.getFarmId())) {
            return;
        }

        if (hasAnyRole("SHIPPING_MANAGER", "DRIVER", "ADMIN")) {
            return;
        }

        throw new BusinessException("Bạn không có quyền xem đơn hàng này");
    }

    private boolean hasAnyRole(String... roles) {
        return SecurityUtils.getCurrentUser().getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .anyMatch(authority -> {
                    for (String role : roles) {
                        if (("ROLE_" + role).equals(authority)) {
                            return true;
                        }
                    }
                    return false;
                });
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
