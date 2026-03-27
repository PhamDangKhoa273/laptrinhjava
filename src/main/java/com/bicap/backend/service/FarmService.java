package com.bicap.backend.service;

import com.bicap.backend.entity.Farm;
import com.bicap.backend.entity.User;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.FarmRepository;
import com.bicap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmService {

    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public Farm createFarm(Farm farm, Long ownerUserId) {
        User ownerUser = userRepository.findById(ownerUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy owner user"));

        if (!userService.hasRole(ownerUser, RoleName.FARM)) {
            throw new BusinessException("owner_user_id phải có role FARM");
        }

        if (farmRepository.findByOwnerUserUserId(ownerUserId).isPresent()) {
            throw new BusinessException("User này đã có hồ sơ farm");
        }

        if (farmRepository.existsByFarmCode(farm.getFarmCode())) {
            throw new BusinessException("farmCode đã tồn tại");
        }

        if (farmRepository.existsByBusinessLicenseNo(farm.getBusinessLicenseNo())) {
            throw new BusinessException("businessLicenseNo đã tồn tại");
        }

        farm.setOwnerUser(ownerUser);
        return farmRepository.save(farm);
    }

    public List<Farm> getAllFarms() {
        return farmRepository.findAll();
    }

    public Farm getFarmById(Long farmId) {
        return farmRepository.findById(farmId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy farm"));
    }

    public Farm updateFarm(Long farmId, Farm request) {
        Farm farm = getFarmById(farmId);

        farm.setFarmName(request.getFarmName());
        farm.setBusinessLicenseNo(request.getBusinessLicenseNo());
        farm.setCertificationStatus(request.getCertificationStatus());
        farm.setApprovalStatus(request.getApprovalStatus());
        farm.setAddress(request.getAddress());
        farm.setProvince(request.getProvince());
        farm.setDescription(request.getDescription());

        return farmRepository.save(farm);
    }

    public Farm reviewFarm(Long farmId, Long reviewerUserId, String approvalStatus, String certificationStatus) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy farm"));

        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy reviewer"));

        if (!userService.hasRole(reviewer, RoleName.ADMIN)) {
            throw new BusinessException("reviewed_by_user_id phải là ADMIN");
        }

        farm.setReviewedByUser(reviewer);
        farm.setReviewedAt(LocalDateTime.now());

        if (approvalStatus != null) {
            farm.setApprovalStatus(approvalStatus);
        }
        if (certificationStatus != null) {
            farm.setCertificationStatus(certificationStatus);
        }

        return farmRepository.save(farm);
    }
}