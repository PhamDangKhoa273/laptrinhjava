package com.bicap.modules.retailer.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.modules.retailer.entity.Retailer;
import com.bicap.modules.retailer.repository.RetailerRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
import com.bicap.core.AuditLogService;
import com.bicap.modules.media.service.MediaStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RetailerServiceAuthorizationTests {

    @Mock RetailerRepository retailerRepository;
    @Mock UserRepository userRepository;
    @Mock UserService userService;
    @Mock AuditLogService auditLogService;
    @Mock MediaStorageService mediaStorageService;

    @InjectMocks RetailerService service;

    @Test
    void getById_shouldRejectOtherUser() {
        User current = new User();
        current.setUserId(1L);
        User owner = new User();
        owner.setUserId(2L);
        Retailer retailer = new Retailer();
        retailer.setRetailerId(7L);
        retailer.setUser(owner);

        when(retailerRepository.findById(7L)).thenReturn(Optional.of(retailer));
        when(userRepository.findById(1L)).thenReturn(Optional.of(current));
        when(userService.hasRole(current, com.bicap.core.enums.RoleName.ADMIN)).thenReturn(false);

        assertThatThrownBy(() -> service.getById(7L, 1L)).isInstanceOf(BusinessException.class);
    }
}
