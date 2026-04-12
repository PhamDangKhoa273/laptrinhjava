package com.bicap.modules.season.repository;

import com.bicap.modules.season.entity.FarmingSeason;
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
