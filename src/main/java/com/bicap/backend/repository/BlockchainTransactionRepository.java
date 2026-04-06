package com.bicap.backend.repository;

import com.bicap.backend.entity.BlockchainTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockchainTransactionRepository extends JpaRepository<BlockchainTransaction, Long> {
    Optional<BlockchainTransaction> findTopByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc(
            String relatedEntityType,
            Long relatedEntityId
    );

    List<BlockchainTransaction> findByRelatedEntityTypeAndRelatedEntityIdIn(
            String relatedEntityType,
            List<Long> relatedEntityIds
    );
}
