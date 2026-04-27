package com.bicap.modules.common.notification.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.modules.common.notification.entity.Notification;
import com.bicap.modules.common.notification.repository.NotificationRepository;
import com.bicap.modules.contract.repository.FarmRetailerContractRepository;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.order.repository.OrderRepository;
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
class NotificationServiceAuthorizationTests {

    @Mock NotificationRepository notificationRepository;
    @Mock UserRepository userRepository;
    @Mock FarmRepository farmRepository;
    @Mock RetailerRepository retailerRepository;
    @Mock OrderRepository orderRepository;
    @Mock FarmRetailerContractRepository contractRepository;

    @InjectMocks NotificationService service;

    @Test
    void markAsRead_shouldRejectNotificationOwnedByOtherUser() {
        User current = user(1L, "GUEST");
        User other = user(2L, "GUEST");
        Notification notification = new Notification();
        notification.setNotificationId(9L);
        notification.setRecipientUser(other);
        notification.setRead(false);

        when(userRepository.findById(1L)).thenReturn(Optional.of(current));
        when(notificationRepository.findById(9L)).thenReturn(Optional.of(notification));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(1L);
            assertThatThrownBy(() -> service.markAsRead(9L)).isInstanceOf(BusinessException.class);
        }
    }

    @Test
    void markAsRead_shouldAllowRoleScopedNotification() {
        User current = user(1L, "ADMIN");
        Notification notification = new Notification();
        notification.setNotificationId(9L);
        notification.setRecipientRole("ADMIN");
        notification.setRead(false);

        when(userRepository.findById(1L)).thenReturn(Optional.of(current));
        when(notificationRepository.findById(9L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(1L);
            var response = service.markAsRead(9L);
            org.assertj.core.api.Assertions.assertThat(response.isRead()).isTrue();
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
