package com.bicap.modules.farm.service;

import com.bicap.core.AuditLogService;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.user.service.UserService;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.farm.dto.CreateFarmRequest;
import com.bicap.modules.farm.dto.UpdateFarmRequest;
import com.bicap.modules.farm.dto.FarmResponse;
import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FarmService {

    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public FarmService(FarmRepository farmRepository, UserRepository userRepository, 
                       AuditLogService auditLogService) {
        this.farmRepository = farmRepository;
        this.userRepository = userRepository;
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
        farm.setCertificationStatus("NONE");
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

        if (!farm.getOwnerUser().getUserId().equals(currentUserId)) {
            throw new BusinessException("Bạn không có quyền cập nhật.");
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
    public FarmResponse changeApprovalStatus(Long farmId, String status, Long adminId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new BusinessException("Farm không tồn tại"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException("Admin không tồn tại"));

        farm.setApprovalStatus(status.toUpperCase());
        farm.setReviewedByUser(admin);
        farm.setReviewedAt(LocalDateTime.now());

        Farm saved = farmRepository.save(farm);
        auditLogService.log(adminId, "APPROVE_FARM", "FARM", saved.getFarmId());
        return mapToResponse(saved);
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
                .build();
    }
}
