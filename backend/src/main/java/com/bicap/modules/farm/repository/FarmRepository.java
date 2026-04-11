package com.bicap.modules.farm.repository;

import com.bicap.modules.farm.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {
    Optional<Farm> findByFarmCode(String farmCode);
    Optional<Farm> findByOwnerUser_UserId(Long userId);
    
    default Optional<Farm> findByOwnerUserUserId(Long userId) {
        return findByOwnerUser_UserId(userId);
    }
}
