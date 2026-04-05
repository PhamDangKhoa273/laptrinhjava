package com.bicap.backend.repository;

import com.bicap.backend.entity.ServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicePackageRepository extends JpaRepository<ServicePackage, Long> {
    boolean existsByPackageCodeIgnoreCase(String packageCode);
}
