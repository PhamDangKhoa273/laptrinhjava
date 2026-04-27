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

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

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

        var response = service.ingest(request);

        assertThat(response.getSeverity()).isEqualTo("HIGH");
        assertThat(response.getMetric()).isEqualTo("TEMPERATURE");
    }

    @Test
    void resolve_shouldBeIdempotent() {
        IoTAlert alert = new IoTAlert();
        alert.setAlertId(5L);
        alert.setStatus("RESOLVED");
        var farm = new com.bicap.modules.farm.entity.Farm();
        farm.setFarmId(10L);
        var owner = new com.bicap.modules.user.entity.User();
        owner.setUserId(1L);
        farm.setOwnerUser(owner);
        alert.setFarm(farm);
        when(iotAlertRepository.findById(5L)).thenReturn(Optional.of(alert));

        var response = service.resolve(5L);

        assertThat(response.getStatus()).isEqualTo("RESOLVED");
    }
}
