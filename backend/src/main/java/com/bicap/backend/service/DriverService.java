package com.bicap.backend.service;

import com.bicap.backend.dto.CreateDriverRequest;
import com.bicap.backend.dto.DriverResponse;
import com.bicap.backend.dto.UpdateDriverRequest;
import com.bicap.backend.entity.Driver;
import com.bicap.backend.entity.User;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.DriverRepository;
import com.bicap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public DriverResponse create(CreateDriverRequest request, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));

        if (!userService.hasRole(currentUser, RoleName.SHIPPING_MANAGER)) {
            throw new BusinessException("Chỉ SHIPPING_MANAGER mới được tạo driver");
        }

        User targetUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy user"));

        if (!userService.hasRole(targetUser, RoleName.DRIVER)) {
            throw new BusinessException("User phải có role DRIVER");
        }

        if (driverRepository.existsByUserUserId(request.getUserId())) {
            throw new BusinessException("User này đã có hồ sơ driver");
        }

        if (driverRepository.existsByDriverCode(request.getDriverCode().trim())) {
            throw new BusinessException("driverCode đã tồn tại");
        }

        if (driverRepository.existsByLicenseNo(request.getLicenseNo().trim())) {
            throw new BusinessException("licenseNo đã tồn tại");
        }

        Driver driver = new Driver();
        driver.setUser(targetUser);
        driver.setManagerUser(currentUser);
        driver.setDriverCode(request.getDriverCode().trim());
        driver.setLicenseNo(request.getLicenseNo().trim());
        driver.setStatus(normalizeStatus(request.getStatus()));

        return toResponse(driverRepository.save(driver));
    }

    public List<DriverResponse> getAll() {
        return driverRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public DriverResponse getById(Long id) {
        return toResponse(getEntityById(id));
    }

    @Transactional
    public DriverResponse update(Long id, UpdateDriverRequest request, Long currentUserId) {
        Driver driver = getEntityById(id);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isManagerOwner = driver.getManagerUser() != null
                && driver.getManagerUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isManagerOwner) {
            throw new BusinessException("Bạn không có quyền cập nhật driver này");
        }

        if (!driver.getLicenseNo().equalsIgnoreCase(request.getLicenseNo().trim())
                && driverRepository.existsByLicenseNo(request.getLicenseNo().trim())) {
            throw new BusinessException("licenseNo đã tồn tại");
        }

        driver.setLicenseNo(request.getLicenseNo().trim());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            driver.setStatus(request.getStatus().trim().toUpperCase());
        }

        return toResponse(driverRepository.save(driver));
    }

    public Driver getEntityById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy driver"));
    }

    private DriverResponse toResponse(Driver driver) {
        return DriverResponse.builder()
                .driverId(driver.getDriverId())
                .driverCode(driver.getDriverCode())
                .licenseNo(driver.getLicenseNo())
                .status(driver.getStatus())
                .userId(driver.getUser() != null ? driver.getUser().getUserId() : null)
                .userFullName(driver.getUser() != null ? driver.getUser().getFullName() : null)
                .managerUserId(driver.getManagerUser() != null ? driver.getManagerUser().getUserId() : null)
                .managerFullName(driver.getManagerUser() != null ? driver.getManagerUser().getFullName() : null)
                .build();
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "ACTIVE";
        }
        return status.trim().toUpperCase();
    }
}
