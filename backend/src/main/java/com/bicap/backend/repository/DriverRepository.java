package com.bicap.backend.repository;

import com.bicap.backend.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    boolean existsByDriverCode(String driverCode);
    boolean existsByLicenseNo(String licenseNo);
    boolean existsByUserUserId(Long userId);
}
