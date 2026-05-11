package com.bicap.config;

import com.bicap.common.UserRole;
import com.bicap.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    private final UserService userService;

    public DataInitializer(UserService userService) {
        this.userService = userService;
    }

    @Bean
    public CommandLineRunner initAdminAccount() {
        return args -> {
            try {
                // Thử tạo tài khoản admin lúc khởi chạy
                userService.createUser(
                        "admin",
                        "admin123",          
                        UserRole.ADMIN,
                        null                 
                );
                System.out.println("✅ Tự động tạo Admin thành công: username=admin, password=admin123");
            } catch (IllegalArgumentException ex) {
                // Nếu đã tồn tại thì bỏ qua
                System.out.println("🔸 Tài khoản Admin đã tồn tại.");
            } catch (Exception e) {
                System.err.println("❌ Lỗi cấu hình tạo admin: " + e.getMessage());
            }
        };
    }
}
