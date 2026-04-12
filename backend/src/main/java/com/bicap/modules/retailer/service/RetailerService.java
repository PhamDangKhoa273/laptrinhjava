package com.bicap.modules.retailer.service;

import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
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

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class RetailerService {

    private final RetailerRepository retailerRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public RetailerResponse create(CreateRetailerRequest request, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y user hiá»‡n táº¡i"));

        if (!userService.hasRole(currentUser, RoleName.RETAILER)) {
            throw new BusinessException("Chá»‰ RETAILER má»›i Ä‘Æ°á»£c táº¡o há»“ sÆ¡ retailer");
        }

        if (retailerRepository.findByUserUserId(currentUserId).isPresent()) {
            throw new BusinessException("User nÃ y Ä‘Ã£ cÃ³ há»“ sÆ¡ retailer");
        }

        if (retailerRepository.existsByRetailerCode(request.getRetailerCode().trim())) {
            throw new BusinessException("retailerCode Ä‘Ã£ tá»“n táº¡i");
        }

        if (retailerRepository.existsByBusinessLicenseNo(request.getBusinessLicenseNo().trim())) {
            throw new BusinessException("businessLicenseNo Ä‘Ã£ tá»“n táº¡i");
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
                .orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y user hiá»‡n táº¡i"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isOwner = retailer.getUser() != null
                && retailer.getUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new BusinessException("Báº¡n khÃ´ng cÃ³ quyá»n xem retailer nÃ y");
        }

        return toResponse(retailer);
    }

    public RetailerResponse getMyRetailer(Long currentUserId) {
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("User hiá»‡n táº¡i chÆ°a cÃ³ há»“ sÆ¡ retailer"));
        return toResponse(retailer);
    }

    @Transactional
    public RetailerResponse update(Long retailerId, UpdateRetailerRequest request, Long currentUserId) {
        Retailer retailer = getEntityById(retailerId);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y user hiá»‡n táº¡i"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isOwner = retailer.getUser() != null
                && retailer.getUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new BusinessException("Báº¡n khÃ´ng cÃ³ quyá»n cáº­p nháº­t retailer nÃ y");
        }

        if (!retailer.getBusinessLicenseNo().equalsIgnoreCase(request.getBusinessLicenseNo().trim())
                && retailerRepository.existsByBusinessLicenseNo(request.getBusinessLicenseNo().trim())) {
            throw new BusinessException("businessLicenseNo Ä‘Ã£ tá»“n táº¡i");
        }

        retailer.setRetailerName(request.getRetailerName().trim());
        retailer.setBusinessLicenseNo(request.getBusinessLicenseNo().trim());
        retailer.setAddress(request.getAddress().trim());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            retailer.setStatus(request.getStatus().trim().toUpperCase());
        }

        return toResponse(retailerRepository.save(retailer));
    }

    @Transactional
    public RetailerResponse deactivate(Long retailerId, Long currentUserId) {
        Retailer retailer = getEntityById(retailerId);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y user hiá»‡n táº¡i"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isOwner = retailer.getUser() != null && retailer.getUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new BusinessException("Báº¡n khÃ´ng cÃ³ quyá»n ngá»«ng kÃ­ch hoáº¡t retailer nÃ y");
        }

        retailer.setStatus("INACTIVE");
        return toResponse(retailerRepository.save(retailer));
    }

    public Retailer getEntityById(Long retailerId) {
        return retailerRepository.findById(retailerId)
                .orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y retailer"));
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
