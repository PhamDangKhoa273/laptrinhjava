package com.bicap.modules.contract.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.service.SecurityAuditService;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.contract.dto.CreateFarmRetailerContractRequest;
import com.bicap.modules.contract.dto.FarmRetailerContractResponse;
import com.bicap.modules.contract.entity.FarmRetailerContract;
import com.bicap.modules.contract.repository.FarmRetailerContractRepository;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.listing.repository.ProductListingRepository;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.retailer.entity.Retailer;
import com.bicap.modules.retailer.repository.RetailerRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FarmRetailerContractService {
    private final FarmRetailerContractRepository contractRepository;
    private final SecurityAuditService securityAuditService;
    private final FarmRepository farmRepository;
    private final RetailerRepository retailerRepository;
    private final ProductListingRepository listingRepository;
    private final OrderRepository orderRepository;

    public FarmRetailerContractService(FarmRetailerContractRepository contractRepository,
                                       FarmRepository farmRepository,
                                       RetailerRepository retailerRepository,
                                       ProductListingRepository listingRepository,
                                       OrderRepository orderRepository,
                                       SecurityAuditService securityAuditService) {
        this.contractRepository = contractRepository;
        this.farmRepository = farmRepository;
        this.retailerRepository = retailerRepository;
        this.listingRepository = listingRepository;
        this.orderRepository = orderRepository;
        this.securityAuditService = securityAuditService;
    }

    @Transactional(readOnly = true)
    public List<FarmRetailerContractResponse> getByFarm(Long farmId, Long currentUserId) {
        assertCanAccessFarm(farmId, currentUserId);
        return contractRepository.findByFarmIdOrderByCreatedAtDesc(farmId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<FarmRetailerContractResponse> getByRetailer(Long retailerId, Long currentUserId) {
        assertCanAccessRetailer(retailerId, currentUserId);
        return contractRepository.findByRetailerIdOrderByCreatedAtDesc(retailerId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<FarmRetailerContractResponse> getActiveByFarm(Long farmId, Long currentUserId) {
        assertCanAccessFarm(farmId, currentUserId);
        return contractRepository.findByFarmIdAndStatusOrderByCreatedAtDesc(farmId, "ACTIVE").stream().map(this::toResponse).toList();
    }

    @Transactional
    public FarmRetailerContractResponse create(CreateFarmRetailerContractRequest request, Long currentUserId) {
        assertCanAccessFarm(request.getFarmId(), currentUserId);
        validateRelatedEntities(request.getFarmId(), request.getRetailerId());
        FarmRetailerContract contract = new FarmRetailerContract();
        contract.setFarmId(request.getFarmId());
        contract.setRetailerId(request.getRetailerId());
        contract.setStatus("PENDING");
        contract.setSignedAt(null);
        contract.setValidFrom(request.getValidFrom());
        contract.setValidTo(request.getValidTo());
        contract.setProductScope(request.getProductScope());
        contract.setAgreedPriceRule(request.getAgreedPriceRule());
        contract.setNotes(request.getNotes());
        contract.setRelatedListingIds(request.getRelatedListingIds());
        contract.setRelatedOrderIds(request.getRelatedOrderIds());
        contract.setCreatedByUserId(currentUserId);
        FarmRetailerContract saved = contractRepository.save(contract);
        securityAuditService.logDomainAction(currentUserId, "CONTRACT_REVIEW", "CONTRACT", saved.getContractId(), "status=" + saved.getStatus());
        return toResponse(saved);
    }

    @Transactional
    public FarmRetailerContractResponse review(Long contractId, String status, Long currentUserId) {
        FarmRetailerContract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy contract"));
        assertCanAccessFarm(contract.getFarmId(), currentUserId);
        String normalized = status == null ? "" : status.trim().toUpperCase();
        if (!List.of("ACTIVE", "REJECTED", "CANCELLED").contains(normalized)) {
            throw new BusinessException("Trạng thái contract không hợp lệ");
        }
        contract.setStatus(normalized);
        contract.setReviewedByUserId(currentUserId);
        contract.setReviewedAt(LocalDateTime.now());
        if ("ACTIVE".equals(normalized)) {
            contract.setSignedAt(LocalDateTime.now());
            if (contract.getValidFrom() == null) contract.setValidFrom(LocalDateTime.now());
        }
        FarmRetailerContract saved = contractRepository.save(contract);
        securityAuditService.logDomainAction(currentUserId, "CONTRACT_REVIEW", "CONTRACT", saved.getContractId(), "status=" + saved.getStatus());
        return toResponse(saved);
    }


    @Transactional(readOnly = true)
    public boolean isContractActiveForOrder(Long contractId, Long farmId, Long retailerId) {
        FarmRetailerContract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy contract"));
        if (!contract.getFarmId().equals(farmId) || !contract.getRetailerId().equals(retailerId)) {
            throw new BusinessException("Contract không thuộc farm/retailer này");
        }
        return "ACTIVE".equalsIgnoreCase(contract.getStatus()) && (contract.getValidTo() == null || contract.getValidTo().isAfter(LocalDateTime.now()));
    }

    @Transactional
    public FarmRetailerContractResponse cancel(Long contractId, Long currentUserId) {
        FarmRetailerContract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy contract"));
        assertCanAccessFarm(contract.getFarmId(), currentUserId);
        FarmRetailerContractResponse response = review(contractId, "CANCELLED", currentUserId);
        securityAuditService.logDomainAction(currentUserId, "CONTRACT_CANCEL", "CONTRACT", contractId, "status=CANCELLED");
        return response;
    }

    private void validateRelatedEntities(Long farmId, Long retailerId) {
        if (farmRepository.findById(farmId).isEmpty()) throw new BusinessException("Farm không tồn tại");
        if (retailerRepository.findById(retailerId).isEmpty()) throw new BusinessException("Retailer không tồn tại");
    }

    private boolean hasRole(String role) {
        return SecurityUtils.getCurrentUser().getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch(auth -> auth.equals("ROLE_" + role));
    }

    private void assertCanAccessFarm(Long farmId, Long currentUserId) {
        if (hasRole("ADMIN")) return;
        Farm farm = farmRepository.findById(farmId).orElseThrow(() -> new BusinessException("Farm không tồn tại"));
        if (farm.getOwnerUser() != null && farm.getOwnerUser().getUserId().equals(currentUserId)) return;
        throw new BusinessException("Bạn không có quyền xem contract của farm này");
    }

    private void assertCanAccessRetailer(Long retailerId, Long currentUserId) {
        if (hasRole("ADMIN")) return;
        Retailer retailer = retailerRepository.findById(retailerId).orElseThrow(() -> new BusinessException("Retailer không tồn tại"));
        if (retailer.getUser() != null && retailer.getUser().getUserId().equals(currentUserId)) return;
        throw new BusinessException("Bạn không có quyền xem contract của retailer này");
    }

    private String buildCoverageSummary(FarmRetailerContract contract) {
        String listings = contract.getRelatedListingIds();
        String orders = contract.getRelatedOrderIds();
        if ((listings == null || listings.isBlank()) && (orders == null || orders.isBlank())) {
            return contract.getProductScope() == null || contract.getProductScope().isBlank() ? "No linked listings/orders" : contract.getProductScope();
        }
        StringBuilder sb = new StringBuilder();
        if (listings != null && !listings.isBlank()) sb.append("Listings: ").append(listings);
        if (orders != null && !orders.isBlank()) {
            if (sb.length() > 0) sb.append(" | ");
            sb.append("Orders: ").append(orders);
        }
        return sb.toString();
    }

    private Long resolveFarmOwnerId(Long farmId) {
        return farmRepository.findById(farmId).map(f -> f.getOwnerUser() == null ? null : f.getOwnerUser().getUserId()).orElse(null);
    }

    private FarmRetailerContractResponse toResponse(FarmRetailerContract contract) {
        FarmRetailerContractResponse response = new FarmRetailerContractResponse();
        response.setContractId(contract.getContractId());
        response.setFarmId(contract.getFarmId());
        response.setRetailerId(contract.getRetailerId());
        response.setFarmName(farmRepository.findById(contract.getFarmId()).map(Farm::getFarmName).orElse(null));
        response.setRetailerName(retailerRepository.findById(contract.getRetailerId()).map(Retailer::getRetailerName).orElse(null));
        response.setStatus(contract.getStatus());
        response.setSignedAt(contract.getSignedAt());
        response.setValidFrom(contract.getValidFrom());
        response.setValidTo(contract.getValidTo());
        response.setProductScope(contract.getProductScope());
        response.setAgreedPriceRule(contract.getAgreedPriceRule());
        response.setNotes(contract.getNotes());
        response.setCoverageSummary(buildCoverageSummary(contract));
        response.setCreatedByUserId(contract.getCreatedByUserId());
        response.setReviewedByUserId(contract.getReviewedByUserId());
        response.setReviewedAt(contract.getReviewedAt());
        boolean active = "ACTIVE".equalsIgnoreCase(contract.getStatus()) && (contract.getValidTo() == null || contract.getValidTo().isAfter(LocalDateTime.now()));
        response.setActive(active);
        Long ownerId = resolveFarmOwnerId(contract.getFarmId());
        int listingCount = ownerId == null ? 0 : listingRepository.findByFarmOwnerId(ownerId).size();
        int orderCount = orderRepository.findByFarmId(contract.getFarmId()).size();
        response.setListingCount(listingCount);
        response.setOrderCount(orderCount);
        response.setCoverageSummary("Listings: " + listingCount + ", Orders: " + orderCount);
        return response;
    }
}
