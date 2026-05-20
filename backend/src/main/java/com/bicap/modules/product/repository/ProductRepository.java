package com.bicap.modules.product.repository;

import com.bicap.modules.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByProductCode(String productCode);
    @Query("select p from Product p where p.status is null or p.status <> 'DELETED' order by p.sortOrder asc")
    List<Product> findVisibleProducts();
}
