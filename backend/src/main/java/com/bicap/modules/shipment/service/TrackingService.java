package com.bicap.modules.shipment.service;

import com.bicap.core.enums.ShipmentStatus;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.logistics.entity.Driver;
import com.bicap.modules.logistics.repository.DriverRepository;
import com.bicap.modules.shipment.dto.LocationUpdateRequest;
import com.bicap.modules.shipment.dto.TrackingLocationResponse;
import com.bicap.modules.shipment.entity.Shipment;
import com.bicap.modules.shipment.entity.TrackingLocation;
import com.bicap.modules.shipment.repository.ShipmentRepository;
import com.bicap.modules.shipment.repository.TrackingLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Service cập nhật/truy vấn vị trí GPS realtime của tài xế.
 * - Redis cache TTL 1h cho latest-location để read nhanh.
 * - DB lưu full history cho phân tích + vẽ tuyến đường.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TrackingService {

    private static final long REDIS_TTL_HOURS = 1L;

    private final TrackingLocationRepository trackingLocationRepository;
    private final ShipmentRepository shipmentRepository;
    private final DriverRepository driverRepository;
    private final StringRedisTemplate redisTemplate;

    @Transactional
    public TrackingLocationResponse updateLocation(LocationUpdateRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Driver driver = driverRepository.findByUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("User không gắn với Driver resource nào."));

        Shipment shipment = shipmentRepository.findById(request.getShipmentId())
                .orElseThrow(() -> new BusinessException("Shipment không tồn tại"));

        if (shipment.getDriverId() == null || !shipment.getDriverId().equals(driver.getDriverId())) {
            throw new BusinessException("Shipment này không được gán cho bạn.");
        }

        if (!isShipmentInTransit(shipment.getStatus())) {
            throw new BusinessException("Shipment chưa ở trạng thái đang vận chuyển (PICKED_UP/IN_TRANSIT).");
        }

        TrackingLocation location = new TrackingLocation();
        location.setShipmentId(shipment.getShipmentId());
        location.setDriverId(driver.getDriverId());
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setAccuracy(request.getAccuracy());

        TrackingLocation saved = trackingLocationRepository.save(location);
        cacheLatestLocation(saved);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public TrackingLocationResponse getLatestLocation(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new BusinessException("Shipment không tồn tại"));

        String redisKey = redisKey(shipmentId);
        String cached = safeRedisGet(redisKey);
        if (cached != null) {
            String[] parts = cached.split(",", 5);
            if (parts.length >= 5) {
                try {
                    return TrackingLocationResponse.builder()
                            .shipmentId(shipmentId)
                            .driverId(shipment.getDriverId())
                            .latitude(Double.parseDouble(parts[0]))
                            .longitude(Double.parseDouble(parts[1]))
                            .accuracy(parts[2].isBlank() ? null : Float.parseFloat(parts[2]))
                            .createdAt(LocalDateTime.parse(parts[3]))
                            .locationId(parts[4].isBlank() ? null : Long.parseLong(parts[4]))
                            .build();
                } catch (RuntimeException ex) {
                    log.debug("Tracking redis payload không parse được cho shipment {}: {}", shipmentId, cached);
                }
            }
        }

        Optional<TrackingLocation> latest = trackingLocationRepository.findFirstByShipmentIdOrderByCreatedAtDesc(shipmentId);
        return latest.map(this::toResponse)
                .orElseThrow(() -> new BusinessException("Chưa có vị trí tracking cho shipment này"));
    }

    @Transactional(readOnly = true)
    public List<TrackingLocationResponse> getLocationHistory(Long shipmentId) {
        shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new BusinessException("Shipment không tồn tại"));
        return trackingLocationRepository.findByShipmentIdOrderByCreatedAtDesc(shipmentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TrackingLocationResponse> getLocationsByTimeRange(Long shipmentId, LocalDateTime startTime, LocalDateTime endTime) {
        shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new BusinessException("Shipment không tồn tại"));
        return trackingLocationRepository.findByShipmentIdAndTimeRange(shipmentId, startTime, endTime).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TrackingLocationResponse> getDriverLocations(Long driverId) {
        driverRepository.findById(driverId)
                .orElseThrow(() -> new BusinessException("Tài xế không tồn tại"));
        return trackingLocationRepository.findByDriverIdOrderByCreatedAtDesc(driverId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private boolean isShipmentInTransit(ShipmentStatus status) {
        return status != null && Set.of(ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT).contains(status);
    }

    private void cacheLatestLocation(TrackingLocation location) {
        try {
            String value = location.getLatitude() + "," + location.getLongitude() + ","
                    + (location.getAccuracy() == null ? "" : location.getAccuracy()) + ","
                    + location.getCreatedAt() + ","
                    + (location.getLocationId() == null ? "" : location.getLocationId());
            redisTemplate.opsForValue().set(redisKey(location.getShipmentId()), value, REDIS_TTL_HOURS, TimeUnit.HOURS);
            redisTemplate.opsForValue().set(driverKey(location.getDriverId()), value, REDIS_TTL_HOURS, TimeUnit.HOURS);
        } catch (RuntimeException ex) {
            log.warn("Không thể cache tracking location cho shipment {}: {}", location.getShipmentId(), ex.getMessage());
        }
    }

    private String safeRedisGet(String key) {
        try {
            return redisTemplate.opsForValue().get(key);
        } catch (RuntimeException ex) {
            log.debug("Redis get failed for {}: {}", key, ex.getMessage());
            return null;
        }
    }

    private static String redisKey(Long shipmentId) {
        return "tracking:shipment:" + shipmentId;
    }

    private static String driverKey(Long driverId) {
        return "tracking:driver:" + driverId;
    }

    private TrackingLocationResponse toResponse(TrackingLocation location) {
        return TrackingLocationResponse.builder()
                .locationId(location.getLocationId())
                .shipmentId(location.getShipmentId())
                .driverId(location.getDriverId())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .accuracy(location.getAccuracy())
                .createdAt(location.getCreatedAt())
                .build();
    }
}
