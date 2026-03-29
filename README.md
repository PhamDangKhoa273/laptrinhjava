# BICAP Backend - Phase 2

Spring Boot backend cho Phase 2 của BICAP.

## Mục tiêu hiện tại

- JWT auth stateless: register, login, me, refresh, logout
- Core user management: create user, update profile, assign role, change status
- Các module nền cho farm, retailer, vehicle, driver, subscription và payment
- Flyway quản lý schema + seed dữ liệu ban đầu

## Cấu trúc chính

```text
src/main/java/com/bicap/backend
├── config
├── controller
├── dto
│   ├── auth
│   ├── request
│   └── response
├── entity
├── enums
├── exception
├── repository
├── security
└── service
```

## Yêu cầu môi trường

- Java 17
- Maven 3.9+ hoặc dùng `mvnw.cmd`
- MySQL 8+

## Cấu hình local

Mặc định app đang đọc trong `src/main/resources/application.properties`:

- DB: `jdbc:mysql://localhost:3306/bicap_db`
- user: `root`
- password: `1234`
- port: `8080`

Nên đổi JWT secret và thông tin DB trước khi chạy thật.

## Chạy project

### 1. Tạo database và kiểm tra MySQL

```sql
CREATE DATABASE IF NOT EXISTS bicap_db;
```

### 2. Chạy app

```powershell
.\mvnw.cmd spring-boot:run
```

Hoặc build/test trước:

```powershell
.\mvnw.cmd test
.\mvnw.cmd clean package
```

## Auth/User API đang chuẩn hoá

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### User

- `POST /api/users`
- `GET /api/users`
- `GET /api/users/{id}`
- `PUT /api/users/{id}/profile`
- `PATCH /api/users/{id}/status`
- `POST /api/users/{id}/roles`
- `GET /api/users/{id}/profile`

`GET /api/users/{id}/profile` trả DTO rõ ràng (`user` + `roles`) thay vì `Map<String, Object>`.

## Kiến trúc hiện tại

- Controller chỉ orchestration request/response
- Service giữ business logic
- Response chung dùng `ApiResponse<T>`
- Request DTO gom theo domain (`auth`, `request`, `response`) để tránh trùng class lung tung
- Security chỉ public đúng các endpoint auth cần public; các route còn lại phải qua JWT hoặc method security

## Tài liệu thêm

- `BACKEND_ARCHITECTURE.md`: overview Phase 2
