package com.bicap.modules.logistics.repository;
import com.bicap.modules.user.entity.User;

import com.bicap.modules.user.entity.User;

import com.bicap.modules.logistics.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    boolean existsByDriverCode(String driverCode);
    boolean existsByLicenseNo(String licenseNo);
    boolean existsByUserUserId(Long userId);
}
