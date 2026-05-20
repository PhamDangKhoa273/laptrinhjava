package com.bicap.modules.subscription.repository;

import com.bicap.modules.subscription.entity.FarmSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FarmSubscriptionRepository extends JpaRepository<FarmSubscription, Long> {
    List<FarmSubscription> findByFarmOwnerUserUserId(Long ownerUserId);
    List<FarmSubscription> findByFarmOwnerUserUserIdAndSubscriptionStatusIgnoreCase(Long ownerUserId, String status);
    Optional<FarmSubscription> findFirstByFarmOwnerUserUserIdAndSubscriptionStatusIgnoreCaseOrderBySubscriptionIdDesc(Long ownerUserId, String status);

    /** Active subscriptions whose endDate falls in [start, end] — used by EXPIRING_SOON / GRACE_PERIOD / EXPIRED schedulers. */
    List<FarmSubscription> findBySubscriptionStatusIgnoreCaseAndEndDateBetween(String status, LocalDate start, LocalDate end);

    /** All subscriptions in given status with endDate before threshold — used by EXPIRED scheduler. */
    List<FarmSubscription> findBySubscriptionStatusIgnoreCaseAndEndDateBefore(String status, LocalDate threshold);
}
