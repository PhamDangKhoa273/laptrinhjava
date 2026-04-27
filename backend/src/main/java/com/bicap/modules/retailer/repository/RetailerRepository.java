package com.bicap.modules.retailer.repository;

import com.bicap.modules.retailer.entity.Retailer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RetailerRepository extends JpaRepository<Retailer, Long> {
    Optional<Retailer> findByUserUserId(Long userId);
    boolean existsByRetailerCode(String retailerCode);
    boolean existsByBusinessLicenseNo(String businessLicenseNo);
}
