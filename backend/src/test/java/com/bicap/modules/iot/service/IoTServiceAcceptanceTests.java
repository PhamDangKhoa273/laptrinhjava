package com.bicap.modules.iot.service;

import com.bicap.core.AuditLogService;
import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.batch.repository.ProductBatchRepository;
import com.bicap.modules.common.notification.service.NotificationDispatcher;
import com.bicap.core.security.MetricsSecurityEvents;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.iot.dto.CreateSensorReadingRequest;
import com.bicap.modules.iot.entity.IoTAlert;
import com.bicap.modules.iot.entity.ThresholdRule;
import com.bicap.modules.iot.repository.IoTAlertRepository;
import com.bicap.modules.iot.repository.SensorReadingRepository;
import com.bicap.modules.iot.repository.ThresholdRuleRepository;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.season.repository.FarmingSeasonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.MockedStatic;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mockStatic;

@ExtendWith(MockitoExtension.class)
class IoTServiceAcceptanceTests {

    @Mock SensorReadingRepository sensorReadingRepository;
    @Mock ThresholdRuleRepository thresholdRuleRepository;
    @Mock IoTAlertRepository iotAlertRepository;
    @Mock ProductBatchRepository productBatchRepository;
    @Mock FarmingSeasonRepository farmingSeasonRepository;
    @Mock NotificationDispatcher notificationDispatcher;
    @Mock AuditLogService auditLogService;
    @Mock MetricsSecurityEvents metrics;

    @InjectMocks IoTService service;

    private Farm farm;
    private FarmingSeason season;
    private ProductBatch batch;

    @BeforeEach
    void setUp() {
        farm = new Farm();
        farm.setFarmId(10L);
        var owner = new com.bicap.modules.user.entity.User();
        owner.setUserId(1L);
        farm.setOwnerUser(owner);

        season = new FarmingSeason();
        season.setSeasonId(20L);
        season.setFarm(farm);

        batch = new ProductBatch();
        batch.setBatchId(30L);
        batch.setSeason(season);
    }

    @Test
    void ingest_shouldCreateAlert_whenThresholdViolated() {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest();
        request.setBatchId(30L);
        request.setMetric("temperature");
        request.setValue(BigDecimal.valueOf(42));
        request.setMeasuredAt("2026-04-21T10:00:00");

        ThresholdRule rule = new ThresholdRule();
        rule.setMetric("TEMPERATURE");
        rule.setMinValue(BigDecimal.valueOf(0));
        rule.setMaxValue(BigDecimal.valueOf(30));
        rule.setEnabled(true);

        IoTAlert saved = new IoTAlert();
        saved.setAlertId(99L);
        saved.setFarm(farm);
        saved.setBatch(batch);
        saved.setMetric("TEMPERATURE");
        saved.setStatus("OPEN");
        saved.setSeverity("HIGH");

        when(productBatchRepository.findById(30L)).thenReturn(Optional.of(batch));
        when(thresholdRuleRepository.findByFarmFarmIdAndEnabledTrue(10L)).thenReturn(List.of(rule));
        when(iotAlertRepository.save(any())).thenReturn(saved);

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUser).thenReturn(principal(1L, "ROLE_FARM"));
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(1L);

            var response = service.ingest(request);

            assertThat(response.getSeverity()).isEqualTo("HIGH");
            assertThat(response.getMetric()).isEqualTo("TEMPERATURE");
        }
    }

    @Test
    void ingest_shouldRejectReadingForAnotherFarm() {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest();
        request.setBatchId(30L);
        request.setMetric("temperature");
        request.setValue(BigDecimal.valueOf(28));

        when(productBatchRepository.findById(30L)).thenReturn(Optional.of(batch));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUser).thenReturn(principal(2L, "ROLE_FARM"));

            assertThatThrownBy(() -> service.ingest(request))
                    .isInstanceOf(com.bicap.core.exception.BusinessException.class)
                    .hasMessageContaining("không có quyền");
            verify(sensorReadingRepository, never()).save(any());
        }
    }

    @Test
    void ingest_shouldAcceptValidDeviceIdentityHook() {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest();
        request.setBatchId(30L);
        request.setMetric("temperature");
        request.setValue(BigDecimal.valueOf(28));
        request.setDeviceCode("GW-01");
        request.setApiKey("BICAP-IOT-10-GW-01");

        when(productBatchRepository.findById(30L)).thenReturn(Optional.of(batch));
        when(thresholdRuleRepository.findByFarmFarmIdAndEnabledTrue(10L)).thenReturn(List.of());

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUser).thenReturn(principal(1L, "ROLE_FARM"));

            var response = service.ingest(request);

            assertThat(response).isNull();
            verify(sensorReadingRepository).save(any());
        }
    }

    @Test
    void ingest_shouldRejectInvalidDeviceApiKey() {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest();
        request.setBatchId(30L);
        request.setMetric("temperature");
        request.setValue(BigDecimal.valueOf(28));
        request.setDeviceCode("GW-01");
        request.setApiKey("wrong-key");

        when(productBatchRepository.findById(30L)).thenReturn(Optional.of(batch));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUser).thenReturn(principal(1L, "ROLE_FARM"));

            assertThatThrownBy(() -> service.ingest(request))
                    .isInstanceOf(com.bicap.core.exception.BusinessException.class)
                    .hasMessageContaining("API key");
            verify(sensorReadingRepository, never()).save(any());
        }
    }

    @Test
    void ingest_shouldAllowAdminForSupportGovernance() {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest();
        request.setBatchId(30L);
        request.setMetric("temperature");
        request.setValue(BigDecimal.valueOf(28));

        when(productBatchRepository.findById(30L)).thenReturn(Optional.of(batch));
        when(thresholdRuleRepository.findByFarmFarmIdAndEnabledTrue(10L)).thenReturn(List.of());

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUser).thenReturn(principal(99L, "ROLE_ADMIN"));

            var response = service.ingest(request);

            assertThat(response).isNull();
            verify(sensorReadingRepository).save(any());
        }
    }

    private com.bicap.core.security.CustomUserPrincipal principal(Long userId, String role) {
        return new com.bicap.core.security.CustomUserPrincipal(
                userId,
                "user" + userId + "@bicap.vn",
                "password",
                "User " + userId,
                List.of(new SimpleGrantedAuthority(role))
        );
    }
}

