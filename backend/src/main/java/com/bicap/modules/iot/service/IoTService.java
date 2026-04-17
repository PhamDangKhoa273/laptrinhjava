package com.bicap.modules.iot.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.enums.IoTAlertLevel;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.iot.dto.CreateIoTReadingRequest;
import com.bicap.modules.iot.dto.IoTAlertResponse;
import com.bicap.modules.iot.dto.IoTReadingResponse;
import com.bicap.modules.iot.entity.IoTAlert;
import com.bicap.modules.iot.entity.IoTReading;
import com.bicap.modules.iot.repository.IoTAlertRepository;
import com.bicap.modules.iot.repository.IoTReadingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class IoTService {

    private final IoTReadingRepository ioTReadingRepository;
    private final IoTAlertRepository ioTAlertRepository;
    private final AuditLogService auditLogService;
    private final BlockchainService blockchainService;

    public IoTService(IoTReadingRepository ioTReadingRepository,
                      IoTAlertRepository ioTAlertRepository,
                      AuditLogService auditLogService,
                      BlockchainService blockchainService) {
        this.ioTReadingRepository = ioTReadingRepository;
        this.ioTAlertRepository = ioTAlertRepository;
        this.auditLogService = auditLogService;
        this.blockchainService = blockchainService;
    }

    @Transactional
    public IoTReadingResponse createReading(CreateIoTReadingRequest request, Long currentUserId) {
        validateReading(request);
        IoTReading reading = new IoTReading();
        reading.setBatchId(request.getBatchId());
        reading.setTemperature(request.getTemperature());
        reading.setHumidity(request.getHumidity());
        reading.setPhValue(request.getPhValue());

        IoTReading saved = ioTReadingRepository.save(reading);
        createAlertIfNeeded(saved);
        auditLogService.log(currentUserId, "CREATE_IOT_READING", "IOT_READING", saved.getReadingId(), "batchId=" + saved.getBatchId());
        try {
            blockchainService.saveTransaction("IOT_READING", saved.getReadingId(), "SENSOR_CAPTURE",
                    "batchId=" + saved.getBatchId() + ",temp=" + saved.getTemperature() + ",humidity=" + saved.getHumidity() + ",ph=" + saved.getPhValue());
        } catch (Exception ignored) {
        }
        return toReadingResponse(saved);
    }

    private void validateReading(CreateIoTReadingRequest request) {
        if (request.getTemperature().compareTo(BigDecimal.valueOf(-20)) < 0 || request.getTemperature().compareTo(BigDecimal.valueOf(80)) > 0) {
            throw new BusinessException("Temperature vượt ngoài biên hợp lệ");
        }
        if (request.getHumidity().compareTo(BigDecimal.ZERO) < 0 || request.getHumidity().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BusinessException("Humidity phải nằm trong khoảng 0-100");
        }
        if (request.getPhValue().compareTo(BigDecimal.ZERO) <= 0 || request.getPhValue().compareTo(BigDecimal.valueOf(14)) > 0) {
            throw new BusinessException("pH phải nằm trong khoảng (0,14]");
        }
    }

    public List<IoTReadingResponse> getReadings(Long batchId) {
        return ioTReadingRepository.findTop50ByBatchIdOrderByCapturedAtDesc(batchId).stream()
                .map(this::toReadingResponse)
                .toList();
    }

    public List<IoTAlertResponse> getAlerts(Long batchId) {
        return ioTAlertRepository.findTop50ByBatchIdOrderByCreatedAtDesc(batchId).stream()
                .map(this::toAlertResponse)
                .toList();
    }

    private void createAlertIfNeeded(IoTReading reading) {
        checkMetric(reading.getBatchId(), "TEMPERATURE", reading.getTemperature(), BigDecimal.valueOf(35), IoTAlertLevel.WARNING);
        checkMetric(reading.getBatchId(), "HUMIDITY", reading.getHumidity(), BigDecimal.valueOf(85), IoTAlertLevel.WARNING);
        if (reading.getPhValue().compareTo(BigDecimal.valueOf(5)) < 0 || reading.getPhValue().compareTo(BigDecimal.valueOf(8)) > 0) {
            saveAlert(reading.getBatchId(), "PH", "Chỉ số pH vượt ngưỡng an toàn", IoTAlertLevel.CRITICAL);
        }
    }

    private void checkMetric(Long batchId, String metric, BigDecimal value, BigDecimal threshold, IoTAlertLevel level) {
        if (value != null && value.compareTo(threshold) > 0) {
            saveAlert(batchId, metric, metric + " vượt ngưỡng cấu hình", level);
        }
    }

    private void saveAlert(Long batchId, String metric, String message, IoTAlertLevel level) {
        IoTAlert alert = new IoTAlert();
        alert.setBatchId(batchId);
        alert.setMetric(metric);
        alert.setMessage(message);
        alert.setLevel(level);
        ioTAlertRepository.save(alert);
    }

    private IoTReadingResponse toReadingResponse(IoTReading reading) {
        IoTReadingResponse response = new IoTReadingResponse();
        response.setReadingId(reading.getReadingId());
        response.setBatchId(reading.getBatchId());
        response.setTemperature(reading.getTemperature());
        response.setHumidity(reading.getHumidity());
        response.setPhValue(reading.getPhValue());
        response.setCapturedAt(reading.getCapturedAt());
        return response;
    }

    private IoTAlertResponse toAlertResponse(IoTAlert alert) {
        IoTAlertResponse response = new IoTAlertResponse();
        response.setAlertId(alert.getAlertId());
        response.setBatchId(alert.getBatchId());
        response.setMetric(alert.getMetric());
        response.setMessage(alert.getMessage());
        response.setLevel(alert.getLevel().name());
        response.setCreatedAt(alert.getCreatedAt());
        return response;
    }
}
