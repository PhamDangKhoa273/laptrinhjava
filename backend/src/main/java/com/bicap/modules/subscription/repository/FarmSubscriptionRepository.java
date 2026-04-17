package com.bicap.modules.subscription.repository;

import com.bicap.modules.subscription.entity.FarmSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FarmSubscriptionRepository extends JpaRepository<FarmSubscription, Long> {
    List<FarmSubscription> findByFarmOwnerUserUserId(Long ownerUserId);
}
