# Hướng Dẫn Kiểm Thử API Cập Nhật Trạng Thái Đơn Hàng

## 🔑 Bước 1: Lấy JWT Token

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "retailer@example.com",
    "password": "YourPassword123"
  }'
```

**Response:**

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "tokenType": "Bearer"
}
```

Lưu `accessToken` để dùng sau.

---

## 📝 Test Case 1: Tạo Đơn Hàng

**Endpoint:** `POST /api/v1/orders`

```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "listingId": 1,
        "quantity": 5
      }
    ]
  }'
```

**Response (200):**

```json
{
  "data": {
    "orderId": 123,
    "retailerId": 45,
    "farmId": 67,
    "totalAmount": "250000.00",
    "status": "PENDING",
    "createdAt": "2026-04-15T10:15:30",
    "items": [...]
  }
}
```

**Ghi nhớ Order ID:** `123`

---

## ✅ Test Case 2: Cập Nhật PENDING → CONFIRMED

**Endpoint:** `PATCH /api/v1/orders/123/status`

```bash
curl -X PATCH http://localhost:8080/api/v1/orders/123/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED",
    "reason": "Thanh toán đã xác nhận"
  }'
```

**Response (200):**

```json
{
  "code": 200,
  "success": true,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": {
    "orderId": 123,
    "status": "CONFIRMED",
    "updatedAt": "2026-04-15T10:20:45"
  }
}
```

---

## ✅ Test Case 3: Cập Nhật CONFIRMED → SHIPPING

```bash
curl -X PATCH http://localhost:8080/api/v1/orders/123/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPING",
    "reason": "Bắt đầu giao hàng"
  }'
```

---

## ✅ Test Case 4: Cập Nhật SHIPPING → COMPLETED

```bash
curl -X PATCH http://localhost:8080/api/v1/orders/123/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "reason": "Retailer nhận hàng"
  }'
```

**Response (200) - Blockchain ghi lại:**

```json
{
  "code": 200,
  "success": true,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": {
    "orderId": 123,
    "status": "COMPLETED",
    "updatedAt": "2026-04-15T10:40:45"
  }
}
```

---

## 📜 Test Case 5: Xem Lịch Sử Thay Đổi

**Endpoint:** `GET /api/v1/orders/123/status-history`

```bash
curl -X GET http://localhost:8080/api/v1/orders/123/status-history \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (200):**

```json
{
  "code": 200,
  "success": true,
  "message": "Lấy lịch sử thay đổi trạng thái thành công",
  "data": {
    "items": [
      {
        "historyId": 3,
        "orderId": 123,
        "previousStatus": "SHIPPING",
        "newStatus": "COMPLETED",
        "reason": "Retailer nhận hàng",
        "blockchainTxHash": "0x3c4d5e...",
        "changedAt": "2026-04-15T10:40:45"
      },
      {
        "historyId": 2,
        "orderId": 123,
        "previousStatus": "CONFIRMED",
        "newStatus": "SHIPPING",
        "reason": "Bắt đầu giao hàng",
        "blockchainTxHash": null,
        "changedAt": "2026-04-15T10:25:15"
      },
      {
        "historyId": 1,
        "orderId": 123,
        "previousStatus": "PENDING",
        "newStatus": "CONFIRMED",
        "reason": "Thanh toán đã xác nhận",
        "blockchainTxHash": "0x1a2b3c...",
        "changedAt": "2026-04-15T10:20:45"
      }
    ],
    "totalItems": 3
  }
}
```

**Lưu ý:** Chỉ CONFIRMED và COMPLETED có `blockchainTxHash` (ghi lên blockchain)

---

## ❌ Test Case 6: Lỗi - Chuyển Trạng Thái Không Hợp Lệ

**Cố gắng:** Chuyển từ PENDING sang SHIPPING trực tiếp (bỏ qua CONFIRMED)

```bash
curl -X PATCH http://localhost:8080/api/v1/orders/456/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPING"
  }'
```

**Response (400):**

```json
{
  "code": 400,
  "success": false,
  "message": "Không thể chuyển từ trạng thái 'PENDING' sang 'SHIPPING'"
}
```

✅ **Kết quả:** Lỗi như mong đợi

---

## ❌ Test Case 7: Lỗi - Trạng Thái Không Tồn Tại

```bash
curl -X PATCH http://localhost:8080/api/v1/orders/123/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INVALID_STATUS"
  }'
```

**Response (400):**

```json
{
  "code": 400,
  "success": false,
  "message": "Trạng thái không hợp lệ: INVALID_STATUS"
}
```

---

## ❌ Test Case 8: Lỗi - Đơn Hàng Không Tồn Tại

```bash
curl -X PATCH http://localhost:8080/api/v1/orders/999999/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED"
  }'
```

**Response (404):**

```json
{
  "code": 404,
  "success": false,
  "message": "Không tìm thấy đơn hàng với ID: 999999"
}
```

---

## 🆘 Test Case 9: Hủy Đơn Hàng (Chỉ Được Hủy Khi PENDING)

**Tạo đơn hàng mới:** Order ID = 789

**Cập nhật sang CANCELLED:**

```bash
curl -X PATCH http://localhost:8080/api/v1/orders/789/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CANCELLED",
    "reason": "Khách hủy"
  }'
```

**Response (200):**

```json
{
  "code": 200,
  "success": true,
  "data": {
    "orderId": 789,
    "status": "CANCELLED"
  }
}
```

---

## ❌ Test Case 10: Lỗi - Không Thể Hủy Sau Khi CONFIRMED

**Cố gắng hủy đơn hàng đã xác nhận:**

```bash
curl -X PATCH http://localhost:8080/api/v1/orders/123/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CANCELLED",
    "reason": "Đổi ý"
  }'
```

(Giả sử order 123 đã là CONFIRMED)

**Response (400):**

```json
{
  "code": 400,
  "success": false,
  "message": "Không thể chuyển từ trạng thái 'CONFIRMED' sang 'CANCELLED'"
}
```

✅ **Kết quả:** Nhận lỗi - Chỉ được hủy khi PENDING

---

## 🗄️ Kiểm Tra Database

Sau khi test, kiểm tra database:

```sql
-- Xem tất cả đơn hàng
SELECT * FROM orders;

-- Xem lịch sử thay đổi của đơn hàng 123
SELECT * FROM order_status_history WHERE order_id = 123 ORDER BY changed_at DESC;

-- Đếm số lần thay đổi
SELECT COUNT(*) as total_changes FROM order_status_history WHERE order_id = 123;

-- Kiểm tra blockchain hash có được lưu không
SELECT history_id, new_status, blockchain_tx_hash FROM order_status_history
WHERE order_id = 123 AND blockchain_tx_hash IS NOT NULL;
```

---

## 📱 Postman Collection

### Bước 1: Import Collection

```json
{
  "info": {
    "name": "Order Status Management",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:8080/api/auth/login"
      }
    },
    {
      "name": "Create Order",
      "request": {
        "method": "POST",
        "url": "http://localhost:8080/api/v1/orders"
      }
    },
    {
      "name": "Update Status",
      "request": {
        "method": "PATCH",
        "url": "http://localhost:8080/api/v1/orders/{{orderId}}/status"
      }
    },
    {
      "name": "Get Status History",
      "request": {
        "method": "GET",
        "url": "http://localhost:8080/api/v1/orders/{{orderId}}/status-history"
      }
    }
  ]
}
```

---

## 📊 Load Test Script

```bash
#!/bin/bash

TOKEN="<YOUR_TOKEN>"
BASE_URL="http://localhost:8080/api/v1"

echo "=== Tạo 5 đơn hàng ==="
for i in {1..5}; do
  ORDER_ID=$(curl -s -X POST $BASE_URL/orders \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"items": [{"listingId": 1, "quantity": 5}]}' \
    | jq '.data.orderId')

  echo "Order $i: $ORDER_ID"
  echo "$ORDER_ID" >> orders.txt
done

echo ""
echo "=== Cập nhật trạng thái ==="
while read ORDER_ID; do
  for STATUS in CONFIRMED SHIPPING COMPLETED; do
    curl -s -X PATCH $BASE_URL/orders/$ORDER_ID/status \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"status\": \"$STATUS\"}" > /dev/null

    echo "Order $ORDER_ID → $STATUS"
    sleep 1
  done
done < orders.txt

echo ""
echo "=== Kiểm tra lịch sử ==="
while read ORDER_ID; do
  curl -s -X GET $BASE_URL/orders/$ORDER_ID/status-history \
    -H "Authorization: Bearer $TOKEN" \
    | jq '.data.totalItems' | xargs echo "Order $ORDER_ID: total changes ="
done < orders.txt

rm orders.txt
```

---

## ⚠️ Lỗi Phổ Biến & Giải Pháp

| Lỗi                       | Nguyên Nhân            | Giải Pháp                         |
| ------------------------- | ---------------------- | --------------------------------- |
| 401 Unauthorized          | JWT expired            | Đăng nhập lại                     |
| 403 Forbidden             | Không có role          | Kiểm tra user's role              |
| 400 Invalid transition    | Chuyển trạng thái sai  | Xem luật chuyển trạng thái        |
| 404 Not found             | Order ID không tồn tại | Kiểm tra lại order ID             |
| blockchain_tx_hash = null | Blockchain down        | Normal, bỏ qua hoặc kiểm tra logs |

---

**Phiên bản:** 1.0  
**Ngày cập nhật:** 15/04/2026  
**Ngôn ngữ:** Tiếng Việt
