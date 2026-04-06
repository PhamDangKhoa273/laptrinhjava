package com.bicap.backend.repository;

import com.bicap.backend.entity.FarmingProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmingProcessRepository extends JpaRepository<FarmingProcess, Long> {
    List<FarmingProcess> findBySeasonIdOrderByStepNoAsc(Long seasonId);
    List<FarmingProcess> findBySeasonIdOrderByPerformedAtAsc(Long seasonId);
    boolean existsBySeasonIdAndStepNo(Long seasonId, Integer stepNo);
    boolean existsBySeasonIdAndStepNoAndIdNot(Long seasonId, Integer stepNo, Long id);
}
