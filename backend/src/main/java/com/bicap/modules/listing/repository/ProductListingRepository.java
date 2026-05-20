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

    @Query("SELECT DISTINCT f.province FROM ProductListing pl JOIN pl.batch b JOIN b.season s JOIN s.farm f WHERE pl.status = :status AND pl.approvalStatus = :approvalStatus AND f.province IS NOT NULL AND f.province <> '' ORDER BY f.province")
    List<String> findDistinctProvincesByStatusAndApprovalStatus(@Param("status") String status, @Param("approvalStatus") String approvalStatus);

    @Query("SELECT DISTINCT f.certificationStatus FROM ProductListing pl JOIN pl.batch b JOIN b.season s JOIN s.farm f WHERE pl.status = :status AND pl.approvalStatus = :approvalStatus AND f.certificationStatus IS NOT NULL AND f.certificationStatus <> '' ORDER BY f.certificationStatus")
    List<String> findDistinctCertificationsByStatusAndApprovalStatus(@Param("status") String status, @Param("approvalStatus") String approvalStatus);

    @Query("SELECT DISTINCT c.categoryName FROM ProductListing pl JOIN pl.batch b JOIN b.product p JOIN p.category c WHERE pl.status = :status AND pl.approvalStatus = :approvalStatus AND c.categoryName IS NOT NULL AND c.categoryName <> '' ORDER BY c.categoryName")
    List<String> findDistinctCategoriesByStatusAndApprovalStatus(@Param("status") String status, @Param("approvalStatus") String approvalStatus);

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

    @Query("SELECT SUM(pl.quantityAvailable + pl.quantityReserved) " +
           "FROM ProductListing pl " +
           "WHERE pl.batch.batchId = :batchId " +
           "AND (:excludeListingId IS NULL OR pl.listingId <> :excludeListingId) " +
           "AND pl.status <> 'CANCELLED'")
    java.math.BigDecimal sumListedQuantityByBatchId(@Param("batchId") Long batchId, @Param("excludeListingId") Long excludeListingId);
}
