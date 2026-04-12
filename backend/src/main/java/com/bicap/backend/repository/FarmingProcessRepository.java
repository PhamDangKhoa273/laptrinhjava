package com.bicap.backend.repository;

<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/repository/FarmingProcessRepository.java
import com.bicap.backend.entity.FarmingProcess;
=======
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/season/repository/FarmingProcessRepository.java
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
