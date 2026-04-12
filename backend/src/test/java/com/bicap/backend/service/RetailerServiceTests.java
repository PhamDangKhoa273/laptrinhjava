package com.bicap.backend.service;

import com.bicap.modules.retailer.dto.CreateRetailerRequest;
import com.bicap.modules.retailer.dto.RetailerResponse;
import com.bicap.modules.retailer.dto.UpdateRetailerRequest;
import com.bicap.modules.retailer.entity.Retailer;
import com.bicap.modules.user.entity.User;
import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.retailer.repository.RetailerRepository;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
import com.bicap.modules.retailer.service.RetailerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class RetailerServiceTests {

    @Mock
    private RetailerRepository retailerRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserService userService;

    @InjectMocks
    private RetailerService retailerService;

    private User retailerUser;
    private User adminUser;
    private Retailer retailer;

    @BeforeEach
    void setUp() {
        retailerUser = new User();
        retailerUser.setUserId(3L);
        retailerUser.setFullName("Retailer User");

        adminUser = new User();
        adminUser.setUserId(1L);
        adminUser.setFullName("Admin User");

        retailer = new Retailer();
        retailer.setRetailerId(10L);
        retailer.setRetailerCode("RET-01");
        retailer.setRetailerName("Retailer A");
        retailer.setBusinessLicenseNo("BLN-RET");
        retailer.setAddress("District 1");
        retailer.setStatus("ACTIVE");
        retailer.setUser(retailerUser);
    }

    @Test
    void create_shouldRequireRetailerRole() {
        CreateRetailerRequest request = new CreateRetailerRequest();
        request.setRetailerCode("RET-NEW");
        request.setRetailerName("Retailer New");
        request.setBusinessLicenseNo("BLN-NEW");
        request.setAddress("HCM");

        when(userRepository.findById(3L)).thenReturn(Optional.of(retailerUser));
        when(userService.hasRole(retailerUser, RoleName.RETAILER)).thenReturn(false);

        assertThrows(BusinessException.class, () -> retailerService.create(request, 3L));
    }

    @Test
    void deactivate_shouldSetInactiveForOwner() {
        when(retailerRepository.findById(10L)).thenReturn(Optional.of(retailer));
        when(userRepository.findById(3L)).thenReturn(Optional.of(retailerUser));
        when(userService.hasRole(retailerUser, RoleName.ADMIN)).thenReturn(false);
        when(retailerRepository.save(any(Retailer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RetailerResponse response = retailerService.deactivate(10L, 3L);

        assertEquals("INACTIVE", response.getStatus());
    }

    @Test
    void deactivate_shouldThrowWhenUnauthorized() {
        User stranger = new User();
        stranger.setUserId(99L);

        when(retailerRepository.findById(10L)).thenReturn(Optional.of(retailer));
        when(userRepository.findById(99L)).thenReturn(Optional.of(stranger));
        when(userService.hasRole(stranger, RoleName.ADMIN)).thenReturn(false);

        assertThrows(BusinessException.class, () -> retailerService.deactivate(10L, 99L));
    }

    @Test
    void update_shouldAllowAdmin() {
        UpdateRetailerRequest request = new UpdateRetailerRequest();
        request.setRetailerName("Retailer Updated");
        request.setBusinessLicenseNo("BLN-RET");
        request.setAddress("Thu Duc");
        request.setStatus("ACTIVE");

        when(retailerRepository.findById(10L)).thenReturn(Optional.of(retailer));
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userService.hasRole(adminUser, RoleName.ADMIN)).thenReturn(true);
        when(retailerRepository.save(any(Retailer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RetailerResponse response = retailerService.update(10L, request, 1L);
        assertEquals("Retailer Updated", response.getRetailerName());
    }
}
