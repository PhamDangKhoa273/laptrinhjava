package com.bicap.modules.farm.service;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
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
        SecurityContextHolder.clearContext();
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

        assertThrows(BusinessException.class, () -> farmService.changeApprovalStatus(10L, "APPROVED", null, 2L));
    }

    @Test
    void changeApprovalStatus_shouldRequireCommentWhenRejecting() {
        when(farmRepository.findById(10L)).thenReturn(Optional.of(farm));
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userService.hasRole(adminUser, RoleName.ADMIN)).thenReturn(true);

        assertThrows(BusinessException.class, () -> farmService.changeApprovalStatus(10L, "REJECTED", "", 1L));
    }

    @Test
    void changeApprovalStatus_shouldUpdateFarmWhenAdmin() {
        when(farmRepository.findById(10L)).thenReturn(Optional.of(farm));
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userService.hasRole(adminUser, RoleName.ADMIN)).thenReturn(true);
        when(farmRepository.save(any(Farm.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FarmResponse response = farmService.changeApprovalStatus(10L, "APPROVED", "Đủ điều kiện", 1L);

        assertEquals("APPROVED", response.getApprovalStatus());
        assertEquals("VALID", response.getCertificationStatus());
        verify(auditLogService).log(1L, "CHANGE_APPROVAL_STATUS", "FARM", 10L);
    }

    @Test
    void getFarmById_shouldRejectPendingFarmForUnrelatedUser() {
        User stranger = new User();
        stranger.setUserId(9L);
        when(farmRepository.findById(10L)).thenReturn(Optional.of(farm));
        when(userRepository.findById(9L)).thenReturn(Optional.of(stranger));
        when(userService.hasRole(stranger, RoleName.ADMIN)).thenReturn(false);
        setPrincipal(9L, "ROLE_RETAILER");

        assertThrows(BusinessException.class, () -> farmService.getFarmById(10L));
    }

    @Test
    void getFarmById_shouldAllowOwnerToReadOwnPendingFarm() {
        when(farmRepository.findById(10L)).thenReturn(Optional.of(farm));
        when(userRepository.findById(2L)).thenReturn(Optional.of(farmUser));
        when(userService.hasRole(farmUser, RoleName.ADMIN)).thenReturn(false);
        setPrincipal(2L, "ROLE_FARM");

        FarmResponse response = farmService.getFarmById(10L);

        assertEquals(10L, response.getFarmId());
    }

    @Test
    void getAllFarms_shouldHidePendingUnownedFarmFromNonAdmin() {
        Farm approvedFarm = new Farm();
        approvedFarm.setFarmId(11L);
        approvedFarm.setFarmCode("FARM-APPROVED");
        approvedFarm.setFarmName("Approved Farm");
        approvedFarm.setBusinessLicenseNo("BLN-APPROVED");
        approvedFarm.setApprovalStatus("APPROVED");
        approvedFarm.setCertificationStatus("VALID");
        User stranger = new User();
        stranger.setUserId(9L);
        when(farmRepository.findAll()).thenReturn(List.of(farm, approvedFarm));
        when(userRepository.findById(9L)).thenReturn(Optional.of(stranger));
        when(userService.hasRole(stranger, RoleName.ADMIN)).thenReturn(false);
        setPrincipal(9L, "ROLE_RETAILER");

        List<FarmResponse> responses = farmService.getAllFarms();

        assertEquals(1, responses.size());
        assertEquals(11L, responses.get(0).getFarmId());
    }

    private void setPrincipal(Long userId, String role) {
        var principal = new com.bicap.core.security.CustomUserPrincipal(
                userId,
                "user" + userId + "@example.com",
                "N/A",
                "User " + userId,
                List.of(new SimpleGrantedAuthority(role)));
        var authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
