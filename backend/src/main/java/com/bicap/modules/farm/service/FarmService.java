package com.bicap.modules.farm.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.farm.dto.CreateFarmRequest;
import com.bicap.modules.farm.dto.FarmResponse;
import com.bicap.modules.farm.dto.UpdateFarmRequest;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.media.dto.MediaFileResponse;
import com.bicap.modules.media.entity.MediaFile;
import com.bicap.modules.media.repository.MediaFileRepository;
import com.bicap.modules.media.service.MediaStorageService;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class FarmService {

    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final MediaStorageService mediaStorageService;
    private final MediaFileRepository mediaFileRepository;

    public FarmService(FarmRepository farmRepository,
                       UserRepository userRepository,
                       UserService userService,
                       AuditLogService auditLogService,
                       MediaStorageService mediaStorageService,
                       MediaFileRepository mediaFileRepository) {
        this.farmRepository = farmRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.auditLogService = auditLogService;
        this.mediaStorageService = mediaStorageService;
        this.mediaFileRepository = mediaFileRepository;
    }

    public List<FarmResponse> getAllFarms() {
        Long currentUserId = SecurityUtils.getCurrentUserIdOrNull();
        boolean isAdmin = currentUserHasRole(RoleName.ADMIN, currentUserId);
        return farmRepository.findAll().stream()
                .filter(farm -> isAdmin || isApproved(farm) || isOwner(farm, currentUserId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FarmResponse getFarmById(Long id) {
        Farm farm = farmRepository.findById(id).orElseThrow(() -> new BusinessException("Farm không tồn tại"));
        Long currentUserId = SecurityUtils.getCurrentUserIdOrNull();
        if (!currentUserHasRole(RoleName.ADMIN, currentUserId) && !isOwner(farm, currentUserId) && !isApproved(farm)) {
            throw new BusinessException("Bạn không có quyền xem hồ sơ nông trại này");
        }
        return mapToResponse(farm);
    }

    public FarmResponse getMyFarm(Long ownerId) {
        Farm farm = farmRepository.findByOwnerUser_UserId(ownerId)
                .orElseThrow(() -> new BusinessException("Bạn chưa đăng ký nông trại nào."));
        return mapToResponse(farm);
    }

    @Transactional
    public FarmResponse createFarm(CreateFarmRequest request, Long currentUserId) {
        User owner = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("User không tồn tại"));

        if (!userService.hasRole(owner, RoleName.FARM)) {
            throw new BusinessException("Bạn không có quyền đăng ký nông trại");
        }
        if (farmRepository.findByOwnerUserUserId(currentUserId).isPresent()) {
            throw new BusinessException("Người dùng này đã có nông trại");
        }

        String normalizedFarmCode = normalizeFarmCode(request.getFarmCode());
        String normalizedLicenseNo = normalizeLicenseNo(request.getBusinessLicenseNo());

        if (farmRepository.existsByFarmCode(normalizedFarmCode)) {
            throw new BusinessException("Mã nông trại đã tồn tại");
        }
        if (farmRepository.existsByBusinessLicenseNo(normalizedLicenseNo)) {
            throw new BusinessException("Số giấy phép kinh doanh đã tồn tại");
        }

        Farm farm = new Farm();
        farm.setFarmCode(normalizedFarmCode);
        farm.setFarmName(normalizeText(request.getFarmName()));
        farm.setFarmType(normalizeOptionalText(request.getFarmType()));
        farm.setBusinessLicenseNo(normalizedLicenseNo);
        farm.setAddress(normalizeText(request.getAddress()));
        farm.setProvince(normalizeText(request.getProvince()));
        farm.setTotalArea(request.getTotalArea());
        farm.setContactPerson(normalizeOptionalText(request.getContactPerson()));
        farm.setPhone(owner.getPhone());
        farm.setEmail(owner.getEmail());
        farm.setDescription(normalizeOptionalText(request.getDescription()));
        farm.setCertificationStatus("PENDING");
        farm.setApprovalStatus("PENDING");
        farm.setReviewComment("Hồ sơ đang chờ admin xét duyệt.");
        farm.setOwnerUser(owner);

        Farm saved = farmRepository.save(farm);
        auditLogService.log(currentUserId, "CREATE_FARM", "FARM", saved.getFarmId());
        return mapToResponse(saved);
    }

    @Transactional
    public FarmResponse updateFarm(Long farmId, UpdateFarmRequest request, Long currentUserId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new BusinessException("Farm không tồn tại"));

        boolean isOwner = farm.getOwnerUser() != null && farm.getOwnerUser().getUserId().equals(currentUserId);
        if (!isOwner) {
            User actingUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new BusinessException("User không tồn tại"));
            if (!userService.hasRole(actingUser, RoleName.ADMIN)) {
                throw new BusinessException("Bạn không có quyền cập nhật.");
            }
        }

        String normalizedLicenseNo = normalizeLicenseNo(request.getBusinessLicenseNo());
        if (farm.getBusinessLicenseNo() != null
                && !normalizedLicenseNo.equalsIgnoreCase(farm.getBusinessLicenseNo())
                && farmRepository.existsByBusinessLicenseNo(normalizedLicenseNo)) {
            throw new BusinessException("Số giấy phép kinh doanh đã tồn tại");
        }

        farm.setFarmName(normalizeText(request.getFarmName()));
        farm.setFarmType(normalizeOptionalText(request.getFarmType()));
        farm.setBusinessLicenseNo(normalizedLicenseNo);
        farm.setAddress(normalizeText(request.getAddress()));
        farm.setProvince(normalizeText(request.getProvince()));
        farm.setTotalArea(request.getTotalArea());
        farm.setContactPerson(normalizeOptionalText(request.getContactPerson()));
        farm.setDescription(normalizeOptionalText(request.getDescription()));

        Farm saved = farmRepository.save(farm);
        auditLogService.log(currentUserId, "UPDATE_FARM", "FARM", saved.getFarmId());
        return mapToResponse(saved);
    }

    @Transactional
    public FarmResponse changeApprovalStatus(Long farmId, String status, String reviewComment, Long adminId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new BusinessException("Farm không tồn tại"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException("Admin không tồn tại"));

        if (!userService.hasRole(admin, RoleName.ADMIN)) {
            throw new BusinessException("Bạn không có quyền duyệt nông trại");
        }

        String normalizedStatus = status.toUpperCase();
        if (!List.of("APPROVED", "REJECTED", "PENDING", "DEACTIVATED").contains(normalizedStatus)) {
            throw new BusinessException("Trạng thái duyệt nông trại không hợp lệ");
        }
        if ("REJECTED".equals(normalizedStatus) && (reviewComment == null || reviewComment.trim().isEmpty())) {
            throw new BusinessException("Từ chối nông trại phải có ghi chú đánh giá");
        }

        farm.setApprovalStatus(normalizedStatus);
        if ("APPROVED".equals(normalizedStatus)) {
            farm.setCertificationStatus("VALID");
        }
        if ("REJECTED".equals(normalizedStatus)) {
            farm.setCertificationStatus("PENDING_REVIEW");
        }
        if ("PENDING".equals(normalizedStatus)) {
            farm.setCertificationStatus("PENDING");
        }
        farm.setReviewComment(reviewComment == null ? null : reviewComment.trim());
        farm.setReviewedByUser(admin);
        farm.setReviewedAt(LocalDateTime.now());

        Farm saved = farmRepository.save(farm);
        auditLogService.log(adminId, "CHANGE_APPROVAL_STATUS", "FARM", saved.getFarmId());
        return mapToResponse(saved);
    }

    @Transactional
    public FarmResponse adminUpdateFarm(Long farmId, UpdateFarmRequest request, Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException("Admin không tồn tại"));
        if (!userService.hasRole(admin, RoleName.ADMIN)) {
            throw new BusinessException("Bạn không có quyền cập nhật hồ sơ nông trại");
        }
        return updateFarm(farmId, request, adminId);
    }

    @Transactional
    public void deactivateFarm(Long farmId, Long adminId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new BusinessException("Farm không tồn tại"));
        farm.setApprovalStatus("DEACTIVATED");
        farmRepository.save(farm);
        auditLogService.log(adminId, "DEACTIVATE_FARM", "FARM", farmId);
    }

    @Transactional
    public FarmResponse uploadBusinessLicense(Long farmId, MultipartFile file, Long currentUserId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new BusinessException("Farm không tồn tại"));

        boolean isOwner = farm.getOwnerUser() != null && farm.getOwnerUser().getUserId().equals(currentUserId);
        if (!isOwner) {
            User actingUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new BusinessException("User không tồn tại"));
            if (!userService.hasRole(actingUser, RoleName.ADMIN)) {
                throw new BusinessException("Bạn không có quyền upload giấy phép cho nông trại này.");
            }
        }

        MediaFileResponse media = mediaStorageService.storeProof(file, "FARM_LICENSE", farmId);
        farm.setBusinessLicenseFileUrl(media.getFileUrl());
        if (!"PENDING".equalsIgnoreCase(farm.getApprovalStatus())) {
            farm.setApprovalStatus("PENDING");
            farm.setCertificationStatus("PENDING");
            farm.setReviewComment("Hồ sơ giấy phép vừa được cập nhật, chờ admin duyệt lại.");
            farm.setReviewedByUser(null);
            farm.setReviewedAt(null);
        }
        Farm saved = farmRepository.save(farm);
        auditLogService.log(currentUserId, "UPLOAD_BUSINESS_LICENSE", "FARM", saved.getFarmId());
        return mapToResponse(saved);
    }

    private FarmResponse mapToResponse(Farm farm) {
        MediaFile latestLicense = resolveBusinessLicenseMedia(farm);
        return FarmResponse.builder()
                .farmId(farm.getFarmId())
                .farmCode(farm.getFarmCode())
                .farmName(farm.getFarmName())
                .farmType(farm.getFarmType())
                .address(farm.getAddress())
                .province(farm.getProvince())
                .totalArea(farm.getTotalArea())
                .contactPerson(farm.getContactPerson())
                .phone(farm.getPhone())
                .email(farm.getEmail())
                .businessLicenseNo(farm.getBusinessLicenseNo())
                .businessLicenseFileUrl(resolveBusinessLicenseFileUrl(farm, latestLicense))
                .businessLicenseFileName(latestLicense != null ? latestLicense.getOriginalFilename() : null)
                .businessLicenseFileSize(latestLicense != null ? latestLicense.getFileSize() : null)
                .businessLicenseUploadedAt(latestLicense != null ? latestLicense.getCreatedAt() : null)
                .certificationStatus(farm.getCertificationStatus())
                .approvalStatus(farm.getApprovalStatus())
                .ownerId(farm.getOwnerUser() != null ? farm.getOwnerUser().getUserId() : null)
                .ownerName(farm.getOwnerUser() != null ? farm.getOwnerUser().getFullName() : null)
                .reviewedByUserId(farm.getReviewedByUser() != null ? farm.getReviewedByUser().getUserId() : null)
                .reviewedByFullName(farm.getReviewedByUser() != null ? farm.getReviewedByUser().getFullName() : null)
                .reviewComment(farm.getReviewComment())
                .reviewedAt(farm.getReviewedAt())
                .description(farm.getDescription())
                .build();
    }

    private String resolveBusinessLicenseFileUrl(Farm farm, MediaFile latestLicense) {
        if (farm.getBusinessLicenseFileUrl() != null && !farm.getBusinessLicenseFileUrl().isBlank()) {
            return farm.getBusinessLicenseFileUrl();
        }
        return latestLicense != null ? toFileUrl(latestLicense) : null;
    }

    private MediaFile resolveBusinessLicenseMedia(Farm farm) {
        if (mediaFileRepository == null || farm.getFarmId() == null) {
            return null;
        }
        return mediaFileRepository.findTopByEntityTypeAndEntityIdOrderByCreatedAtDesc("FARM_LICENSE", farm.getFarmId())
                .orElse(null);
    }

    private String toFileUrl(MediaFile mediaFile) {
        String storagePath = mediaFile.getStoragePath();
        if (storagePath == null || storagePath.isBlank()) {
            return null;
        }
        String normalized = storagePath.replace('\\', '/');
        int marker = normalized.indexOf("/uploads/");
        if (marker >= 0) {
            return normalized.substring(marker);
        }
        int uploadsIndex = normalized.indexOf("uploads/");
        if (uploadsIndex >= 0) {
            return "/" + normalized.substring(uploadsIndex);
        }
        return normalized;
    }

    private boolean isApproved(Farm farm) {
        return farm.getApprovalStatus() != null && "APPROVED".equalsIgnoreCase(farm.getApprovalStatus());
    }

    private boolean isOwner(Farm farm, Long currentUserId) {
        return currentUserId != null
                && farm.getOwnerUser() != null
                && currentUserId.equals(farm.getOwnerUser().getUserId());
    }

    private boolean currentUserHasRole(RoleName roleName, Long currentUserId) {
        if (currentUserId == null) {
            return false;
        }
        User currentUser = userRepository.findById(currentUserId).orElse(null);
        return currentUser != null && userService.hasRole(currentUser, roleName);
    }

    private String normalizeFarmCode(String farmCode) {
        return normalizeText(farmCode).toUpperCase(Locale.ROOT).replaceAll("\\s+", "-");
    }

    private String normalizeLicenseNo(String licenseNo) {
        return normalizeText(licenseNo).toUpperCase(Locale.ROOT);
    }

    private String normalizeText(String value) {
        if (value == null) {
            throw new BusinessException("Dữ liệu bắt buộc không được để trống");
        }
        String normalized = value.trim().replaceAll("\\s+", " ");
        if (normalized.isBlank()) {
            throw new BusinessException("Dữ liệu bắt buộc không được để trống");
        }
        return normalized;
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().replaceAll("\\s+", " ");
        return normalized.isBlank() ? null : normalized;
    }
}
