package com.bicap.modules.media.repository;

import com.bicap.modules.media.entity.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {
    Optional<MediaFile> findTopByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);
}
