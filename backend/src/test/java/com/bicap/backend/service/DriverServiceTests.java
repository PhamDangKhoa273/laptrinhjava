package com.bicap.backend.service;

import com.bicap.backend.dto.DriverResponse;
import com.bicap.backend.dto.UpdateDriverRequest;
import com.bicap.backend.entity.Driver;
import com.bicap.backend.entity.User;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.DriverRepository;
import com.bicap.backend.repository.UserRepository;
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
class DriverServiceTests {

    @Mock
    private DriverRepository driverRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserService userService;

    @InjectMocks
    private DriverService driverService;

    private Driver driver;
    private User manager;
    private User admin;

    @BeforeEach
    void setUp() {
        manager = new User();
        manager.setUserId(4L);
        manager.setFullName("Manager");

        admin = new User();
        admin.setUserId(1L);
        admin.setFullName("Admin");

        driver = new Driver();
        driver.setDriverId(20L);
        driver.setDriverCode("DRV-01");
        driver.setLicenseNo("LIC-01");
        driver.setStatus("ACTIVE");
        driver.setManagerUser(manager);
    }

    @Test
    void deactivate_shouldAllowManagerOwner() {
        when(driverRepository.findById(20L)).thenReturn(Optional.of(driver));
        when(userRepository.findById(4L)).thenReturn(Optional.of(manager));
        when(userService.hasRole(manager, RoleName.ADMIN)).thenReturn(false);
        when(driverRepository.save(any(Driver.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DriverResponse response = driverService.deactivate(20L, 4L);
        assertEquals("INACTIVE", response.getStatus());
    }

    @Test
    void deactivate_shouldRejectUnauthorizedUser() {
        User stranger = new User();
        stranger.setUserId(99L);

        when(driverRepository.findById(20L)).thenReturn(Optional.of(driver));
        when(userRepository.findById(99L)).thenReturn(Optional.of(stranger));
        when(userService.hasRole(stranger, RoleName.ADMIN)).thenReturn(false);

        assertThrows(BusinessException.class, () -> driverService.deactivate(20L, 99L));
    }

    @Test
    void update_shouldAllowAdmin() {
        UpdateDriverRequest request = new UpdateDriverRequest();
        request.setLicenseNo("LIC-NEW");
        request.setStatus("ACTIVE");

        when(driverRepository.findById(20L)).thenReturn(Optional.of(driver));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userService.hasRole(admin, RoleName.ADMIN)).thenReturn(true);
        when(driverRepository.existsByLicenseNo("LIC-NEW")).thenReturn(false);
        when(driverRepository.save(any(Driver.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DriverResponse response = driverService.update(20L, request, 1L);
        assertEquals("LIC-NEW", response.getLicenseNo());
    }
}
