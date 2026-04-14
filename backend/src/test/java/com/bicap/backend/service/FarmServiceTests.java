package com.bicap.backend.service;

import com.bicap.modules.farm.dto.CreateFarmRequest;
import com.bicap.modules.farm.dto.FarmResponse;
import com.bicap.modules.farm.dto.UpdateFarmRequest;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.user.entity.User;
import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
import com.bicap.core.AuditLogService;
import com.bicap.modules.farm.service.FarmService;
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
class FarmServiceTests {

    @Mock
    private FarmRepository farmRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserService userService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private FarmService farmService;

    private User farmUser;
    private User adminUser;
    private Farm farm;

    @BeforeEach
    void setUp() {
        farmUser = new User();
        farmUser.setUserId(2L);
        farmUser.setFullName("Farm Owner");

        adminUser = new User();
        adminUser.setUserId(1L);
        adminUser.setFullName("Admin User");

        farm = new Farm();
        farm.setFarmId(10L);
        farm.setFarmCode("FARM-01");
        farm.setFarmName("Farm A");
        farm.setBusinessLicenseNo("BLN-01");
        farm.setOwnerUser(farmUser);
        farm.setApprovalStatus("PENDING");
        farm.setCertificationStatus("PENDING");
    }

    @Test
    void createFarm_shouldThrowWhenCurrentUserIsNotFarmRole() {
        CreateFarmRequest request = new CreateFarmRequest();
        request.setFarmCode("FARM-NEW");
        request.setFarmName("Farm New");
        request.setBusinessLicenseNo("BLN-NEW");

        when(userRepository.findById(2L)).thenReturn(Optional.of(farmUser));
        when(userService.hasRole(farmUser, RoleName.FARM)).thenReturn(false);

        assertThrows(BusinessException.class, () -> farmService.createFarm(request, 2L));
    }

    @Test
    void createFarm_shouldCreatePendingFarmSuccessfully() {
        CreateFarmRequest request = new CreateFarmRequest();
        request.setFarmCode("FARM-NEW");
        request.setFarmName("Farm New");
        request.setBusinessLicenseNo("BLN-NEW");
        request.setAddress("Thu Duc");
        request.setProvince("HCM");
        request.setDescription("Test farm");

        when(userRepository.findById(2L)).thenReturn(Optional.of(farmUser));
        when(userService.hasRole(farmUser, RoleName.FARM)).thenReturn(true);
        when(farmRepository.findByOwnerUserUserId(2L)).thenReturn(Optional.empty());
        when(farmRepository.existsByFarmCode("FARM-NEW")).thenReturn(false);
        when(farmRepository.existsByBusinessLicenseNo("BLN-NEW")).thenReturn(false);
        when(farmRepository.save(any(Farm.class))).thenAnswer(invocation -> {
            Farm saved = invocation.getArgument(0);
            saved.setFarmId(11L);
            return saved;
        });

        FarmResponse response = farmService.createFarm(request, 2L);

        assertNotNull(response);
        assertEquals("PENDING", response.getApprovalStatus());
        assertEquals("PENDING", response.getCertificationStatus());
        verify(auditLogService).log(2L, "CREATE_FARM", "FARM", 11L);
    }

    @Test
    void updateFarm_shouldThrowWhenCurrentUserIsNotOwnerOrAdmin() {
        UpdateFarmRequest request = new UpdateFarmRequest();
        request.setFarmName("Updated Farm");
        request.setBusinessLicenseNo("BLN-01");

        User anotherUser = new User();
        anotherUser.setUserId(9L);

        when(farmRepository.findById(10L)).thenReturn(Optional.of(farm));
        when(userRepository.findById(9L)).thenReturn(Optional.of(anotherUser));
        when(userService.hasRole(anotherUser, RoleName.ADMIN)).thenReturn(false);

        assertThrows(BusinessException.class, () -> farmService.updateFarm(10L, request, 9L));
    }

    @Test
    void changeApprovalStatus_shouldRequireAdminRole() {
        when(farmRepository.findById(10L)).thenReturn(Optional.of(farm));
        when(userRepository.findById(2L)).thenReturn(Optional.of(farmUser));
        when(userService.hasRole(farmUser, RoleName.ADMIN)).thenReturn(false);

        assertThrows(BusinessException.class, () -> farmService.changeApprovalStatus(10L, "APPROVED", 2L));
    }

    @Test
    void changeApprovalStatus_shouldUpdateFarmWhenAdmin() {
        when(farmRepository.findById(10L)).thenReturn(Optional.of(farm));
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userService.hasRole(adminUser, RoleName.ADMIN)).thenReturn(true);
        when(farmRepository.save(any(Farm.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FarmResponse response = farmService.changeApprovalStatus(10L, "APPROVED", 1L);

        assertEquals("APPROVED", response.getApprovalStatus());
        verify(auditLogService).log(1L, "CHANGE_APPROVAL_STATUS", "FARM", 10L);
    }
}
