<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/repository/DriverRepository.java
package com.bicap.backend.repository;

import com.bicap.backend.entity.Driver;
=======
package com.bicap.modules.logistics.repository;

import com.bicap.modules.logistics.entity.Driver;
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/logistics/repository/DriverRepository.java
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    boolean existsByDriverCode(String driverCode);
    boolean existsByLicenseNo(String licenseNo);
    boolean existsByUserUserId(Long userId);
}
