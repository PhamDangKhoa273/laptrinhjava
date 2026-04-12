package com.bicap.backend.repository;

<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/repository/FarmingSeasonRepository.java
import com.bicap.backend.entity.FarmingSeason;
=======
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/season/repository/FarmingSeasonRepository.java
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FarmingSeasonRepository extends JpaRepository<FarmingSeason, Long> {
    List<FarmingSeason> findByFarm_FarmId(Long farmId);
    List<FarmingSeason> findByProduct_ProductId(Long productId);
    Optional<FarmingSeason> findBySeasonCode(String seasonCode);
}
