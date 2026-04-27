package com.bicap.modules.retailer.service;

import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.AuditLogService;
import com.bicap.modules.media.dto.MediaFileResponse;
import com.bicap.modules.media.service.MediaStorageService;
import com.bicap.modules.retailer.dto.CreateRetailerRequest;
import com.bicap.modules.retailer.dto.RetailerResponse;
import com.bicap.modules.retailer.dto.UpdateRetailerRequest;
import com.bicap.modules.retailer.entity.Retailer;
import com.bicap.modules.retailer.repository.RetailerRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RetailerService {

    private final RetailerRepository retailerRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final MediaStorageService mediaStorageService;

    @Transactional
    public RetailerResponse create(CreateRetailerRequest request, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));

        if (!userService.hasRole(currentUser, RoleName.RETAILER)) {
            throw new BusinessException("Chỉ RETAILER mới được tạo hồ sơ retailer");
        }

        if (retailerRepository.findByUserUserId(currentUserId).isPresent()) {
            throw new BusinessException("User này đã có hồ sơ retailer");
        }

        if (retailerRepository.existsByRetailerCode(request.getRetailerCode().trim())) {
            throw new BusinessException("retailerCode đã tồn tại");
        }

        if (retailerRepository.existsByBusinessLicenseNo(request.getBusinessLicenseNo().trim())) {
            throw new BusinessException("businessLicenseNo đã tồn tại");
        }

        Retailer retailer = new Retailer();
        retailer.setUser(currentUser);
        retailer.setRetailerCode(request.getRetailerCode().trim());
        retailer.setRetailerName(request.getRetailerName().trim());
        retailer.setBusinessLicenseNo(request.getBusinessLicenseNo().trim());
        retailer.setAddress(request.getAddress().trim());
        retailer.setStatus(normalizeStatus(request.getStatus()));

        Retailer saved = retailerRepository.save(retailer);
        if (auditLogService != null) { auditLogService.log(currentUserId, "UPDATE_RETAILER", "RETAILER", saved.getRetailerId()); }
        return toResponse(saved);
    }

    public List<RetailerResponse> getAll() {
        return retailerRepository.findAll().stream().map(this::toResponse).toList();
    }

    public RetailerResponse getById(Long retailerId, Long currentUserId) {
        Retailer retailer = getEntityById(retailerId);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isOwner = retailer.getUser() != null && retailer.getUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new BusinessException("Bạn không có quyền xem retailer này");
        }

        return toResponse(retailer);
    }

    public RetailerResponse getMyRetailer(Long currentUserId) {
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("User hiện tại chưa có hồ sơ retailer"));
        return toResponse(retailer);
    }

    @Transactional
    public RetailerResponse update(Long retailerId, UpdateRetailerRequest request, Long currentUserId) {
        Retailer retailer = getEntityById(retailerId);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isOwner = retailer.getUser() != null && retailer.getUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new BusinessException("Bạn không có quyền cập nhật retailer này");
        }

        if (!retailer.getBusinessLicenseNo().equalsIgnoreCase(request.getBusinessLicenseNo().trim())
                && retailerRepository.existsByBusinessLicenseNo(request.getBusinessLicenseNo().trim())) {
            throw new BusinessException("businessLicenseNo đã tồn tại");
        }

        retailer.setRetailerName(request.getRetailerName().trim());
        retailer.setBusinessLicenseNo(request.getBusinessLicenseNo().trim());
        retailer.setAddress(request.getAddress().trim());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            retailer.setStatus(request.getStatus().trim().toUpperCase());
        }

        Retailer saved = retailerRepository.save(retailer);
        if (auditLogService != null) { auditLogService.log(currentUserId, "DEACTIVATE_RETAILER", "RETAILER", saved.getRetailerId()); }
        return toResponse(saved);
    }

    @Transactional
    public RetailerResponse deactivate(Long retailerId, Long currentUserId) {
        Retailer retailer = getEntityById(retailerId);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isOwner = retailer.getUser() != null && retailer.getUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new BusinessException("Bạn không có quyền ngừng kích hoạt retailer này");
        }

        retailer.setStatus("INACTIVE");
        Retailer saved = retailerRepository.save(retailer);
        if (auditLogService != null) { auditLogService.log(currentUserId, "CREATE_RETAILER", "RETAILER", saved.getRetailerId()); }
        return toResponse(saved);
    }

    public Retailer getEntityById(Long retailerId) {
        return retailerRepository.findById(retailerId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy retailer"));
    }

    @Transactional
    public RetailerResponse uploadBusinessLicense(Long retailerId, MultipartFile file, Long currentUserId) {
        Retailer retailer = getEntityById(retailerId);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isOwner = retailer.getUser() != null && retailer.getUser().getUserId().equals(currentUserId);
        if (!isAdmin && !isOwner) {
            throw new BusinessException("Bạn không có quyền upload giấy phép cho retailer này");
        }

        MediaFileResponse media = mediaStorageService.storeProof(file, "RETAILER_LICENSE", retailerId);
        retailer.setBusinessLicenseFileUrl(media.getFileUrl());
        retailer.setBusinessLicenseFileName(media.getOriginalFilename());
        retailer.setBusinessLicenseFileSize(media.getFileSize());
        retailer.setBusinessLicenseUploadedAt(media.getCreatedAt());
        Retailer saved = retailerRepository.save(retailer);
        if (auditLogService != null) { auditLogService.log(currentUserId, "UPLOAD_BUSINESS_LICENSE", "RETAILER", saved.getRetailerId()); }
        return toResponse(saved);
    }

    public RetailerResponse previewBusinessLicense(Long retailerId, Long currentUserId) {
        Retailer retailer = getEntityById(retailerId);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));
        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isOwner = retailer.getUser() != null && retailer.getUser().getUserId().equals(currentUserId);
        if (!isAdmin && !isOwner) {
            throw new BusinessException("Bạn không có quyền xem giấy phép retailer này");
        }
        return toResponse(retailer);
    }

    private RetailerResponse toResponse(Retailer retailer) {
        return RetailerResponse.builder()
                .retailerId(retailer.getRetailerId())
                .retailerCode(retailer.getRetailerCode())
                .retailerName(retailer.getRetailerName())
                .businessLicenseNo(retailer.getBusinessLicenseNo())
                .address(retailer.getAddress())
                .status(retailer.getStatus())
                .businessLicenseFileUrl(retailer.getBusinessLicenseFileUrl())
                .businessLicenseFileName(retailer.getBusinessLicenseFileName())
                .businessLicenseFileSize(retailer.getBusinessLicenseFileSize())
                .businessLicenseUploadedAt(retailer.getBusinessLicenseUploadedAt())
                .userId(retailer.getUser() != null ? retailer.getUser().getUserId() : null)
                .userFullName(retailer.getUser() != null ? retailer.getUser().getFullName() : null)
                .build();
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "ACTIVE";
        }
        return status.trim().toUpperCase();
    }
}
