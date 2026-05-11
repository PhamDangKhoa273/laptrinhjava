package com.bicap.modules.logistics.service;

import com.bicap.modules.logistics.dto.UpdateVehicleRequest;
import com.bicap.modules.logistics.dto.VehicleResponse;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.logistics.entity.Vehicle;
import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.logistics.repository.VehicleRepository;
import com.bicap.modules.user.service.UserService;
import com.bicap.core.AuditLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTests {

    @Mock
    private VehicleRepository vehicleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserService userService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle vehicle;
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

        vehicle = new Vehicle();
        vehicle.setVehicleId(30L);
        vehicle.setPlateNo("51A-12345");
        vehicle.setVehicleType("Truck");
        vehicle.setCapacity(1000);
        vehicle.setStatus("ACTIVE");
        vehicle.setManagerUser(manager);
    }

    @Test
    void deactivate_shouldAllowManagerOwner() {
        when(vehicleRepository.findById(30L)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VehicleResponse response = vehicleService.deactivate(30L, 4L);
        assertEquals("INACTIVE", response.getStatus());
        verify(auditLogService).log(4L, "DEACTIVATE_VEHICLE", "VEHICLE", 30L);
    }

    @Test
    void deactivate_shouldRejectUnauthorizedUser() {
        User stranger = new User();
        stranger.setUserId(99L);

        when(vehicleRepository.findById(30L)).thenReturn(Optional.of(vehicle));
        when(userRepository.findById(99L)).thenReturn(Optional.of(stranger));
        when(userService.hasRole(stranger, RoleName.ADMIN)).thenReturn(false);

        assertThrows(BusinessException.class, () -> vehicleService.deactivate(30L, 99L));
    }

    @Test
    void update_shouldAllowAdmin() {
        UpdateVehicleRequest request = new UpdateVehicleRequest();
        request.setVehicleType("Van");
        request.setCapacity(new BigDecimal("800"));
        request.setStatus("ACTIVE");

        when(vehicleRepository.findById(30L)).thenReturn(Optional.of(vehicle));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userService.hasRole(admin, RoleName.ADMIN)).thenReturn(true);
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VehicleResponse response = vehicleService.update(30L, request, 1L);
        assertEquals("Van", response.getVehicleType());
        verify(auditLogService).log(1L, "UPDATE_VEHICLE", "VEHICLE", 30L);
    }
}
