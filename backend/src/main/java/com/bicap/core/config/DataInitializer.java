package com.bicap.core.config;

import com.bicap.modules.user.service.UserService;
import com.bicap.modules.user.repository.RoleRepository;
import com.bicap.modules.user.entity.Role;
import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    private final UserService userService;
    private final RoleRepository roleRepository;

    public DataInitializer(UserService userService, RoleRepository roleRepository) {
        this.userService = userService;
        this.roleRepository = roleRepository;
    }

    @Bean
    public CommandLineRunner initAdminAccount() {
        return args -> {
            // 1. Tạo các Role mặc định nếu chưa tồn tại trong Database
            for (RoleName roleName : RoleName.values()) {
                if (roleRepository.findByRoleName(roleName.name()).isEmpty()) {
                    Role role = new Role();
                    role.setRoleName(roleName.name());
                    role.setDescription("Vai trò " + roleName.name());
                    roleRepository.save(role);
                    System.out.println("✅ Đã khởi tạo cấu hình Role: " + roleName.name());
                }
            }

            // 2. Tạo tài khoản Administrator mặc định
            try {
                userService.createUser(
                        "Administrator",
                        "admin@bicap.com",
                        "admin123",
                        null,
                        null,
                        RoleName.ADMIN
                );
                System.out.println("✅ Tự động tạo Admin thành công: email=admin@bicap.com, password=admin123");
            } catch (BusinessException ex) {
                if (ex.getMessage().contains("Email đã tồn tại")) {
                     System.out.println("🔸 Tài khoản Admin (admin@bicap.com) đã tồn tại trên localhost của bạn.");
                } else {
                     System.err.println("❌ Lỗi sinh account admin: " + ex.getMessage());
                }
            } catch (Exception e) {
                System.err.println("❌ Có lỗi khi tạo admin account: " + e.getMessage());
            }
        };
    }
}
