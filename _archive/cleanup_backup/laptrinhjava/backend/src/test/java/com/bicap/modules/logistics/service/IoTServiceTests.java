package com.bicap.modules.logistics.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.modules.batch.repository.ProductBatchRepository;
import com.bicap.modules.common.notification.service.NotificationService;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.iot.dto.CreateSensorReadingRequest;
import com.bicap.modules.iot.repository.IoTAlertRepository;
import com.bicap.modules.iot.repository.SensorReadingRepository;
import com.bicap.modules.iot.repository.ThresholdRuleRepository;
import com.bicap.modules.iot.service.IoTService;
import com.bicap.modules.season.repository.FarmingSeasonRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IoTServiceTests {

    @Mock private SensorReadingRepository sensorReadingRepository;
    @Mock private ThresholdRuleRepository thresholdRuleRepository;
    @Mock private IoTAlertRepository iotAlertRepository;
    @Mock private ProductBatchRepository productBatchRepository;
    @Mock private FarmingSeasonRepository farmingSeasonRepository;
    @Mock private FarmRepository farmRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private IoTService ioTService;

    @Test
    void ingest_shouldRejectWhenNoBatchOrSeasonSpecified() {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest();
        request.setMetric("HUMIDITY");
        request.setValue(BigDecimal.valueOf(80));

        assertThrows(BusinessException.class, () -> ioTService.ingest(request));
    }

    @Test
    void ingest_shouldRejectInvalidBatch() {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest();
        request.setBatchId(999L);
        request.setMetric("TEMPERATURE");
        request.setValue(BigDecimal.valueOf(25));

        when(productBatchRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () -> ioTService.ingest(request));
    }
}
