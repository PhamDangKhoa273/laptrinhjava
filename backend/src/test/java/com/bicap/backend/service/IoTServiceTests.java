package com.bicap.backend.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.iot.dto.CreateIoTReadingRequest;
import com.bicap.modules.iot.dto.IoTReadingResponse;
import com.bicap.modules.iot.entity.IoTAlert;
import com.bicap.modules.iot.entity.IoTReading;
import com.bicap.modules.iot.repository.IoTAlertRepository;
import com.bicap.modules.iot.repository.IoTReadingRepository;
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

    @Mock private IoTReadingRepository ioTReadingRepository;
    @Mock private IoTAlertRepository ioTAlertRepository;
    @Mock private AuditLogService auditLogService;
    @Mock private BlockchainService blockchainService;

    @InjectMocks
    private IoTService ioTService;

    @Test
    void createReading_shouldRejectHumidityOutOfRange() {
        CreateIoTReadingRequest request = new CreateIoTReadingRequest();
        request.setBatchId(1L);
        request.setTemperature(BigDecimal.valueOf(20));
        request.setHumidity(BigDecimal.valueOf(120));
        request.setPhValue(BigDecimal.valueOf(7));

        assertThrows(BusinessException.class, () -> ioTService.createReading(request, 1L));
    }

    @Test
    void createReading_shouldCreateAlertWhenThresholdExceeded() {
        CreateIoTReadingRequest request = new CreateIoTReadingRequest();
        request.setBatchId(1L);
        request.setTemperature(BigDecimal.valueOf(40));
        request.setHumidity(BigDecimal.valueOf(90));
        request.setPhValue(BigDecimal.valueOf(9));

        when(ioTReadingRepository.save(any(IoTReading.class))).thenAnswer(invocation -> {
            IoTReading reading = invocation.getArgument(0);
            reading.setReadingId(10L);
            return reading;
        });

        IoTReadingResponse response = ioTService.createReading(request, 2L);
        assertEquals(10L, response.getReadingId());

        ArgumentCaptor<IoTAlert> captor = ArgumentCaptor.forClass(IoTAlert.class);
        verify(ioTAlertRepository, org.mockito.Mockito.atLeastOnce()).save(captor.capture());
    }
}
