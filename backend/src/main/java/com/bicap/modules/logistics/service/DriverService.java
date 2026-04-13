package com.bicap.modules.logistics.service;

import com.bicap.core.exception.BadRequestException;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.exception.ResourceNotFoundException;
import com.bicap.modules.logistics.dto.CreateDriverRequest;
import com.bicap.modules.logistics.dto.DriverResponse;
import com.bicap.modules.logistics.dto.UpdateDriverRequest;
import com.bicap.modules.logistics.entity.Driver;
import com.bicap.modules.logistics.repository.DriverRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
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
        if (driverRepository.existsByDriverCode(request.getDriverCode())) {
            throw new BadRequestException("driverCode đã tồn tại");
        }
        if (driverRepository.existsByLicenseNo(request.getLicenseNo())) {
            throw new BadRequestException("licenseNo đã tồn tại");
        }
        if (driverRepository.existsByUserUserId(request.getUserId())) {
            throw new BadRequestException("Người dùng này đã được gán làm driver");
        }

        User driverUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        User managerUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager không tồn tại"));

        Driver driver = new Driver();
        driver.setDriverCode(request.getDriverCode().trim());
        driver.setLicenseNo(request.getLicenseNo().trim());
        driver.setUser(driverUser);
        driver.setManagerUser(managerUser);
        driver.setStatus(resolveStatus(request.getStatus()));

        return toResponse(driverRepository.save(driver));
    }

    @Transactional(readOnly = true)
    public List<DriverResponse> getAll() {
        return driverRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DriverResponse getById(Long id) {
        return toResponse(getEntityById(id));
    }

    @Transactional
    public DriverResponse update(Long id, UpdateDriverRequest request, Long currentUserId) {
        Driver driver = getEntityById(id);

        if (!driver.getManagerUser().getUserId().equals(currentUserId)) {
            User actingUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
            boolean isAdmin = userService.hasRole(actingUser, com.bicap.core.enums.RoleName.ADMIN);
            if (!isAdmin) {
                throw new BusinessException("Bạn không có quyền cập nhật driver này");
            }
        }

        String nextLicenseNo = request.getLicenseNo().trim();
        if (!driver.getLicenseNo().equalsIgnoreCase(nextLicenseNo) && driverRepository.existsByLicenseNo(nextLicenseNo)) {
            throw new BadRequestException("licenseNo đã tồn tại");
        }

        driver.setLicenseNo(nextLicenseNo);
        driver.setStatus(resolveStatus(request.getStatus()));

        return toResponse(driverRepository.save(driver));
    }

    @Transactional
    public DriverResponse deactivate(Long id, Long currentUserId) {
        Driver driver = getEntityById(id);

        if (!driver.getManagerUser().getUserId().equals(currentUserId)) {
            User actingUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
            boolean isAdmin = userService.hasRole(actingUser, com.bicap.core.enums.RoleName.ADMIN);
            if (!isAdmin) {
                throw new BusinessException("Bạn không có quyền ngừng kích hoạt driver này");
            }
        }

        driver.setStatus("INACTIVE");
        return toResponse(driverRepository.save(driver));
    }

    @Transactional(readOnly = true)
    public Driver getEntityById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver không tồn tại"));
    }

    private DriverResponse toResponse(Driver driver) {
        DriverResponse response = new DriverResponse();
        response.setDriverId(driver.getDriverId());
        response.setDriverCode(driver.getDriverCode());
        response.setLicenseNo(driver.getLicenseNo());
        response.setStatus(driver.getStatus());
        response.setUserId(driver.getUser() != null ? driver.getUser().getUserId() : null);
        response.setUserFullName(driver.getUser() != null ? driver.getUser().getFullName() : null);
        response.setManagerUserId(driver.getManagerUser() != null ? driver.getManagerUser().getUserId() : null);
        response.setManagerFullName(driver.getManagerUser() != null ? driver.getManagerUser().getFullName() : null);
        return response;
    }

    private String resolveStatus(String status) {
        if (status == null || status.isBlank()) {
            return "ACTIVE";
        }
        return status.trim().toUpperCase();
    }
}
