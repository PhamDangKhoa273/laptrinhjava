package com.bicap.backend.repository;

import com.bicap.backend.entity.Retailer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RetailerRepository extends JpaRepository<Retailer, Long> {
    Optional<Retailer> findByUserUserId(Long userId);
    boolean existsByRetailerCode(String retailerCode);
    boolean existsByBusinessLicenseNo(String businessLicenseNo);
}
