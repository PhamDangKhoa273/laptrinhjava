package com.bicap.modules.media.controller;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.logistics.entity.Driver;
import com.bicap.modules.logistics.repository.DriverRepository;
import com.bicap.modules.media.entity.MediaFile;
import com.bicap.modules.media.service.MediaStorageService;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.retailer.entity.Retailer;
import com.bicap.modules.retailer.repository.RetailerRepository;
import com.bicap.modules.shipment.entity.Shipment;
import com.bicap.modules.shipment.repository.ShipmentRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private final MediaStorageService mediaStorageService;
    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final OrderRepository orderRepository;
    private final RetailerRepository retailerRepository;
    private final ShipmentRepository shipmentRepository;
    private final DriverRepository driverRepository;

    public MediaController(MediaStorageService mediaStorageService,
                           UserRepository userRepository,
                           FarmRepository farmRepository,
                           OrderRepository orderRepository,
                           RetailerRepository retailerRepository,
                           ShipmentRepository shipmentRepository,
                           DriverRepository driverRepository) {
        this.mediaStorageService = mediaStorageService;
        this.userRepository = userRepository;
        this.farmRepository = farmRepository;
        this.orderRepository = orderRepository;
        this.retailerRepository = retailerRepository;
        this.shipmentRepository = shipmentRepository;
        this.driverRepository = driverRepository;
    }

    @GetMapping("/{id}/download")
    public void download(@PathVariable Long id, HttpServletResponse response) throws IOException {
        MediaStorageService.StoredMedia storedMedia = mediaStorageService.getMedia(id);
        MediaFile mediaFile = storedMedia.mediaFile();
        authorize(mediaFile);

        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + sanitize(mediaFile.getOriginalFilename()) + "\"");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setContentType(mediaFile.getContentType());
        response.setContentLengthLong(mediaFile.getFileSize());
        Files.copy(storedMedia.path(), response.getOutputStream());
        response.flushBuffer();
    }

    private void authorize(MediaFile mediaFile) {
        if ("PUBLIC".equalsIgnoreCase(mediaFile.getVisibility())) {
            return;
        }
        Long currentUserId = SecurityUtils.getCurrentUserIdOrNull();
        if (currentUserId == null) {
            throw new BusinessException("Bạn cần đăng nhập để tải file này");
        }
        User currentUser = userRepository.findById(currentUserId).orElseThrow(() -> new BusinessException("Không tìm thấy người dùng hiện tại"));
        if (isOwner(mediaFile, currentUser) || hasAnyRole("ADMIN") || canAccessEntityMedia(mediaFile, currentUserId)) {
            return;
        }
        throw new BusinessException("Không có quyền truy cập file này");
    }

    private boolean isOwner(MediaFile mediaFile, User currentUser) {
        return mediaFile.getOwnerUser() != null
                && mediaFile.getOwnerUser().getUserId() != null
                && mediaFile.getOwnerUser().getUserId().equals(currentUser.getUserId());
    }

    private boolean canAccessEntityMedia(MediaFile mediaFile, Long currentUserId) {
        String entityType = mediaFile.getEntityType() == null ? "" : mediaFile.getEntityType().trim().toUpperCase();
        if ("FARM_LICENSE".equals(entityType)) {
            return canAccessFarm(mediaFile.getEntityId(), currentUserId);
        }
        if (entityType.contains("SHIPMENT") || entityType.contains("DELIVERY") || entityType.contains("ORDER")) {
            return canAccessShipmentOrOrderProof(entityType, mediaFile.getEntityId(), currentUserId);
        }
        return false;
    }

    private boolean canAccessFarm(Long farmId, Long currentUserId) {
        if (farmId == null) {
            return false;
        }
        return farmRepository.findById(farmId)
                .map(Farm::getOwnerUser)
                .map(User::getUserId)
                .filter(currentUserId::equals)
                .isPresent();
    }

    private boolean canAccessShipmentOrOrderProof(String entityType, Long entityId, Long currentUserId) {
        if (entityId == null) {
            return false;
        }
        if (entityType.contains("SHIPMENT")) {
            Shipment shipment = shipmentRepository.findById(entityId).orElse(null);
            return shipment != null && canAccessShipment(shipment, currentUserId);
        }
        Order order = orderRepository.findById(entityId).orElse(null);
        return order != null && canAccessOrder(order, currentUserId);
    }

    private boolean canAccessShipment(Shipment shipment, Long currentUserId) {
        if (hasAnyRole("SHIPPING_MANAGER") && currentUserId.equals(shipment.getShippingManagerUserId())) {
            return true;
        }
        if (hasAnyRole("DRIVER")) {
            Driver driver = driverRepository.findByUserUserId(currentUserId).orElse(null);
            if (driver != null && driver.getDriverId().equals(shipment.getDriverId())) {
                return true;
            }
        }
        Order order = orderRepository.findById(shipment.getOrderId()).orElse(null);
        return order != null && canAccessOrder(order, currentUserId);
    }

    private boolean canAccessOrder(Order order, Long currentUserId) {
        Farm farm = farmRepository.findByOwnerUserUserId(currentUserId).orElse(null);
        if (farm != null && farm.getFarmId().equals(order.getFarmId())) {
            return true;
        }
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId).orElse(null);
        return retailer != null && retailer.getRetailerId().equals(order.getRetailerId());
    }

    private boolean hasAnyRole(String... roles) {
        var principal = SecurityUtils.getCurrentUserOrNull();
        if (principal == null || principal.getAuthorities() == null) return false;
        java.util.Set<String> granted = principal.getAuthorities().stream().map(a -> a.getAuthority()).collect(java.util.stream.Collectors.toSet());
        for (String role : roles) if (granted.contains(role) || granted.contains("ROLE_" + role)) return true;
        return false;
    }

    private String sanitize(String filename) {
        return filename == null ? "file" : filename.replaceAll("[\\r\\n\"]", "_");
    }
}
