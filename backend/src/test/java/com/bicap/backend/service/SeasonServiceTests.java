package com.bicap.backend.service;

import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.batch.dto.SeasonBlockchainPayload;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.product.repository.ProductRepository;
import com.bicap.modules.season.dto.CreateSeasonRequest;
import com.bicap.modules.season.dto.SeasonResponse;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.season.repository.FarmingSeasonRepository;
import com.bicap.modules.season.service.SeasonService;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class SeasonServiceTests {

    @Mock
    private FarmingSeasonRepository farmingSeasonRepository;
    @Mock
    private FarmRepository farmRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserService userService;
    @Mock
    private BlockchainService blockchainService;

    @InjectMocks
    private SeasonService seasonService;

    private Farm approvedFarm;
    private Product product;
    private User owner;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setUserId(2L);
        owner.setFullName("Farm Owner");

        approvedFarm = new Farm();
        approvedFarm.setFarmId(10L);
        approvedFarm.setFarmCode("FARM-01");
        approvedFarm.setFarmName("Farm Approved");
        approvedFarm.setApprovalStatus("APPROVED");
        approvedFarm.setOwnerUser(owner);

        product = new Product();
        product.setProductId(20L);
        product.setProductCode("PROD-01");
        product.setProductName("Pepper");
    }

    @Test
    void createSeason_shouldRejectUnapprovedFarm() {
        CreateSeasonRequest request = new CreateSeasonRequest();
        request.setFarmId(10L);
        request.setProductId(20L);
        request.setSeasonCode("SEASON-01");
        request.setStartDate(LocalDate.of(2026, 4, 1));
        request.setExpectedHarvestDate(LocalDate.of(2026, 5, 1));

        approvedFarm.setApprovalStatus("PENDING");
        when(farmRepository.findById(10L)).thenReturn(Optional.of(approvedFarm));

        assertThrows(BusinessException.class, () -> seasonService.createSeason(request, 2L));
    }

    @Test
    void createSeason_shouldRejectInvalidDates() {
        CreateSeasonRequest request = new CreateSeasonRequest();
        request.setFarmId(10L);
        request.setProductId(20L);
        request.setSeasonCode("SEASON-01");
        request.setStartDate(LocalDate.of(2026, 5, 1));
        request.setExpectedHarvestDate(LocalDate.of(2026, 4, 1));

        when(farmRepository.findById(10L)).thenReturn(Optional.of(approvedFarm));

        assertThrows(BusinessException.class, () -> seasonService.createSeason(request, 2L));
    }

    @Test
    void createSeason_shouldPersistAndSendBlockchainPayload() {
        CreateSeasonRequest request = new CreateSeasonRequest();
        request.setFarmId(10L);
        request.setProductId(20L);
        request.setSeasonCode("SEASON-01");
        request.setStartDate(LocalDate.of(2026, 4, 1));
        request.setExpectedHarvestDate(LocalDate.of(2026, 5, 1));
        request.setFarmingMethod("Organic");

        when(farmRepository.findById(10L)).thenReturn(Optional.of(approvedFarm));
        when(productRepository.findById(20L)).thenReturn(Optional.of(product));
        when(farmingSeasonRepository.findBySeasonCode("SEASON-01")).thenReturn(Optional.empty());
        when(farmingSeasonRepository.save(any(FarmingSeason.class))).thenAnswer(invocation -> {
            FarmingSeason season = invocation.getArgument(0);
            season.setSeasonId(99L);
            return season;
        });

        SeasonResponse response = seasonService.createSeason(request, 2L);

        assertNotNull(response);
        assertEquals("SEASON-01", response.getSeasonCode());
        ArgumentCaptor<SeasonBlockchainPayload> captor = ArgumentCaptor.forClass(SeasonBlockchainPayload.class);
        verify(blockchainService).saveSeason(captor.capture());
        assertEquals(99L, captor.getValue().getSeasonId());
        assertEquals("Organic", captor.getValue().getFarmingMethod());
    }

    @Test
    void findSeasonAndCheckPermission_shouldAllowAdmin() {
        User admin = new User();
        admin.setUserId(1L);

        FarmingSeason season = new FarmingSeason();
        season.setSeasonId(99L);
        season.setFarm(approvedFarm);

        when(farmingSeasonRepository.findById(99L)).thenReturn(Optional.of(season));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userService.hasRole(admin, RoleName.ADMIN)).thenReturn(true);

        FarmingSeason result = seasonService.findSeasonAndCheckPermission(99L, 1L);
        assertEquals(99L, result.getSeasonId());
    }
}
