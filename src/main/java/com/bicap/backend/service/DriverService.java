package com.bicap.backend.service;

import com.bicap.backend.entity.Driver;
import com.bicap.backend.entity.User;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.DriverRepository;
import com.bicap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public Driver create(Driver driver, Long userId, Long managerId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user"));

        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy manager"));

        if (!userService.hasRole(user, RoleName.DRIVER)) {
            throw new BusinessException("User phải có role DRIVER");
        }

        if (!userService.hasRole(manager, RoleName.SHIPPING_MANAGER)) {
            throw new BusinessException("manager phải là SHIPPING_MANAGER");
        }

        if (driverRepository.existsByUserUserId(userId)) {
            throw new BusinessException("User này đã có hồ sơ driver");
        }

        if (driverRepository.existsByDriverCode(driver.getDriverCode())) {
            throw new BusinessException("driverCode đã tồn tại");
        }

        if (driverRepository.existsByLicenseNo(driver.getLicenseNo())) {
            throw new BusinessException("licenseNo đã tồn tại");
        }

        driver.setUser(user);
        driver.setManagerUser(manager);

        return driverRepository.save(driver);
    }

    public List<Driver> getAll() {
        return driverRepository.findAll();
    }

    public Driver getById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy driver"));
    }
}