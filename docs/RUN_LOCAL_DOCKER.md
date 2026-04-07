# BICAP - Docker Local Run Guide

## Mục tiêu
Chuẩn hóa môi trường chạy local cho cả nhóm bằng Docker Compose, tránh lệch cấu hình MySQL / Java / Node giữa các máy.

## Thành phần được đóng gói
- `mysql` - database MySQL 8.4
- `backend` - Spring Boot API chạy port `8080`
- `frontend` - bản build React/Vite phục vụ qua Nginx, map ra port `5173`

## Yêu cầu
- Docker Desktop
- Docker Compose

## 1. Tạo file môi trường
Tại thư mục gốc project:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## 2. Chạy toàn bộ hệ thống
```bash
docker compose up --build
```

Chạy nền:
```bash
docker compose up --build -d
```

## 3. Truy cập hệ thống
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Base API: `http://localhost:8080/api`

## 4. Dừng hệ thống
```bash
docker compose down
```

Xóa luôn volume DB nếu cần reset dữ liệu:
```bash
docker compose down -v
```

## 5. Kiểm tra nhanh sau khi chạy
- Frontend mở được trang login
- Backend truy cập được `http://localhost:8080/api/auth/me` và trả `401` khi chưa có token
- MySQL container ở trạng thái healthy

## 6. Ghi chú cấu hình
Backend đã được chuyển sang đọc biến môi trường:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_JWT_SECRET`
- `APP_JWT_EXPIRATION_MS`
- `APP_JWT_REFRESH_EXPIRATION_MS`

## 7. Một số lệnh hỗ trợ
Xem log:
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

Build lại sạch:
```bash
docker compose build --no-cache
```

## 8. Lưu ý phạm vi
Docker local ở đây nhằm chuẩn hóa môi trường chạy Phase 2. Các tối ưu production như reverse proxy domain, HTTPS, CI/CD pipeline và cloud deploy sẽ là phạm vi mở rộng ở phase sau.
