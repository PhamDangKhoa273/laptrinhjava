package com.bicap.modules.subscription.repository;

import com.bicap.modules.subscription.entity.ServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicePackageRepository extends JpaRepository<ServicePackage, Long> {
    boolean existsByPackageCodeIgnoreCase(String packageCode);
}
