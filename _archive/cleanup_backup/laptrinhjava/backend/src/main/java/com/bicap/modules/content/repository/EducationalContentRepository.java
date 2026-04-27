package com.bicap.modules.content.repository;

import com.bicap.modules.content.entity.EducationalContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EducationalContentRepository extends JpaRepository<EducationalContent, Long> {
    List<EducationalContent> findByStatusOrderByCreatedAtDesc(String status);
    Optional<EducationalContent> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
