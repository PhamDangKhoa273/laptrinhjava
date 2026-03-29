package com.bicap.backend.service;

import com.bicap.backend.dto.CreateFarmRequest;
import com.bicap.backend.dto.FarmResponse;
import com.bicap.backend.dto.UpdateFarmRequest;
import com.bicap.backend.entity.Farm;
import com.bicap.backend.entity.User;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.FarmRepository;
import com.bicap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmService {

    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;

    @Transactional
    public FarmResponse createFarm(CreateFarmRequest request, Long currentUserId) {
        User ownerUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));

        if (!userService.hasRole(ownerUser, RoleName.FARM)) {
            throw new BusinessException("Chỉ FARM mới được tạo hồ sơ farm");
        }

        if (farmRepository.findByOwnerUserUserId(currentUserId).isPresent()) {
            throw new BusinessException("User này đã có hồ sơ farm");
        }

        if (farmRepository.existsByFarmCode(request.getFarmCode().trim())) {
            throw new BusinessException("farmCode đã tồn tại");
        }

        if (farmRepository.existsByBusinessLicenseNo(request.getBusinessLicenseNo().trim())) {
            throw new BusinessException("businessLicenseNo đã tồn tại");
        }

        Farm farm = new Farm();
        farm.setOwnerUser(ownerUser);
        farm.setFarmCode(request.getFarmCode().trim());
        farm.setFarmName(request.getFarmName().trim());
        farm.setBusinessLicenseNo(request.getBusinessLicenseNo().trim());
        farm.setAddress(request.getAddress());
        farm.setProvince(request.getProvince());
        farm.setDescription(request.getDescription());
        farm.setCertificationStatus("PENDING");
        farm.setApprovalStatus("PENDING");

        Farm saved = farmRepository.save(farm);

        auditLogService.log(currentUserId, "CREATE_FARM", "FARM", saved.getFarmId());

        return toResponse(saved);
    }

    public List<FarmResponse> getAllFarms() {
        return farmRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public FarmResponse getFarmById(Long farmId) {
        return toResponse(getFarmEntityById(farmId));
    }

    public FarmResponse getMyFarm(Long currentUserId) {
        Farm farm = farmRepository.findByOwnerUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("User hiện tại chưa có hồ sơ farm"));
        return toResponse(farm);
    }

    @Transactional
    public FarmResponse updateFarm(Long farmId, UpdateFarmRequest request, Long currentUserId) {
        Farm farm = getFarmEntityById(farmId);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isOwner = farm.getOwnerUser() != null
                && farm.getOwnerUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new BusinessException("Bạn không có quyền cập nhật farm này");
        }

        if (!farm.getBusinessLicenseNo().equalsIgnoreCase(request.getBusinessLicenseNo().trim())
                && farmRepository.existsByBusinessLicenseNo(request.getBusinessLicenseNo().trim())) {
            throw new BusinessException("businessLicenseNo đã tồn tại");
        }

        farm.setFarmName(request.getFarmName().trim());
        farm.setBusinessLicenseNo(request.getBusinessLicenseNo().trim());
        farm.setAddress(request.getAddress());
        farm.setProvince(request.getProvince());
        farm.setDescription(request.getDescription());

        Farm saved = farmRepository.save(farm);

        auditLogService.log(currentUserId, "UPDATE_FARM", "FARM", saved.getFarmId());

        return toResponse(saved);
    }

    @Transactional
    public FarmResponse reviewFarm(Long farmId, Long reviewerUserId, String approvalStatus, String certificationStatus) {
        Farm farm = getFarmEntityById(farmId);

        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy reviewer"));

        if (!userService.hasRole(reviewer, RoleName.ADMIN)) {
            throw new BusinessException("reviewed_by_user_id phải là ADMIN");
        }

        farm.setReviewedByUser(reviewer);
        farm.setReviewedAt(LocalDateTime.now());

        if (approvalStatus != null && !approvalStatus.isBlank()) {
            farm.setApprovalStatus(approvalStatus.trim().toUpperCase());
        }
        if (certificationStatus != null && !certificationStatus.isBlank()) {
            farm.setCertificationStatus(certificationStatus.trim().toUpperCase());
        }

        Farm saved = farmRepository.save(farm);

        auditLogService.log(reviewerUserId, "REVIEW_FARM", "FARM", saved.getFarmId());

        return toResponse(saved);
    }

    public Farm getFarmEntityById(Long farmId) {
        return farmRepository.findById(farmId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy farm"));
    }

    private FarmResponse toResponse(Farm farm) {
        return FarmResponse.builder()
                .farmId(farm.getFarmId())
                .farmCode(farm.getFarmCode())
                .farmName(farm.getFarmName())
                .businessLicenseNo(farm.getBusinessLicenseNo())
                .certificationStatus(farm.getCertificationStatus())
                .approvalStatus(farm.getApprovalStatus())
                .address(farm.getAddress())
                .province(farm.getProvince())
                .description(farm.getDescription())
                .ownerUserId(farm.getOwnerUser() != null ? farm.getOwnerUser().getUserId() : null)
                .ownerFullName(farm.getOwnerUser() != null ? farm.getOwnerUser().getFullName() : null)
                .reviewedByUserId(farm.getReviewedByUser() != null ? farm.getReviewedByUser().getUserId() : null)
                .reviewedByFullName(farm.getReviewedByUser() != null ? farm.getReviewedByUser().getFullName() : null)
                .reviewedAt(farm.getReviewedAt())
                .build();
    }
}