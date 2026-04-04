package com.bicap.backend.repository;

import com.bicap.backend.entity.FarmSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FarmSubscriptionRepository extends JpaRepository<FarmSubscription, Long> {
    List<FarmSubscription> findByFarmOwnerUserUserId(Long ownerUserId);
}