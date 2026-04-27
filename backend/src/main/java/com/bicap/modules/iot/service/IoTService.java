package com.bicap.modules.iot.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.batch.repository.ProductBatchRepository;
import com.bicap.modules.common.notification.service.NotificationDispatcher;
import com.bicap.core.AuditLogService;
import com.bicap.core.security.MetricsSecurityEvents;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.iot.dto.CreateSensorReadingRequest;
import com.bicap.modules.iot.dto.SensorAlertResponse;
import com.bicap.modules.iot.entity.IoTAlert;
import com.bicap.modules.iot.entity.SensorReading;
import com.bicap.modules.iot.entity.ThresholdRule;
import com.bicap.modules.iot.repository.IoTAlertRepository;
import com.bicap.modules.iot.repository.SensorReadingRepository;
import com.bicap.modules.iot.repository.ThresholdRuleRepository;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.season.repository.FarmingSeasonRepository;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class IoTService {
    private final SensorReadingRepository sensorReadingRepository;
    private final ThresholdRuleRepository thresholdRuleRepository;
    private final IoTAlertRepository iotAlertRepository;
    private final ProductBatchRepository productBatchRepository;
    private final FarmingSeasonRepository farmingSeasonRepository;
    private final NotificationDispatcher notificationDispatcher;
    private final AuditLogService auditLogService;
    private final MetricsSecurityEvents metrics;

    public IoTService(SensorReadingRepository sensorReadingRepository, ThresholdRuleRepository thresholdRuleRepository, IoTAlertRepository iotAlertRepository, ProductBatchRepository productBatchRepository, FarmingSeasonRepository farmingSeasonRepository, NotificationDispatcher notificationDispatcher, AuditLogService auditLogService, MetricsSecurityEvents metrics) {
        this.sensorReadingRepository = sensorReadingRepository; this.thresholdRuleRepository = thresholdRuleRepository; this.iotAlertRepository = iotAlertRepository; this.productBatchRepository = productBatchRepository; this.farmingSeasonRepository = farmingSeasonRepository; this.notificationDispatcher = notificationDispatcher; this.auditLogService = auditLogService; this.metrics = metrics;
    }

    @Transactional
    public SensorAlertResponse ingest(CreateSensorReadingRequest request) {
        ProductBatch batch = request.getBatchId() != null ? productBatchRepository.findById(request.getBatchId()).orElseThrow(() -> new BusinessException("Không tìm thấy batch")) : null;
        FarmingSeason season = request.getSeasonId() != null ? farmingSeasonRepository.findById(request.getSeasonId()).orElseThrow(() -> new BusinessException("Không tìm thấy season")) : null;
        Farm farm = batch != null ? batch.getSeason().getFarm() : season != null ? season.getFarm() : null;
        if (farm == null) throw new BusinessException("Sensor reading phải gắn với batch hoặc season hợp lệ");
        enforceIngestOwnership(farm);
        validateDeviceIdentityIfPresent(request, farm);
        SensorReading reading = new SensorReading(); reading.setBatch(batch); reading.setSeason(season != null ? season : (batch != null ? batch.getSeason() : null)); reading.setFarm(farm); reading.setMetric(request.getMetric().trim().toUpperCase()); reading.setValue(request.getValue()); reading.setMeasuredAt(parseMeasuredAt(request.getMeasuredAt())); sensorReadingRepository.save(reading);
        ThresholdRule rule = thresholdRuleRepository.findByFarmFarmIdAndEnabledTrue(farm.getFarmId()).stream().filter(r -> r.getMetric() != null && r.getMetric().equalsIgnoreCase(reading.getMetric())).findFirst().orElse(null);
        if (rule == null || !violates(rule, reading.getValue())) return mapAlert(null);
        IoTAlert alert = new IoTAlert(); alert.setFarm(farm); alert.setBatch(batch); alert.setSeason(reading.getSeason()); alert.setMetric(reading.getMetric()); alert.setValue(reading.getValue()); alert.setMinValue(rule.getMinValue()); alert.setMaxValue(rule.getMaxValue()); alert.setSeverity(severityFor(rule, reading.getValue())); alert.setTitle("Cảnh báo " + reading.getMetric()); alert.setDescription("Giá trị " + reading.getMetric() + " vượt ngưỡng quy định"); alert.setMeasuredAt(reading.getMeasuredAt()); IoTAlert saved = iotAlertRepository.save(alert);
        try { if (metrics != null) metrics.iotAlertCount.increment(); } catch (Exception ex) { log.debug("Không thể tăng metric iotAlertCount", ex); }
        notificationDispatcher.send(farm.getOwnerUser().getUserId(), null, "IoT alert: " + saved.getTitle(), saved.getDescription(), "IOT_ALERT", "IOT_ALERT", saved.getAlertId());
        auditLogService.log(SecurityUtils.getCurrentUserId(), "NOTIFY_IOT_NEW", "IOT_ALERT", saved.getAlertId(), "recipient=farm:" + farm.getFarmId());
        if ("HIGH".equalsIgnoreCase(saved.getSeverity())) notificationDispatcher.send(null, "ADMIN", "Critical IoT alert", "Farm " + farm.getFarmName() + " phát sinh cảnh báo HIGH: " + saved.getMetric(), "IOT_ALERT", "IOT_ALERT", saved.getAlertId());
        return mapAlert(saved);
    }

    public List<SensorAlertResponse> getMyAlerts() { Long currentUserId = SecurityUtils.getCurrentUserId(); return iotAlertRepository.findByFarmOwnerUserUserIdOrderByCreatedAtDesc(currentUserId).stream().map(this::mapAlert).toList(); }
    @Transactional
    public SensorAlertResponse resolve(Long alertId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        IoTAlert alert = iotAlertRepository.findById(alertId).orElseThrow(() -> new BusinessException("Không tìm thấy alert"));
        if (alert.getFarm() == null || alert.getFarm().getOwnerUser() == null || !alert.getFarm().getOwnerUser().getUserId().equals(currentUserId)) {
            throw new BusinessException("Bạn không có quyền resolve alert này");
        }
        if ("RESOLVED".equalsIgnoreCase(alert.getStatus())) return mapAlert(alert);
        alert.setStatus("RESOLVED"); alert.setResolvedAt(LocalDateTime.now());
        return mapAlert(saveRetrySafe(alert));
    }
    private IoTAlert saveRetrySafe(IoTAlert alert) { try { return iotAlertRepository.save(alert); } catch (OptimisticLockingFailureException ex) { return iotAlertRepository.findById(alert.getAlertId()).orElseThrow(); } }
    private void enforceIngestOwnership(Farm farm) {
        var currentUser = SecurityUtils.getCurrentUser();
        boolean isAdmin = currentUser.getAuthorities().stream().anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (isAdmin) return;
        Long ownerUserId = farm.getOwnerUser() != null ? farm.getOwnerUser().getUserId() : null;
        if (ownerUserId == null || !ownerUserId.equals(currentUser.getUserId())) {
            throw new BusinessException("Bạn không có quyền gửi dữ liệu IoT cho farm này");
        }
    }
    private void validateDeviceIdentityIfPresent(CreateSensorReadingRequest request, Farm farm) {
        boolean hasDeviceCode = request.getDeviceCode() != null && !request.getDeviceCode().isBlank();
        boolean hasApiKey = request.getApiKey() != null && !request.getApiKey().isBlank();
        if (!hasDeviceCode && !hasApiKey) return;
        if (!hasDeviceCode || !hasApiKey) {
            throw new BusinessException("Thông tin định danh thiết bị IoT không hợp lệ");
        }
        String expectedKey = "BICAP-IOT-" + farm.getFarmId() + "-" + request.getDeviceCode().trim();
        if (!expectedKey.equals(request.getApiKey().trim())) {
            throw new BusinessException("API key thiết bị IoT không hợp lệ");
        }
    }
    private boolean violates(ThresholdRule rule, BigDecimal value) { return (rule.getMinValue() != null && value.compareTo(rule.getMinValue()) < 0) || (rule.getMaxValue() != null && value.compareTo(rule.getMaxValue()) > 0); }
    private String severityFor(ThresholdRule rule, BigDecimal value) { if (rule.getMaxValue() != null && value.compareTo(rule.getMaxValue()) > 0) return "HIGH"; if (rule.getMinValue() != null && value.compareTo(rule.getMinValue()) < 0) return "HIGH"; return "MEDIUM"; }
    private LocalDateTime parseMeasuredAt(String measuredAt) { if (measuredAt == null || measuredAt.isBlank()) return LocalDateTime.now(); return LocalDateTime.parse(measuredAt); }
    private SensorAlertResponse mapAlert(IoTAlert alert) { if (alert == null) return null; SensorAlertResponse response = new SensorAlertResponse(); response.setAlertId(alert.getAlertId()); response.setFarmId(alert.getFarm() != null ? alert.getFarm().getFarmId() : null); response.setBatchId(alert.getBatch() != null ? alert.getBatch().getBatchId() : null); response.setSeasonId(alert.getSeason() != null ? alert.getSeason().getSeasonId() : null); response.setMetric(alert.getMetric()); response.setValue(alert.getValue()); response.setMinValue(alert.getMinValue()); response.setMaxValue(alert.getMaxValue()); response.setSeverity(alert.getSeverity()); response.setStatus(alert.getStatus()); response.setTitle(alert.getTitle()); response.setDescription(alert.getDescription()); response.setMeasuredAt(alert.getMeasuredAt()); response.setCreatedAt(alert.getCreatedAt()); response.setResolvedAt(alert.getResolvedAt()); return response; }
}
