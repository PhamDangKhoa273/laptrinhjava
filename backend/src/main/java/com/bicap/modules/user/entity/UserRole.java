package com.bicap.modules.user.entity;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.entity.UserRole;
import com.bicap.modules.user.entity.Role;

import com.bicap.modules.user.entity.User;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_roles",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "role_id"}))
public class UserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_role_id")
    private Long userRoleId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    @PrePersist
    public void prePersist() {
        this.assignedAt = LocalDateTime.now();
    }
    public com.bicap.modules.user.entity.Role getRole() { return role; }
    public void setRole(com.bicap.modules.user.entity.Role role) { this.role = role; }
    public Long getUserRoleId() { return userRoleId; }
    public void setUserRoleId(Long id) { this.userRoleId = id; }


    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }


    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
}
