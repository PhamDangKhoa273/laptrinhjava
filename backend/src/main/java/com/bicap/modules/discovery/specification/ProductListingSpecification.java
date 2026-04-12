package com.bicap.modules.discovery.specification;

import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.season.entity.FarmingSeason;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductListingSpecification {

    public static Specification<ProductListing> searchListings(String keyword, BigDecimal minPrice, BigDecimal maxPrice, String province) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Chỉ lấy sản phẩm ACTIVE
            predicates.add(cb.equal(root.get("status"), "ACTIVE"));

            // Lọc quantity > 0 để chắc chắn còn hàng
            predicates.add(cb.greaterThan(root.get("quantityAvailable"), BigDecimal.ZERO));

            // Joins cho các relation
            Join<ProductListing, ProductBatch> batchJoin = root.join("batch", JoinType.INNER);
            Join<ProductBatch, Product> productJoin = batchJoin.join("product", JoinType.INNER);
            Join<ProductBatch, FarmingSeason> seasonJoin = batchJoin.join("season", JoinType.INNER);
            Join<FarmingSeason, Farm> farmJoin = seasonJoin.join("farm", JoinType.INNER);

            // 2. Keyword Filter (title, productName, batchCode)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchPattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate titlePredicate = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate productPredicate = cb.like(cb.lower(productJoin.get("productName")), searchPattern);
                Predicate batchPredicate = cb.like(cb.lower(batchJoin.get("batchCode")), searchPattern);
                
                predicates.add(cb.or(titlePredicate, productPredicate, batchPredicate));
            }

            // 3. Price Filter
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // 4. Province Filter
            if (province != null && !province.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(farmJoin.get("province")), province.trim().toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
