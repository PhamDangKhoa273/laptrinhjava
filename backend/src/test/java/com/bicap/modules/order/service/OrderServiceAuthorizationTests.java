package com.bicap.modules.order.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.common.notification.service.NotificationService;
import com.bicap.modules.contract.service.FarmRetailerContractService;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.listing.repository.ProductListingRepository;
import com.bicap.modules.media.service.MediaStorageService;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.order.repository.OrderStatusHistoryRepository;
import com.bicap.modules.retailer.entity.Retailer;
import com.bicap.modules.retailer.repository.RetailerRepository;
import com.bicap.modules.shipment.repository.ShipmentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceAuthorizationTests {

    @Mock OrderRepository orderRepository;
    @Mock RetailerRepository retailerRepository;
    @Mock FarmRepository farmRepository;
    @Mock ProductListingRepository listingRepository;
    @Mock OrderStatusHistoryRepository statusHistoryRepository;
    @Mock BlockchainService blockchainService;
    @Mock NotificationService notificationService;
    @Mock MediaStorageService mediaStorageService;
    @Mock ShipmentRepository shipmentRepository;
    @Mock FarmRetailerContractService contractService;
    @Mock com.bicap.core.AuditLogService auditLogService;

    @InjectMocks OrderService service;

    @Test
    void getOrderById_shouldRejectDifferentRetailer() {
        Order order = new Order();
        order.setOrderId(1L);
        order.setRetailerId(99L);
        order.setFarmId(10L);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        Retailer retailer = new Retailer();
        retailer.setRetailerId(1L);
        when(retailerRepository.findByUserUserId(1L)).thenReturn(Optional.of(retailer));
        when(farmRepository.findByOwnerUserUserId(1L)).thenReturn(Optional.empty());

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(1L);
            assertThatThrownBy(() -> service.getOrderById(1L)).isInstanceOf(BusinessException.class);
        }
    }
}
