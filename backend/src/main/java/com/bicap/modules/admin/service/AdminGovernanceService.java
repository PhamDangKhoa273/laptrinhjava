package com.bicap.modules.admin.service;

import com.bicap.modules.common.report.repository.PlatformReportRepository;
import com.bicap.modules.listing.repository.ListingRegistrationRequestRepository;
import com.bicap.modules.shipment.repository.ShipmentReportRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminGovernanceService {

    private final ListingRegistrationRequestRepository listingRegistrationRequestRepository;
    private final PlatformReportRepository platformReportRepository;
    private final ShipmentReportRepository shipmentReportRepository;

    public AdminGovernanceService(ListingRegistrationRequestRepository listingRegistrationRequestRepository,
                                  PlatformReportRepository platformReportRepository,
                                  ShipmentReportRepository shipmentReportRepository) {
        this.listingRegistrationRequestRepository = listingRegistrationRequestRepository;
        this.platformReportRepository = platformReportRepository;
        this.shipmentReportRepository = shipmentReportRepository;
    }

    public Map<String, Object> getOverview() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("pendingListings", listingRegistrationRequestRepository.findByStatusOrderByCreatedAtDesc("PENDING"));
        payload.put("openReports", platformReportRepository.findByRecipientRoleOrderByCreatedAtDesc("ADMIN"));
        payload.put("shipmentIssues", shipmentReportRepository.findAll());
        payload.put("blockchainTransactions", List.of());
        return payload;
    }
}
