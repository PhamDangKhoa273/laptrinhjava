package com.bicap.modules.common.notification.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.modules.common.notification.dto.CreateNotificationRequest;
import com.bicap.modules.common.notification.entity.Notification;
import com.bicap.modules.common.notification.repository.NotificationRepository;
import com.bicap.modules.contract.repository.FarmRetailerContractRepository;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.retailer.entity.Retailer;
import com.bicap.modules.retailer.repository.RetailerRepository;
import com.bicap.modules.user.entity.Role;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Set;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceCreateAuthorizationTests {

    @Mock NotificationRepository notificationRepository;
    @Mock UserRepository userRepository;
    @Mock FarmRepository farmRepository;
    @Mock RetailerRepository retailerRepository;
    @Mock OrderRepository orderRepository;
    @Mock FarmRetailerContractRepository contractRepository;

    @Mock com.bicap.core.security.RedisRateLimitService rateLimitService;

    @InjectMocks NotificationService service;

    @Test
    void farmToRetailer_orderThread_shouldRequireMatchingRelation() {
        User farmUser = user(1L, "FARM");
        User retailerUser = user(2L, "RETAILER");
        User sender = farmUser;
        Order order = new Order();
        order.setOrderId(10L);
        order.setFarmId(100L);
        order.setRetailerId(200L);

        Farm farm = new Farm();
        farm.setFarmId(100L);
        farm.setOwnerUser(farmUser);
        Retailer retailer = new Retailer();
        retailer.setRetailerId(200L);
        retailer.setUser(retailerUser);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(farmRepository.findById(100L)).thenReturn(Optional.of(farm));
        when(retailerRepository.findById(200L)).thenReturn(Optional.of(retailer));
        when(userRepository.findById(2L)).thenReturn(Optional.of(retailerUser));
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        org.mockito.Mockito.lenient().doNothing().when(rateLimitService).checkPerUser(any());

        CreateNotificationRequest request = new CreateNotificationRequest();
        request.setTitle("Update");
        request.setMessage("msg");
        request.setNotificationType("ORDER");
        request.setTargetType("ORDER");
        request.setTargetId(10L);
        request.setRecipientUserId(2L);

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(1L);
            service.create(request);
        }
    }

    @Test
    void farmToOtherRetailer_orderThread_shouldRejectMismatch() {
        User farmUser = user(1L, "FARM");
        User retailerUser = user(2L, "RETAILER");
        User otherRetailer = user(3L, "RETAILER");
        Order order = new Order();
        order.setOrderId(10L);
        order.setFarmId(100L);
        order.setRetailerId(200L);

        Farm farm = new Farm();
        farm.setFarmId(100L);
        farm.setOwnerUser(farmUser);
        Retailer retailer = new Retailer();
        retailer.setRetailerId(200L);
        retailer.setUser(retailerUser);
        Retailer other = new Retailer();
        other.setRetailerId(300L);
        other.setUser(otherRetailer);

        when(userRepository.findById(1L)).thenReturn(Optional.of(farmUser));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(farmRepository.findById(100L)).thenReturn(Optional.of(farm));
        when(retailerRepository.findById(200L)).thenReturn(Optional.of(retailer));

        CreateNotificationRequest request = new CreateNotificationRequest();
        request.setTitle("Update");
        request.setMessage("msg");
        request.setNotificationType("ORDER");
        request.setTargetType("ORDER");
        request.setTargetId(10L);
        request.setRecipientUserId(3L);

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(1L);
            assertThatThrownBy(() -> service.create(request)).isInstanceOf(BusinessException.class);
        }
    }

    @Test
    void rateLimit_shouldRejectSpammySender() {
        User admin = user(1L, "ADMIN");
        Notification recent = new Notification();
        recent.setSenderUser(admin);
        recent.setCreatedAt(java.time.LocalDateTime.now().minusMinutes(1));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(notificationRepository.findAll()).thenReturn(java.util.Collections.nCopies(20, recent));
        org.mockito.Mockito.lenient().doNothing().when(rateLimitService).checkPerUser(any());

        CreateNotificationRequest request = new CreateNotificationRequest();
        request.setTitle("Pub");
        request.setMessage("msg");
        request.setNotificationType("SYSTEM");
        request.setRecipientRole("PUBLIC");

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(1L);
            assertThatThrownBy(() -> service.create(request)).isInstanceOf(BusinessException.class);
        }
    }

    private User user(Long id, String roleName) {
        User user = new User();
        user.setUserId(id);
        Role role = new Role();
        role.setRoleName(roleName);
        user.setRoles(Set.of(role));
        return user;
    }
}
