package com.bicap.backend.repository;

import com.bicap.backend.entity.FarmSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FarmSubscriptionRepository extends JpaRepository<FarmSubscription, Long> {
}