package com.bicap.backend.repository;

import com.bicap.backend.entity.FarmingSeason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmingSeasonRepository extends JpaRepository<FarmingSeason, Long> {
    List<FarmingSeason> findByFarm_FarmId(Long farmId);
}
