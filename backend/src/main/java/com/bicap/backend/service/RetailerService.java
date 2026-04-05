package com.bicap.backend.service;

import com.bicap.backend.dto.CreateRetailerRequest;
import com.bicap.backend.dto.RetailerResponse;
import com.bicap.backend.dto.UpdateRetailerRequest;
import com.bicap.backend.entity.Retailer;
import com.bicap.backend.entity.User;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.RetailerRepository;
import com.bicap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RetailerService {

    private final RetailerRepository retailerRepository;
    private final UserRepository userRepository;
    private final UserService userService;

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

        return toResponse(retailerRepository.save(retailer));
    }

    public List<RetailerResponse> getAll() {
        return retailerRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public RetailerResponse getById(Long retailerId, Long currentUserId) {
        Retailer retailer = getEntityById(retailerId);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isOwner = retailer.getUser() != null
                && retailer.getUser().getUserId().equals(currentUserId);

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
        boolean isOwner = retailer.getUser() != null
                && retailer.getUser().getUserId().equals(currentUserId);

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

        return toResponse(retailerRepository.save(retailer));
    }

    public Retailer getEntityById(Long retailerId) {
        return retailerRepository.findById(retailerId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy retailer"));
    }

    private RetailerResponse toResponse(Retailer retailer) {
        return RetailerResponse.builder()
                .retailerId(retailer.getRetailerId())
                .retailerCode(retailer.getRetailerCode())
                .retailerName(retailer.getRetailerName())
                .businessLicenseNo(retailer.getBusinessLicenseNo())
                .address(retailer.getAddress())
                .status(retailer.getStatus())
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
