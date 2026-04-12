<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/repository/RetailerRepository.java
package com.bicap.backend.repository;

import com.bicap.backend.entity.Retailer;
=======
package com.bicap.modules.retailer.repository;

import com.bicap.modules.retailer.entity.Retailer;
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/retailer/repository/RetailerRepository.java
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RetailerRepository extends JpaRepository<Retailer, Long> {
    Optional<Retailer> findByUserUserId(Long userId);
    boolean existsByRetailerCode(String retailerCode);
    boolean existsByBusinessLicenseNo(String businessLicenseNo);
}
