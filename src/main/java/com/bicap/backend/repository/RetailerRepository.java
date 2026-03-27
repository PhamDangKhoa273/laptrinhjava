package com.bicap.backend.repository;

import com.bicap.backend.entity.Retailer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RetailerRepository extends JpaRepository<Retailer, Long> {
    boolean existsByRetailerCode(String retailerCode);
    boolean existsByBusinessLicenseNo(String businessLicenseNo);
    boolean existsByUserUserId(Long userId);
}