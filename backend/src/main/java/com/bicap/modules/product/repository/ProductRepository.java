package com.bicap.modules.product.repository;

import com.bicap.modules.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByProductCode(String productCode);
    List<Product> findAllByOrderBySortOrderAsc();
}
