package com.bicap.modules.order.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.MetricsSecurityEvents;
import com.bicap.core.security.CustomUserPrincipal;
import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.listing.repository.ProductListingRepository;
import com.bicap.modules.common.notification.service.NotificationService;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.media.service.MediaStorageService;
import com.bicap.modules.order.dto.ConfirmDeliveryRequest;
import com.bicap.modules.order.dto.CreateOrderRequest;
import com.bicap.modules.order.dto.DeliveryProofRequest;
import com.bicap.modules.order.dto.OrderDepositCallbackRequest;
import com.bicap.modules.order.dto.OrderDepositRequest;
import com.bicap.modules.order.dto.OrderItemRequest;
import com.bicap.modules.order.dto.OrderResponse;
import com.bicap.modules.order.dto.UpdateOrderStatusRequest;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.entity.OrderStatusHistory;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.order.repository.OrderStatusHistoryRepository;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.retailer.entity.Retailer;
import com.bicap.modules.retailer.repository.RetailerRepository;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.user.entity.User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTests {

    @Mock private OrderRepository orderRepository;
    @Mock private RetailerRepository retailerRepository;
    @Mock private ProductListingRepository listingRepository;
    @Mock private OrderStatusHistoryRepository statusHistoryRepository;
    @Mock private BlockchainService blockchainService;
    @Mock private FarmRepository farmRepository;
    @Mock private com.bicap.modules.shipment.repository.ShipmentRepository shipmentRepository;
    @Mock private NotificationService notificationService;
    @Mock private MediaStorageService mediaStorageService;
    @Mock private MetricsSecurityEvents metrics;

    @InjectMocks
    private OrderService orderService;

    private Retailer retailer;
    private ProductListing listing;
    private Order order;

    @BeforeEach
    void setUp() {
        User owner = new User();
        owner.setUserId(99L);

        Farm farm = new Farm();
        farm.setFarmId(10L);
        farm.setOwnerUser(owner);

        Product product = new Product();
        product.setProductId(20L);
        product.setProductName("Organic Rice");

        FarmingSeason season = new FarmingSeason();
        season.setSeasonId(30L);
        season.setFarm(farm);
        season.setProduct(product);

        ProductBatch batch = new ProductBatch();
        batch.setBatchId(40L);
        batch.setSeason(season);
        batch.setProduct(product);

        listing = new ProductListing();
        listing.setListingId(50L);
        listing.setBatch(batch);
        listing.setStatus("ACTIVE");
        listing.setApprovalStatus("APPROVED");
        listing.setPrice(BigDecimal.valueOf(100));
        listing.setQuantityAvailable(BigDecimal.valueOf(20));
        listing.setTitle("Organic Rice Listing");

        retailer = new Retailer();
        retailer.setRetailerId(1L);

        order = new Order();
        order.setOrderId(7L);
        order.setRetailerId(1L);
        order.setFarmId(10L);
        order.setTotalAmount(BigDecimal.valueOf(1000));
        order.setStatus("CONFIRMED");
        order.setPaymentStatus("UNPAID");
    }

    @Test
    void payDeposit_shouldRequireMinimumThirtyPercent() {
        when(retailerRepository.findByUserUserId(123L)).thenReturn(Optional.of(retailer));
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));

        OrderDepositRequest request = new OrderDepositRequest();
        request.setAmount(BigDecimal.valueOf(200));
        request.setMethod("bank_transfer");
        request.setTransactionRef("DEP-001");

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(123L);
            assertThrows(BusinessException.class, () -> orderService.payDeposit(7L, request));
        }
    }

    @Test
    void payDeposit_shouldNotMarkDepositPaidWithoutGatewayCallback() {
        when(retailerRepository.findByUserUserId(123L)).thenReturn(Optional.of(retailer));
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));

        OrderDepositRequest request = new OrderDepositRequest();
        request.setAmount(BigDecimal.valueOf(300));
        request.setMethod("bank_transfer");
        request.setTransactionRef("DEP-002");

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(123L);
            OrderResponse response = orderService.payDeposit(7L, request);
            assertEquals("UNPAID", response.getPaymentStatus());
            assertEquals("CONFIRMED", response.getStatus());
            verify(orderRepository, never()).save(any(Order.class));
        }
    }

    @Test
    void updateOrderStatus_shouldBlockConfirmWhenNoDeposit() {
        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest();
        request.setStatus("CONFIRMED");

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(999L);
            assertThrows(BusinessException.class, () -> orderService.updateOrderStatus(7L, request));
        }
    }

    @Test
    void createOrder_shouldInitializePaymentStatusAsUnpaidAndMapItems() {
        when(retailerRepository.findByUserUserId(123L)).thenReturn(Optional.of(retailer));
        listing.getBatch().setBatchCode("BATCH-RICE-001");
        when(listingRepository.findById(50L)).thenReturn(Optional.of(listing));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order saved = invocation.getArgument(0);
            saved.setOrderId(7L);
            saved.getOrderItems().forEach(orderItem -> orderItem.setOrder(saved));
            return saved;
        });

        CreateOrderRequest request = new CreateOrderRequest();
        OrderItemRequest item = new OrderItemRequest();
        item.setListingId(50L);
        item.setQuantity(BigDecimal.valueOf(2));
        request.setItems(List.of(item));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(123L);
            OrderResponse response = orderService.createOrder(request);
            assertEquals("UNPAID", response.getPaymentStatus());
            assertEquals(1, response.getItems().size());
            OrderItemResponseAssert.assertMapped(response.getItems().get(0));
            verify(statusHistoryRepository).save(any(OrderStatusHistory.class));
        }
    }

    private static class OrderItemResponseAssert {
        static void assertMapped(com.bicap.modules.order.dto.OrderItemResponse item) {
            assertEquals(50L, item.getListingId());
            assertEquals("Organic Rice Listing", item.getTitle());
            assertEquals("BATCH-RICE-001", item.getBatchCode());
            assertEquals(0, BigDecimal.valueOf(2).compareTo(item.getQuantity()));
            assertEquals(0, BigDecimal.valueOf(100).compareTo(item.getPrice()));
            assertEquals(0, BigDecimal.valueOf(200).setScale(2).compareTo(item.getSubTotal()));
        }
    }

    @Test
    void createOrder_shouldRejectListingWhenNotApproved() {
        listing.setApprovalStatus("PENDING");
        when(retailerRepository.findByUserUserId(123L)).thenReturn(Optional.of(retailer));
        when(listingRepository.findById(50L)).thenReturn(Optional.of(listing));

        CreateOrderRequest request = new CreateOrderRequest();
        OrderItemRequest item = new OrderItemRequest();
        item.setListingId(50L);
        item.setQuantity(BigDecimal.ONE);
        request.setItems(List.of(item));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(123L);
            assertThrows(BusinessException.class, () -> orderService.createOrder(request));
        }
    }

    @Test
    void verifyDepositGatewayCallback_shouldMarkDepositPaidForValidSignature() {
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));
        when(statusHistoryRepository.findByOrderIdOrderByChangedAtDesc(7L)).thenReturn(List.of());
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        setOrderDepositGatewaySecret("test-secret");

        OrderDepositCallbackRequest request = validDepositCallback("GW-003", BigDecimal.valueOf(400));

        OrderResponse response = orderService.verifyDepositGatewayCallback(request);

        assertEquals("DEPOSIT_PAID", response.getPaymentStatus());
        assertEquals("READY_FOR_SHIPMENT", response.getStatus());
        assertEquals(BigDecimal.valueOf(400), response.getDepositAmount());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void getOrders_shouldReturnFarmScopedOrdersForFarmOwner() {
        Farm farm = new Farm();
        farm.setFarmId(10L);
        when(farmRepository.findByOwnerUserUserId(99L)).thenReturn(Optional.of(farm));
        when(orderRepository.findByFarmId(10L)).thenReturn(List.of(order));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(99L);
            List<OrderResponse> responses = orderService.getOrders();
            assertEquals(1, responses.size());
            assertEquals(7L, responses.get(0).getOrderId());
        }
    }

    @Test
    void getOrderById_shouldRejectRetailerWithoutOwnership() {
        Retailer otherRetailer = new Retailer();
        otherRetailer.setRetailerId(999L);
        when(retailerRepository.findByUserUserId(123L)).thenReturn(Optional.of(otherRetailer));
        when(farmRepository.findByOwnerUserUserId(123L)).thenReturn(Optional.empty());
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(123L);
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUser).thenThrow(new BusinessException("Không xác định được người dùng hiện tại"));
            assertThrows(BusinessException.class, () -> orderService.getOrderById(7L));
        }
    }

    @Test
    void updateOrderStatus_shouldBlockShippingWhenDepositNotPaid() {
        order.setStatus("CONFIRMED");
        order.setPaymentStatus("UNPAID");
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));

        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest();
        request.setStatus("SHIPPING");

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            mockLogistics(security, 555L, "ROLE_SHIPPING_MANAGER");
            assertThrows(BusinessException.class, () -> orderService.updateOrderStatus(7L, request));
        }
    }

    @Test
    void uploadShippingProof_shouldRequireNonBlankImageUrl() {
        order.setStatus("DELIVERED");
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));

        DeliveryProofRequest request = new DeliveryProofRequest();
        request.setImageUrl("   ");
        request.setNote("proof");

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            mockLogistics(security, 555L, "ROLE_SHIPPING_MANAGER");
            assertThrows(BusinessException.class, () -> orderService.uploadShippingProof(7L, request));
        }
    }

    @Test
    void confirmDelivery_shouldRequireProofImageUrl() {
        order.setStatus("DELIVERED");
        order.setShippingProofImageUrl("https://example.com/shipping.jpg");
        when(retailerRepository.findByUserUserId(123L)).thenReturn(Optional.of(retailer));
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));

        ConfirmDeliveryRequest request = new ConfirmDeliveryRequest();
        request.setProofImageUrl("   ");
        request.setNote("done");

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(123L);
            assertThrows(BusinessException.class, () -> orderService.confirmDelivery(7L, request));
        }
    }

    @Test
    void confirmDelivery_shouldMarkDeliveredButNotReleaseDeposit() {
        order.setStatus("DELIVERED");
        order.setShippingProofImageUrl("https://example.com/shipping.jpg");
        order.setPaymentStatus("DEPOSIT_PAID");
        order.setStatus("DELIVERED");
        order.setDepositReleasedAt(null);
        order.setDepositAmount(BigDecimal.valueOf(300));
        when(retailerRepository.findByUserUserId(123L)).thenReturn(Optional.of(retailer));
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ConfirmDeliveryRequest request = new ConfirmDeliveryRequest();
        request.setProofImageUrl("https://example.com/delivery.jpg");
        request.setNote("Retailer accepted goods");

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(123L);
            OrderResponse response = orderService.confirmDelivery(7L, request);
            assertEquals("DELIVERED", response.getStatus());
            assertEquals("DEPOSIT_PAID", response.getPaymentStatus());
        }
    }

    @Test
    void settleAfterDeliveryWindow_shouldReleaseDepositAndCompleteOrder() {
        order.setStatus("DELIVERED");
        order.setPaymentStatus("DEPOSIT_PAID");
        order.setShippingProofImageUrl("https://example.com/shipping.jpg");
        order.setDeliveryProofImageUrl("https://example.com/delivery.jpg");
        order.setDepositAmount(BigDecimal.valueOf(300));
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(888L);
            OrderResponse response = orderService.settleAfterDeliveryWindow(7L, false, "No dispute");
            assertEquals("COMPLETED", response.getStatus());
            assertEquals("RELEASED", response.getPaymentStatus());
        }
    }

    @Test
    void getOrderStatusHistory_shouldAllowDriverRoleVisibility() {
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));
        when(statusHistoryRepository.findByOrderIdOrderByChangedAtDesc(7L)).thenReturn(List.of());

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            mockLogistics(security, 555L, "ROLE_DRIVER");
            assertEquals(0, orderService.getOrderStatusHistory(7L).size());
        }
    }

    @Test
    void uploadDeliveryProofFile_shouldRequireDeliveredStatusAndShippingProof() {
        order.setStatus("SHIPPING");
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(123L);
            assertThrows(BusinessException.class, () -> orderService.uploadDeliveryProofFile(7L, null));
        }
    }

    @Test
    void payDeposit_shouldRequireMethod() {
        when(retailerRepository.findByUserUserId(123L)).thenReturn(Optional.of(retailer));
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));

        OrderDepositRequest request = new OrderDepositRequest();
        request.setAmount(BigDecimal.valueOf(300));
        request.setMethod("   ");
        request.setTransactionRef("   ");

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(123L);
            assertThrows(BusinessException.class, () -> orderService.payDeposit(7L, request));
        }
    }

    @Test
    void verifyDepositGatewayCallback_shouldRejectInvalidSignature() {
        setOrderDepositGatewaySecret("test-secret");
        OrderDepositCallbackRequest request = validDepositCallback("GW-BAD", BigDecimal.valueOf(300));
        request.setSignature("invalid");

        assertThrows(BusinessException.class, () -> orderService.verifyDepositGatewayCallback(request));
    }

    @Test
    void verifyDepositGatewayCallback_shouldRejectUnderMinimumAmount() {
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));
        when(statusHistoryRepository.findByOrderIdOrderByChangedAtDesc(7L)).thenReturn(List.of());
        setOrderDepositGatewaySecret("test-secret");
        OrderDepositCallbackRequest request = validDepositCallback("GW-LOW", BigDecimal.valueOf(200));

        assertThrows(BusinessException.class, () -> orderService.verifyDepositGatewayCallback(request));
    }

    @Test
    void verifyDepositGatewayCallback_shouldBeIdempotentForDuplicateCallback() {
        order.setPaymentStatus("DEPOSIT_PAID");
        order.setStatus("READY_FOR_SHIPMENT");
        OrderStatusHistory history = new OrderStatusHistory();
        history.setIdempotencyKey("GATEWAY_DEPOSIT:GW-DUP");
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));
        when(statusHistoryRepository.findByOrderIdOrderByChangedAtDesc(7L)).thenReturn(List.of(history));
        setOrderDepositGatewaySecret("test-secret");
        OrderDepositCallbackRequest request = validDepositCallback("GW-DUP", BigDecimal.valueOf(300));

        OrderResponse response = orderService.verifyDepositGatewayCallback(request);

        assertEquals("DEPOSIT_PAID", response.getPaymentStatus());
        verify(orderRepository, never()).save(any(Order.class));
    }

    private void mockLogistics(MockedStatic<com.bicap.core.security.SecurityUtils> security, Long userId, String role) {
        CustomUserPrincipal principal = new CustomUserPrincipal(
                userId,
                "logistics@example.com",
                "secret",
                "Logistics User",
                List.of(new SimpleGrantedAuthority(role))
        );
        security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(userId);
        security.when(com.bicap.core.security.SecurityUtils::getCurrentUser).thenReturn(principal);
        security.when(() -> com.bicap.core.security.SecurityUtils.getCurrentUserOrNull()).thenReturn(principal);
    }

    private OrderDepositCallbackRequest validDepositCallback(String gatewayTransactionId, BigDecimal amount) {
        OrderDepositCallbackRequest request = new OrderDepositCallbackRequest();
        request.setOrderId(7L);
        request.setTransactionRef("DEP-003");
        request.setGatewayTransactionId(gatewayTransactionId);
        request.setAmount(amount);
        request.setCurrency("VND");
        request.setStatus("PAID");
        request.setSignature(signDepositCallback(request, "test-secret"));
        return request;
    }

    private String signDepositCallback(OrderDepositCallbackRequest request, String secret) {
        try {
            String payload = request.getOrderId() + "|" + request.getTransactionRef().trim() + "|" + request.getGatewayTransactionId().trim() + "|" + request.getAmount().toPlainString() + "|" + request.getCurrency().trim().toUpperCase() + "|" + request.getStatus().trim().toUpperCase();
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getEncoder().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    private void setOrderDepositGatewaySecret(String secret) {
        org.springframework.test.util.ReflectionTestUtils.setField(orderService, "orderDepositGatewaySecret", secret);
    }
}
