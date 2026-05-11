package com.bicap.modules.iot.service;

import com.bicap.modules.common.notification.service.NotificationDispatcher;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.iot.entity.SensorReading;
import com.bicap.modules.iot.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Gửi bản tóm tắt IoT hằng ngày (nhiệt độ, độ ẩm, pH) cho chủ farm.
 * Chạy mặc định lúc 18:00 giờ hệ thống.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class IoTDailySummaryJob {

    private enum Metric {
        TEMPERATURE,
        HUMIDITY,
        PH
    }

    private final FarmRepository farmRepository;
    private final SensorReadingRepository sensorReadingRepository;
    private final NotificationDispatcher notificationDispatcher;

    @Scheduled(cron = "${app.iot.daily-summary-cron:0 0 18 * * *}", zone = "${app.iot.timezone:Asia/Ho_Chi_Minh}")
    @Transactional(readOnly = true)
    public void dispatchDailySummaries() {
        LocalDate today = LocalDate.now();
        LocalDateTime from = today.atStartOfDay();
        LocalDateTime to = today.atTime(23, 59, 59);

        List<Farm> farms = farmRepository.findByApprovalStatusIgnoreCase("APPROVED");
        for (Farm farm : farms) {
            try {
                if (farm.getOwnerUser() == null) {
                    continue;
                }
                List<SensorReading> readings = sensorReadingRepository
                        .findByFarmFarmIdAndMeasuredAtBetween(farm.getFarmId(), from, to);
                if (readings.isEmpty()) {
                    continue;
                }

                Map<Metric, Stats> byMetric = groupAndAggregate(readings);
                if (byMetric.isEmpty()) {
                    continue;
                }

                String body = buildSummaryMessage(byMetric);
                notificationDispatcher.send(
                        farm.getOwnerUser().getUserId(),
                        null,
                        "Tổng hợp chỉ số IoT trong ngày",
                        body,
                        "IOT_DAILY_SUMMARY",
                        "FARM",
                        farm.getFarmId());
            } catch (RuntimeException ex) {
                log.warn("Không thể gửi IoT daily summary cho farm {}: {}", farm.getFarmId(), ex.getMessage());
            }
        }
    }

    private Map<Metric, Stats> groupAndAggregate(List<SensorReading> readings) {
        Map<Metric, Stats> result = new EnumMap<>(Metric.class);
        for (SensorReading reading : readings) {
            Metric metric = mapMetric(reading.getMetric());
            if (metric == null || reading.getValue() == null) {
                continue;
            }
            result.computeIfAbsent(metric, k -> new Stats()).add(reading.getValue());
        }
        return result;
    }

    private String buildSummaryMessage(Map<Metric, Stats> byMetric) {
        Map<String, String> ordered = new LinkedHashMap<>();
        byMetric.forEach((metric, stats) -> ordered.put(metric.name(), stats.format()));
        StringBuilder sb = new StringBuilder("Tóm tắt chỉ số trong ngày:\n");
        ordered.forEach((key, value) -> sb.append("- ").append(key).append(": ").append(value).append('\n'));
        return sb.toString().trim();
    }

    private Metric mapMetric(String raw) {
        if (raw == null) {
            return null;
        }
        String normalized = raw.trim().toUpperCase();
        return switch (normalized) {
            case "TEMPERATURE", "TEMP" -> Metric.TEMPERATURE;
            case "HUMIDITY", "HUM" -> Metric.HUMIDITY;
            case "PH" -> Metric.PH;
            default -> null;
        };
    }

    private static final class Stats {
        private BigDecimal sum = BigDecimal.ZERO;
        private BigDecimal min;
        private BigDecimal max;
        private int count;

        void add(BigDecimal value) {
            sum = sum.add(value);
            count++;
            if (min == null || value.compareTo(min) < 0) min = value;
            if (max == null || value.compareTo(max) > 0) max = value;
        }

        String format() {
            if (count == 0) {
                return "không có dữ liệu";
            }
            BigDecimal avg = sum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
            return String.format("TB %s | min %s | max %s | n=%d",
                    avg.toPlainString(),
                    min.toPlainString(),
                    max.toPlainString(),
                    count);
        }
    }
}
