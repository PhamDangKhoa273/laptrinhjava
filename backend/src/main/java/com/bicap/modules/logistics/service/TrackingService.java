package com.bicap.modules.logistics.service;

import com.bicap.core.exception.ResourceNotFoundException;
import com.bicap.modules.logistics.dto.LocationUpdateRequest;
import com.bicap.modules.logistics.dto.TrackingLocationResponse;
import com.bicap.modules.logistics.entity.Driver;
import com.bicap.modules.logistics.entity.Shipment;
import com.bicap.modules.logistics.entity.ShipmentHistory;
import com.bicap.modules.logistics.entity.TrackingLocation;
import com.bicap.modules.logistics.repository.*;
import com.bicap.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Service cập nhật và lấy vị trí GPS real-time của tài xế
 * Sử dụng Redis để cache dữ liệu, MySQL để lưu trữ lâu dài
 */
@Service
@RequiredArgsConstructor
public class TrackingService {

    private final TrackingLocationRepository trackingLocationRepository;
    private final ShipmentRepository shipmentRepository;
    private final DriverRepository driverRepository;
    private final ShipmentHistoryRepository shipmentHistoryRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Cập nhật vị trí hiện tại của tài xế
     * Lưu vào Redis (cache nhanh) và Database (lưu trữ dài hạn)
     */
    @Transactional
    public TrackingLocationResponse updateLocation(LocationUpdateRequest request, Long driverId) {
        // 1. Kiểm tra shipment tồn tại
        Shipment shipment = shipmentRepository.findById(request.getShipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Shipment không tồn tại"));
        
        // 2. Kiểm tra tài xế là người được giao đơn
        if (!shipment.getDriver().getDriverId().equals(driverId)) {
            throw new ResourceNotFoundException("Bạn không phải là tài xế của shipment này");
        }
        
        // 3. Kiểm tra shipment đang trong quá trình vận chuyển
        if (!isShipmentInTransit(shipment.getStatus())) {
            throw new IllegalArgumentException("Shipment không ở trạng thái vận chuyển");
        }
        
        Driver driver = shipment.getDriver();
        
        // 4. Tạo tracking location mới
        TrackingLocation location = new TrackingLocation();
        location.setShipment(shipment);
        location.setDriver(driver);
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setAccuracy(request.getAccuracy());
        
        TrackingLocation saved = trackingLocationRepository.save(location);
        
        // 5. Cập nhật lên Redis (cache 1 giờ)
        cacheLatestLocation(shipment.getShipmentId(), driverId, 
                request.getLatitude(), request.getLongitude(), request.getAccuracy());
        
        // 6. Ghi lịch sử shipment với vị trí
        recordLocationInHistory(shipment, request.getLatitude(), request.getLongitude(), driverId);
        
        return toTrackingResponse(saved);
    }

    /**
     * Lấy vị trí hiện tại của tài xế (từ Redis nếu có, không thì từ DB)
     */
    @Transactional(readOnly = true)
    public TrackingLocationResponse getLatestLocation(Long shipmentId) {
        // 1. Kiểm tra shipment tồn tại
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment không tồn tại"));
        
        // 2. Thử lấy từ Redis
        String redisKey = "tracking:shipment:" + shipmentId;
        Object cachedLocation = redisTemplate.opsForValue().get(redisKey);
        
        if (cachedLocation != null) {
            // Dữ liệu từ cache (tối ưu hóa)
            String[] parts = cachedLocation.toString().split(",");
            if (parts.length == 4) {
                return TrackingLocationResponse.builder()
                        .shipmentId(shipmentId)
                        .driverId(shipment.getDriver().getDriverId())
                        .latitude(Double.parseDouble(parts[0]))
                        .longitude(Double.parseDouble(parts[1]))
                        .accuracy(Float.parseFloat(parts[2]))
                        .createdAt(LocalDateTime.parse(parts[3]))
                        .build();
            }
        }
        
        // 3. Lấy từ Database nếu cache miss
        Optional<TrackingLocation> latest = trackingLocationRepository
                .findFirstByShipmentIdOrderByCreatedAtDesc(shipmentId);
        
        if (latest.isEmpty()) {
            throw new ResourceNotFoundException("Chưa có vị trí tracking cho shipment này");
        }
        
        return toTrackingResponse(latest.get());
    }

    /**
     * Lấy lịch sử vị trí của một shipment (cho vẽ đường trên bản đồ)
     */
    @Transactional(readOnly = true)
    public List<TrackingLocationResponse> getLocationHistory(Long shipmentId) {
        // Kiểm tra shipment tồn tại
        shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment không tồn tại"));
        
        return trackingLocationRepository.findByShipmentIdOrderByCreatedAtDesc(shipmentId).stream()
                .map(this::toTrackingResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy lịch sử vị trí trong một khoảng thời gian
     */
    @Transactional(readOnly = true)
    public List<TrackingLocationResponse> getLocationsByTimeRange(Long shipmentId, 
                                                                   LocalDateTime startTime, 
                                                                   LocalDateTime endTime) {
        // Kiểm tra shipment tồn tại
        shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment không tồn tại"));
        
        return trackingLocationRepository.findByShipmentIdAndTimeRange(shipmentId, startTime, endTime).stream()
                .map(this::toTrackingResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả vị trí của một tài xế
     */
    @Transactional(readOnly = true)
    public List<TrackingLocationResponse> getDriverLocations(Long driverId) {
        // Kiểm tra tài xế tồn tại
        driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Tài xế không tồn tại"));
        
        return trackingLocationRepository.findByDriverIdOrderByCreatedAtDesc(driverId).stream()
                .map(this::toTrackingResponse)
                .collect(Collectors.toList());
    }

    /**
     * Kiểm tra shipment đang vận chuyển
     */
    private boolean isShipmentInTransit(String status) {
        return "PICKED_UP".equals(status) || "IN_TRANSIT".equals(status);
    }

    /**
     * Lưu vị trí mới nhất vào Redis cache
     */
    private void cacheLatestLocation(Long shipmentId, Long driverId, Double lat, Double lng, Float accuracy) {
        String redisKey = "tracking:shipment:" + shipmentId;
        String redisDriverKey = "tracking:driver:" + driverId;
        
        String locationData = lat + "," + lng + "," + accuracy + "," + LocalDateTime.now();
        
        // Cache 1 giờ
        redisTemplate.opsForValue().set(redisKey, locationData, 1, TimeUnit.HOURS);
        redisTemplate.opsForValue().set(redisDriverKey, locationData, 1, TimeUnit.HOURS);
    }

    /**
     * Ghi vị trí vào lịch sử shipment
     */
    private void recordLocationInHistory(Shipment shipment, Double latitude, Double longitude, Long userId) {
        ShipmentHistory history = new ShipmentHistory();
        history.setShipment(shipment);
        history.setPreviousStatus(shipment.getStatus());
        history.setNewStatus(shipment.getStatus());
        history.setLatitude(latitude);
        history.setLongitude(longitude);
        history.setReason("Cập nhật vị trí GPS");
        history.setChangedBy(userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại")));
        
        shipmentHistoryRepository.save(history);
    }

    /**
     * Convert entity sang DTO
     */
    private TrackingLocationResponse toTrackingResponse(TrackingLocation location) {
        return TrackingLocationResponse.builder()
                .locationId(location.getLocationId())
                .shipmentId(location.getShipment().getShipmentId())
                .driverId(location.getDriver().getDriverId())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .accuracy(location.getAccuracy())
                .createdAt(location.getCreatedAt())
                .build();
    }
}
