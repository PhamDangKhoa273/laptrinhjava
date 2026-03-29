# BICAP Backend Architecture - Phase 2

## Mục tiêu Phase 2

- Dựng backend core cho BICAP bằng Spring Boot
- Hoàn thiện auth flow: register, login, me, logout, refresh token
- Chuẩn hoá security bằng JWT stateless
- Kết nối MySQL và quản lý schema bằng Flyway
- Định nghĩa response/error format chung để các module sau bám theo

## Stack

- Java 17
- Spring Boot 3.2.5
- Spring Web
- Spring Security
- Spring Data JPA
- MySQL
- Flyway
- JJWT
- Lombok

## Cấu trúc thư mục

```text
src/main/java/com/bicap/backend
├── config          # Bean config, Security config
├── controller      # REST API entrypoints
├── dto             # request/response DTO
├── entity          # JPA entities
├── enums           # enum dùng chung
├── exception       # business exception + global handler
├── repository      # JPA repository
├── security        # JWT provider, filter, principal, security utils
└── service         # business logic
```

## Auth API chuẩn Phase 2

### 1. Register
- `POST /api/auth/register`
- Tạo user mới
- Auto gán role mặc định `GUEST`
- Mật khẩu được hash bằng BCrypt

### 2. Login
- `POST /api/auth/login`
- Trả về:
  - access token
  - refresh token
  - user info
  - roles

### 3. Me
- `GET /api/auth/me`
- Lấy user hiện tại từ access token

### 4. Refresh token
- `POST /api/auth/refresh`
- Nhận refresh token và cấp cặp token mới

### 5. Logout
- `POST /api/auth/logout`
- Hiện tại là stateless logout: backend trả thông báo, frontend xoá token local
- Nếu Phase sau cần revoke thực sự thì thêm token blacklist / refresh-token table

## Security flow

1. Client gửi `Authorization: Bearer <access-token>`
2. `JwtAuthenticationFilter` đọc token từ header
3. `JwtTokenProvider` validate chữ ký + hạn token
4. `CustomUserDetailsService` nạp user + roles
5. Spring Security set authentication vào `SecurityContext`
6. Controller/service lấy user hiện tại qua `SecurityUtils`

## Response format chung

```json
{
  "code": "SUCCESS",
  "message": "OK",
  "data": {}
}
```

## Validation / Error format chung

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Dữ liệu không hợp lệ",
  "data": {
    "email": "Email không hợp lệ"
  }
}
```

Các mã lỗi chính:
- `BUSINESS_ERROR`
- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `INTERNAL_SERVER_ERROR`

## Database

- Kết nối MySQL qua `application.properties`
- Flyway migration hiện có:
  - `V1__create_phase2_core_tables.sql`
  - `V2__seed_phase2_core_data.sql`
  - `V3__create_audit_logs.sql`

## Quy ước tích hợp cho team backend

- Controller chỉ nhận/trả DTO, không chứa business logic nặng
- Service xử lý nghiệp vụ
- Repository chỉ truy cập dữ liệu
- Tất cả API nên trả về `ApiResponse<T>`
- Tất cả request input phải dùng validation annotation
- Role trong Security dùng format `ROLE_<ROLE_NAME>`
- Không trả password hash ra response

## Gợi ý Phase sau

- Tách auth thành package riêng (`auth/`)
- Thêm refresh token persistence
- Thêm audit log cho auth actions
- Thêm OpenAPI/Swagger
- Bổ sung test cho auth + security
