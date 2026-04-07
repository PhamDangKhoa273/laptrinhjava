package com.bicap.backend.repository;

import com.bicap.backend.entity.FarmingSeason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
<<<<<<< HEAD:src/main/java/com/bicap/backend/repository/FarmingSeasonRepository.java
=======
import java.util.Optional;
>>>>>>> d2684be:backend/src/main/java/com/bicap/backend/repository/FarmingSeasonRepository.java

@Repository
public interface FarmingSeasonRepository extends JpaRepository<FarmingSeason, Long> {
    List<FarmingSeason> findByFarm_FarmId(Long farmId);
<<<<<<< HEAD:src/main/java/com/bicap/backend/repository/FarmingSeasonRepository.java
=======
    List<FarmingSeason> findByProduct_ProductId(Long productId);
    Optional<FarmingSeason> findBySeasonCode(String seasonCode);
>>>>>>> d2684be:backend/src/main/java/com/bicap/backend/repository/FarmingSeasonRepository.java
}
