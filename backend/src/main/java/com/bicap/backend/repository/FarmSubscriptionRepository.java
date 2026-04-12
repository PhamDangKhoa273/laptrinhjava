<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/repository/FarmSubscriptionRepository.java
package com.bicap.backend.repository;

import com.bicap.backend.entity.FarmSubscription;
=======
package com.bicap.modules.subscription.repository;

import com.bicap.modules.subscription.entity.FarmSubscription;
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/subscription/repository/FarmSubscriptionRepository.java
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FarmSubscriptionRepository extends JpaRepository<FarmSubscription, Long> {
    List<FarmSubscription> findByFarmOwnerUserUserId(Long ownerUserId);
}
