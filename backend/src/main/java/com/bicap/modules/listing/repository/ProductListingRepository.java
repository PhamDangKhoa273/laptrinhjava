package com.bicap.modules.listing.repository;

import com.bicap.modules.listing.entity.ProductListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductListingRepository extends JpaRepository<ProductListing, Long>, JpaSpecificationExecutor<ProductListing> {

    List<ProductListing> findByStatus(String status);

    Page<ProductListing> findByStatus(String status, Pageable pageable);

    Page<ProductListing> findByStatusAndApprovalStatus(String status, String approvalStatus, Pageable pageable);

    @Query("SELECT pl FROM ProductListing pl " +
           "JOIN pl.batch b " +
           "JOIN b.season s " +
           "JOIN s.farm f " +
           "WHERE f.ownerUser.userId = :userId")
    List<ProductListing> findByFarmOwnerId(@Param("userId") Long userId);

    List<ProductListing> findByBatchBatchId(Long batchId);

    List<ProductListing> findByStatusAndApprovalStatus(String status, String approvalStatus, Sort sort);

    @Query("SELECT COALESCE(SUM(pl.quantityAvailable + pl.quantityReserved), 0) " +
           "FROM ProductListing pl " +
           "WHERE pl.batch.batchId = :batchId " +
           "AND (:excludeListingId IS NULL OR pl.listingId <> :excludeListingId) " +
           "AND pl.status <> 'CANCELLED'")
    java.math.BigDecimal sumListedQuantityByBatchId(@Param("batchId") Long batchId, @Param("excludeListingId") Long excludeListingId);
}
