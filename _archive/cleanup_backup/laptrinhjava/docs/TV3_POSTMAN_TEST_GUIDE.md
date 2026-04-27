# TV3 - Product Batch Backend Test Guide

## Mục tiêu
Kiểm thử end-to-end cho phần TV3:
- tạo batch
- cập nhật batch
- xem danh sách/chi tiết batch
- lấy QR code
- truy xuất trace

## 1) Đăng ký tài khoản farm
**POST** `/api/auth/register`

```json
{
  "fullName": "Farm User TV3",
  "email": "farmtv3@example.com",
  "password": "123456",
  "phone": "0912345678",
  "avatarUrl": ""
}
```

> Lưu ý: mặc định tài khoản mới có thể là `GUEST`. Nếu hệ thống của nhóm đã có admin và chức năng gán role thì cần gán role `FARM` cho user này trước khi test tạo batch.

## 2) Đăng nhập
**POST** `/api/auth/login`

```json
{
  "email": "farmtv3@example.com",
  "password": "123456"
}
```

Lấy `accessToken` để gắn vào header:

```http
Authorization: Bearer <accessToken>
```

## 3) Tạo farm trước khi tạo batch
**POST** `/api/farms`

```json
{
  "farmCode": "FARM-TV3-01",
  "farmName": "Nong Trai TV3",
  "businessLicenseNo": "BLN-TV3-001",
  "address": "Thu Duc, TP.HCM",
  "province": "Ho Chi Minh",
  "description": "Farm test cho Product Batch"
}
```

Lưu lại `farmId`.

## 4) Tạo batch
**POST** `/api/product-batches`

```json
{
  "farmId": 1,
  "seasonId": 101,
  "batchCode": "BATCH-TV3-001",
  "productName": "Rau sach",
  "quantity": 150.5,
  "unit": "kg",
  "exportDate": "2026-04-04",
  "traceUrl": "http://localhost:8080/api/product-batches/trace/1"
}
```

Kỳ vọng:
- tạo thành công
- có `blockchainTxHash`
- có `qrCodeData`

## 5) Xem danh sách batch
**GET** `/api/product-batches`

Hoặc lọc theo farm:
**GET** `/api/product-batches?farmId=1`

## 6) Xem chi tiết batch
**GET** `/api/product-batches/{id}`

## 7) Cập nhật batch
**PUT** `/api/product-batches/{id}`

```json
{
  "seasonId": 101,
  "productName": "Rau sach huu co",
  "quantity": 200,
  "unit": "kg",
  "exportDate": "2026-04-05",
  "status": "EXPORTED",
  "traceUrl": "http://localhost:8080/api/product-batches/trace/1"
}
```

Kỳ vọng:
- status cập nhật
- qrCodeData cập nhật
- blockchainTxHash thay đổi theo dữ liệu mới

## 8) Lấy QR code dạng JSON + base64
**GET** `/api/product-batches/{id}/qr`

Kỳ vọng:
- có `qrCodeData`
- có `qrCodeBase64`

## 9) Lấy QR code PNG trực tiếp
**GET** `/api/product-batches/{id}/qr-image`

Kỳ vọng:
- trả về file PNG hoặc hiển thị ảnh QR trên browser/Postman

## 10) Truy xuất công khai
**GET** `/api/product-batches/trace/{id}`

Kỳ vọng:
- không cần token
- xem được thông tin batch để phục vụ truy xuất nguồn gốc

## Kết quả demo mong muốn
Luồng demo đẹp nhất:
1. đăng nhập farm
2. tạo farm
3. tạo batch
4. mở QR
5. mở trace endpoint
6. cập nhật batch
7. xem tx hash thay đổi
