# BICAP - Java Web Version

Project này hiện dùng:
- **Backend:** Java Spring Boot
- **Frontend:** Java Spring Boot + Thymeleaf
- **Database:** MySQL

## Màn hình đã dựng bằng Java web
- Đăng nhập
- Đăng ký
- Dashboard
- Hồ sơ cá nhân

## Công nghệ chính
- Spring Boot 3
- Spring Security
- Spring Data JPA
- Thymeleaf
- Flyway
- MySQL

## Chạy project
Cập nhật DB trong `src/main/resources/application.properties` rồi chạy:

```bash
./mvnw spring-boot:run
```

Ứng dụng mặc định chạy ở:
- `http://localhost:8080`

## Lưu ý
Nếu MySQL chưa bật hoặc sai tài khoản DB, ứng dụng sẽ không khởi động được.
