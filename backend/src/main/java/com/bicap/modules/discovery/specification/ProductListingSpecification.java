package com.bicap.modules.discovery.specification;

import com.bicap.core.enums.ApprovalStatus;
import com.bicap.core.enums.ListingStatus;
import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.product.entity.Category;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.season.entity.FarmingSeason;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ProductListingSpecification {

    public static Specification<ProductListing> searchListings(String keyword,
                                                              BigDecimal minPrice,
                                                              BigDecimal maxPrice,
                                                              String province,
                                                              String productCategory,
                                                              String certificationStatus) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("status"), ListingStatus.ACTIVE.name()));
            predicates.add(cb.equal(root.get("approvalStatus"), ApprovalStatus.APPROVED.name()));
            predicates.add(cb.greaterThan(root.get("quantityAvailable"), BigDecimal.ZERO));

            Join<ProductListing, ProductBatch> batchJoin = root.join("batch", JoinType.INNER);
            Join<ProductBatch, Product> productJoin = batchJoin.join("product", JoinType.INNER);
            Join<Product, Category> categoryJoin = productJoin.join("category", JoinType.LEFT);
            Join<ProductBatch, FarmingSeason> seasonJoin = batchJoin.join("season", JoinType.INNER);
            Join<FarmingSeason, Farm> farmJoin = seasonJoin.join("farm", JoinType.INNER);

            predicates.add(cb.equal(cb.upper(cb.coalesce(farmJoin.get("approvalStatus"), "")), ApprovalStatus.APPROVED.name()));
            predicates.add(cb.or(
                    cb.isNull(batchJoin.get("expiryDate")),
                    cb.greaterThanOrEqualTo(batchJoin.get("expiryDate"), LocalDate.now())
            ));

            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchPattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate titlePredicate = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate productPredicate = cb.like(cb.lower(productJoin.get("productName")), searchPattern);
                Predicate batchPredicate = cb.like(cb.lower(batchJoin.get("batchCode")), searchPattern);
                Predicate farmPredicate = cb.like(cb.lower(farmJoin.get("farmName")), searchPattern);

                predicates.add(cb.or(titlePredicate, productPredicate, batchPredicate, farmPredicate));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (province != null && !province.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(farmJoin.get("province")), province.trim().toLowerCase()));
            }

            if (productCategory != null && !productCategory.trim().isEmpty()) {
                String normalizedCategory = productCategory.trim().toLowerCase();
                Predicate categoryNamePredicate = cb.like(cb.lower(cb.coalesce(categoryJoin.get("categoryName"), "")), "%" + normalizedCategory + "%");
                Predicate farmTypePredicate = cb.like(cb.lower(cb.coalesce(farmJoin.get("farmType"), "")), "%" + normalizedCategory + "%");
                Predicate productNamePredicate = cb.like(cb.lower(cb.coalesce(productJoin.get("productName"), "")), "%" + normalizedCategory + "%");
                predicates.add(cb.or(categoryNamePredicate, farmTypePredicate, productNamePredicate));
            }

            if (certificationStatus != null && !certificationStatus.trim().isEmpty()) {
                String normalizedCertification = certificationStatus.trim().toLowerCase();
                if ("pending".equals(normalizedCertification)) {
                    predicates.add(cb.or(
                            cb.isNull(farmJoin.get("certificationStatus")),
                            cb.equal(cb.trim(cb.lower(farmJoin.get("certificationStatus"))), ""),
                            cb.equal(cb.lower(farmJoin.get("certificationStatus")), "pending")
                    ));
                } else {
                    predicates.add(cb.equal(cb.lower(farmJoin.get("certificationStatus")), normalizedCertification));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
