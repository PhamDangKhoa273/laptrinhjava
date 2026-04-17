package com.bicap.backend.service;

import com.bicap.core.exception.BusinessException;
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
import com.bicap.modules.order.dto.OrderDepositRequest;
import com.bicap.modules.order.dto.OrderItemRequest;
import com.bicap.modules.order.dto.OrderResponse;
import com.bicap.modules.order.dto.UpdateOrderStatusRequest;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.order.repository.OrderStatusHistoryRepository;
import com.bicap.modules.order.service.OrderService;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTests {

    @Mock private OrderRepository orderRepository;
    @Mock private RetailerRepository retailerRepository;
    @Mock private ProductListingRepository listingRepository;
    @Mock private OrderStatusHistoryRepository statusHistoryRepository;
    @Mock private BlockchainService blockchainService;
    @Mock private FarmRepository farmRepository;
    @Mock private NotificationService notificationService;
    @Mock private MediaStorageService mediaStorageService;

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
        order.setStatus("PENDING");
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
    void payDeposit_shouldUpdatePaymentStatus() {
        when(retailerRepository.findByUserUserId(123L)).thenReturn(Optional.of(retailer));
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderDepositRequest request = new OrderDepositRequest();
        request.setAmount(BigDecimal.valueOf(300));
        request.setMethod("bank_transfer");
        request.setTransactionRef("DEP-002");

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(123L);
            OrderResponse response = orderService.payDeposit(7L, request);
            assertEquals("DEPOSIT_PAID", response.getPaymentStatus());
            assertEquals(BigDecimal.valueOf(300), response.getDepositAmount());
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
    void createOrder_shouldInitializePaymentStatusAsUnpaid() {
        when(retailerRepository.findByUserUserId(123L)).thenReturn(Optional.of(retailer));
        when(listingRepository.findById(50L)).thenReturn(Optional.of(listing));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order saved = invocation.getArgument(0);
            saved.setOrderId(7L);
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
        order.setStatus("SHIPPING");
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
    void confirmDelivery_shouldReleaseDepositWhenCompleted() {
        order.setStatus("DELIVERED");
        order.setShippingProofImageUrl("https://example.com/shipping.jpg");
        order.setPaymentStatus("DEPOSIT_PAID");
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
        when(retailerRepository.findByUserUserId(123L)).thenReturn(Optional.of(retailer));
        when(orderRepository.findById(7L)).thenReturn(Optional.of(order));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(123L);
            assertThrows(BusinessException.class, () -> orderService.uploadDeliveryProofFile(7L, null));
        }
    }

    @Test
    void payDeposit_shouldRequireMethodAndTransactionReference() {
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
    }
}
