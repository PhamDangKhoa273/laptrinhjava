package com.bicap.backend.repository;

import com.bicap.backend.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FarmRepository extends JpaRepository<Farm, Long> {
    boolean existsByFarmCode(String farmCode);
    boolean existsByBusinessLicenseNo(String businessLicenseNo);
    Optional<Farm> findByOwnerUserUserId(Long userId);
}   