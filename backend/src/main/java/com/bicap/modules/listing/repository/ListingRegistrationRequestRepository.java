package com.bicap.modules.listing.repository;

import com.bicap.modules.listing.entity.ListingRegistrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ListingRegistrationRequestRepository extends JpaRepository<ListingRegistrationRequest, Long> {
    Optional<ListingRegistrationRequest> findByListingListingId(Long listingId);
    List<ListingRegistrationRequest> findByRequestedByUserUserIdOrderByCreatedAtDesc(Long userId);
    List<ListingRegistrationRequest> findByStatusOrderByCreatedAtDesc(String status);
}
