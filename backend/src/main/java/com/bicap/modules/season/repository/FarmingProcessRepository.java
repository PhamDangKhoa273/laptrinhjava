package com.bicap.modules.season.repository;
import com.bicap.modules.season.entity.FarmingProcess;
import com.bicap.modules.season.repository.FarmingProcessRepository;

import com.bicap.modules.season.entity.FarmingProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmingProcessRepository extends JpaRepository<FarmingProcess, Long> {
    List<FarmingProcess> findBySeason_SeasonIdOrderByStepNoAsc(Long seasonId);
    List<FarmingProcess> findBySeason_SeasonIdOrderByPerformedAtAsc(Long seasonId);
    boolean existsBySeason_SeasonIdAndStepNo(Long seasonId, Integer stepNo);
    boolean existsBySeason_SeasonIdAndStepNoAndIdNot(Long seasonId, Integer stepNo, Long id);
}
