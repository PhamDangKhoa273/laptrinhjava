package com.bicap.modules.listing.repository;

import com.bicap.modules.listing.entity.ProductListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductListingRepository extends JpaRepository<ProductListing, Long>, JpaSpecificationExecutor<ProductListing> {

    List<ProductListing> findByStatus(String status);

    @Query("SELECT pl FROM ProductListing pl " +
           "JOIN pl.batch b " +
           "JOIN b.season s " +
           "JOIN s.farm f " +
           "WHERE f.ownerUser.userId = :userId")
    List<ProductListing> findByFarmOwnerId(@Param("userId") Long userId);

    List<ProductListing> findByBatchBatchId(Long batchId);
}
