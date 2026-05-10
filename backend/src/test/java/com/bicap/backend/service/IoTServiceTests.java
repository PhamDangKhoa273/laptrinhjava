package com.bicap.backend.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.batch.config.BlockchainProperties;
import com.bicap.modules.batch.repository.BlockchainTransactionRepository;
import com.bicap.modules.iot.dto.CreateSensorReadingRequest;
import com.bicap.modules.iot.dto.SensorAlertResponse;
import com.bicap.modules.iot.entity.IoTAlert;
import com.bicap.modules.iot.entity.SensorReading;
import com.bicap.modules.iot.repository.IoTAlertRepository;
import com.bicap.modules.iot.repository.SensorReadingRepository;
import com.bicap.modules.iot.service.IoTService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IoTServiceTests {

    @Mock private SensorReadingRepository sensorReadingRepository;
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
        CreateSensorReadingRequest request = new CreateSensorReadingRequest();
        request.setBatchId(1L);
        request.setMetric("TEMP");
        request.setValue(BigDecimal.valueOf(40));

        when(sensorReadingRepository.save(any(SensorReading.class))).thenAnswer(invocation -> {
            SensorReading reading = invocation.getArgument(0);
            return reading;
        });

        SensorAlertResponse response = ioTService.ingest(request);
        assertEquals("HIGH", response.getSeverity());
    }
}
