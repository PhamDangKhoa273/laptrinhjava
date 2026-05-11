package com.bicap.modules.batch.repository;

import com.bicap.modules.batch.entity.BlockchainTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import com.bicap.core.enums.BlockchainGovernanceStatus;

@Repository
public interface BlockchainTransactionRepository extends JpaRepository<BlockchainTransaction, Long> {
    List<BlockchainTransaction> findByRelatedEntityTypeAndRelatedEntityId(String relatedEntityType, Long relatedEntityId);
    Optional<BlockchainTransaction> findTopByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc(String relatedEntityType, Long relatedEntityId);

    List<BlockchainTransaction> findTop50ByGovernanceStatusInOrderByCreatedAtAsc(List<BlockchainGovernanceStatus> statuses);
}
