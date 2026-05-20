package com.bicap.backend.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.CustomUserPrincipal;
import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.iot.dto.CreateSensorReadingRequest;
import com.bicap.modules.iot.dto.SensorAlertResponse;
import com.bicap.modules.iot.entity.IoTAlert;
import com.bicap.modules.iot.entity.SensorReading;
import com.bicap.modules.iot.entity.ThresholdRule;
import com.bicap.modules.iot.repository.IoTAlertRepository;
import com.bicap.modules.iot.repository.SensorReadingRepository;
import com.bicap.modules.iot.repository.ThresholdRuleRepository;
import com.bicap.modules.iot.service.IoTService;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.user.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IoTServiceTests {

    @Mock private SensorReadingRepository sensorReadingRepository;
    @Mock private ThresholdRuleRepository thresholdRuleRepository;
    @Mock private IoTAlertRepository iotAlertRepository;
    @Mock private com.bicap.modules.season.repository.FarmingSeasonRepository farmingSeasonRepository;
    @Mock private com.bicap.modules.batch.repository.ProductBatchRepository productBatchRepository;
    @Mock private com.bicap.modules.common.notification.service.NotificationDispatcher notificationDispatcher;
    @Mock private AuditLogService auditLogService;
    @Mock private com.bicap.core.security.MetricsSecurityEvents metricsSecurityEvents;

    @InjectMocks
    private IoTService ioTService;

    @Test
    void ingest_shouldRejectHumidityOutOfRange() {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest();
        request.setBatchId(1L);
        request.setMetric("HUMIDITY");
        request.setValue(BigDecimal.valueOf(120));

        assertThrows(BusinessException.class, () -> ioTService.ingest(request));
    }

    @Test
    void ingest_shouldReturnAlertWhenThresholdExceeded() {
        // Build full graph: batch -> season -> farm -> ownerUser
        User owner = new User();
        owner.setUserId(99L);

        Farm farm = new Farm();
        farm.setFarmId(50L);
        farm.setFarmName("Farm A");
        farm.setOwnerUser(owner);

        FarmingSeason season = new FarmingSeason();
        season.setSeasonId(20L);
        season.setFarm(farm);

        ProductBatch batch = new ProductBatch();
        batch.setBatchId(1L);
        batch.setSeason(season);

        ThresholdRule tempRule = new ThresholdRule();
        tempRule.setMetric("TEMP");
        tempRule.setMinValue(BigDecimal.valueOf(10));
        tempRule.setMaxValue(BigDecimal.valueOf(35));
        tempRule.setEnabled(true);
        tempRule.setFarm(farm);

        when(productBatchRepository.findById(1L)).thenReturn(Optional.of(batch));
        when(sensorReadingRepository.save(any(SensorReading.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(thresholdRuleRepository.findByFarmFarmIdAndEnabledTrue(50L)).thenReturn(List.of(tempRule));
        when(iotAlertRepository.save(any(IoTAlert.class))).thenAnswer(invocation -> {
            IoTAlert alert = invocation.getArgument(0);
            alert.setAlertId(7L);
            return alert;
        });

        CreateSensorReadingRequest request = new CreateSensorReadingRequest();
        request.setBatchId(1L);
        request.setMetric("TEMP");
        request.setValue(BigDecimal.valueOf(40)); // above max=35 → HIGH severity

        // Service calls SecurityUtils.getCurrentUser/Id inside enforceIngestOwnership and audit log.
        // Mock as ADMIN to bypass farm ownership check.
        CustomUserPrincipal admin = new CustomUserPrincipal(
                1L, "admin@example.com", "x", "Admin",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUser).thenReturn(admin);
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(1L);
            SensorAlertResponse response = ioTService.ingest(request);
            assertEquals("HIGH", response.getSeverity());
        }
    }
}
