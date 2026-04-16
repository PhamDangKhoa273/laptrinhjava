package com.bicap.modules.farm.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.farm.dto.CreateFarmRequest;
import com.bicap.modules.farm.dto.FarmResponse;
import com.bicap.modules.farm.dto.UpdateFarmRequest;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FarmService {

    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;

    public FarmService(FarmRepository farmRepository,
                       UserRepository userRepository,
                       UserService userService,
                       AuditLogService auditLogService) {
        this.farmRepository = farmRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.auditLogService = auditLogService;
    }

    public List<FarmResponse> getAllFarms() {
        return farmRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public FarmResponse getFarmById(Long id) {
        Farm farm = farmRepository.findById(id).orElseThrow(() -> new BusinessException("Farm không tồn tại"));
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
        if (farmRepository.existsByFarmCode(request.getFarmCode())) {
            throw new BusinessException("Mã nông trại đã tồn tại");
        }
        if (farmRepository.existsByBusinessLicenseNo(request.getBusinessLicenseNo())) {
            throw new BusinessException("Số giấy phép kinh doanh đã tồn tại");
        }

        Farm farm = new Farm();
        farm.setFarmCode(request.getFarmCode());
        farm.setFarmName(request.getFarmName());
        farm.setFarmType(request.getFarmType());
        farm.setBusinessLicenseNo(request.getBusinessLicenseNo());
        farm.setAddress(request.getAddress());
        farm.setProvince(request.getProvince());
        farm.setTotalArea(request.getTotalArea());
        farm.setContactPerson(request.getContactPerson());
        farm.setPhone(owner.getPhone());
        farm.setEmail(owner.getEmail());
        farm.setDescription(request.getDescription());
        farm.setCertificationStatus("PENDING");
        farm.setApprovalStatus("PENDING");
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

        farm.setFarmName(request.getFarmName());
        farm.setFarmType(request.getFarmType());
        farm.setBusinessLicenseNo(request.getBusinessLicenseNo());
        farm.setAddress(request.getAddress());
        farm.setProvince(request.getProvince());
        farm.setTotalArea(request.getTotalArea());
        farm.setContactPerson(request.getContactPerson());
        farm.setDescription(request.getDescription());

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

    private FarmResponse mapToResponse(Farm farm) {
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
}
