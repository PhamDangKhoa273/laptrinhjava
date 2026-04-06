package com.bicap.backend.repository;

import com.bicap.backend.entity.FarmingSeason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FarmingSeasonRepository extends JpaRepository<FarmingSeason, Long> {
}
