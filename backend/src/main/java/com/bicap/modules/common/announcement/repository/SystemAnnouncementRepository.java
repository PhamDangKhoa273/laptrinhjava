package com.bicap.modules.common.announcement.repository;

import com.bicap.modules.common.announcement.entity.SystemAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SystemAnnouncementRepository extends JpaRepository<SystemAnnouncement, Long> {
    Optional<SystemAnnouncement> findFirstByActiveTrueOrderByUpdatedAtDesc();
}
