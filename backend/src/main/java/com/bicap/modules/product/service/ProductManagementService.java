package com.bicap.modules.product.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.modules.product.dto.*;
import com.bicap.modules.product.entity.Category;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.product.repository.CategoryRepository;
import com.bicap.modules.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@SuppressWarnings("null")
public class ProductManagementService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductManagementService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    // ─── CATEGORIES ───────────────────────────────────────────────────────────

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::toCategoryResponse).toList();
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest req) {
        String slug = req.getSlug() != null && !req.getSlug().isBlank()
                ? req.getSlug().trim()
                : toSlug(req.getCategoryName());

        if (categoryRepository.existsBySlug(slug)) {
            throw new BusinessException("Slug '" + slug + "' đã tồn tại");
        }

        Category cat = new Category();
        cat.setCategoryName(req.getCategoryName().trim());
        cat.setSlug(slug);
        cat.setImageUrl(req.getImageUrl());
        cat.setIcon(req.getIcon());
        cat.setSortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0);
        cat.setStatus(req.getStatus() != null ? req.getStatus() : "ACTIVE");
        return toCategoryResponse(categoryRepository.save(cat));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest req) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy chuyên mục ID: " + id));
        if (req.getCategoryName() != null) cat.setCategoryName(req.getCategoryName().trim());
        if (req.getSlug() != null) cat.setSlug(req.getSlug().trim());
        if (req.getImageUrl() != null) cat.setImageUrl(req.getImageUrl());
        if (req.getIcon() != null) cat.setIcon(req.getIcon());
        if (req.getSortOrder() != null) cat.setSortOrder(req.getSortOrder());
        if (req.getStatus() != null) cat.setStatus(req.getStatus());
        return toCategoryResponse(categoryRepository.save(cat));
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) throw new BusinessException("Không tìm thấy chuyên mục ID: " + id);
        categoryRepository.deleteById(id);
    }

    // ─── PRODUCTS ─────────────────────────────────────────────────────────────

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAllByOrderBySortOrderAsc().stream().map(this::toProductResponse).toList();
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest req) {
        String code = req.getProductCode() != null && !req.getProductCode().isBlank()
                ? req.getProductCode().trim().toUpperCase()
                : "SP-" + System.currentTimeMillis();

        if (productRepository.existsByProductCode(code)) {
            throw new BusinessException("Mã sản phẩm '" + code + "' đã tồn tại");
        }

        Product p = new Product();
        p.setProductName(req.getProductName().trim());
        p.setProductCode(code);
        p.setDescription(req.getDescription());
        p.setPrice(req.getPrice());
        p.setImageUrl(req.getImageUrl());
        p.setSortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0);
        p.setStatus(req.getStatus() != null ? req.getStatus() : "ACTIVE");

        if (req.getCategoryId() != null) {
            Category cat = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new BusinessException("Không tìm thấy chuyên mục ID: " + req.getCategoryId()));
            p.setCategory(cat);
        }

        return toProductResponse(productRepository.save(p));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest req) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy sản phẩm ID: " + id));

        if (req.getProductName() != null) p.setProductName(req.getProductName().trim());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getPrice() != null) p.setPrice(req.getPrice());
        if (req.getImageUrl() != null) p.setImageUrl(req.getImageUrl());
        if (req.getSortOrder() != null) p.setSortOrder(req.getSortOrder());
        if (req.getStatus() != null) p.setStatus(req.getStatus());
        if (req.getCategoryId() != null) {
            Category cat = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new BusinessException("Không tìm thấy chuyên mục ID: " + req.getCategoryId()));
            p.setCategory(cat);
        }
        return toProductResponse(productRepository.save(p));
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) throw new BusinessException("Không tìm thấy sản phẩm ID: " + id);
        productRepository.deleteById(id);
    }

    // ─── MAPPERS ──────────────────────────────────────────────────────────────

    private CategoryResponse toCategoryResponse(Category cat) {
        CategoryResponse r = new CategoryResponse();
        r.setCategoryId(cat.getCategoryId());
        r.setCategoryName(cat.getCategoryName());
        r.setSlug(cat.getSlug());
        r.setImageUrl(cat.getImageUrl());
        r.setIcon(cat.getIcon());
        r.setSortOrder(cat.getSortOrder());
        r.setStatus(cat.getStatus());
        r.setCreatedAt(cat.getCreatedAt());
        return r;
    }

    private ProductResponse toProductResponse(Product p) {
        ProductResponse r = new ProductResponse();
        r.setProductId(p.getProductId());
        r.setProductCode(p.getProductCode());
        r.setProductName(p.getProductName());
        r.setDescription(p.getDescription());
        r.setPrice(p.getPrice());
        r.setImageUrl(p.getImageUrl());
        r.setSortOrder(p.getSortOrder());
        r.setStatus(p.getStatus());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        if (p.getCategory() != null) {
            r.setCategoryId(p.getCategory().getCategoryId());
            r.setCategoryName(p.getCategory().getCategoryName());
        }
        return r;
    }

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private String toSlug(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        return NON_LATIN.matcher(WHITESPACE.matcher(normalized).replaceAll("-"))
                .replaceAll("").toLowerCase(Locale.ENGLISH);
    }
}
