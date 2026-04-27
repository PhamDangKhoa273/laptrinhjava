# API Cập Nhật Trạng Thái Đơn Hàng

## 📌 Tổng Quan

API này cho phép cập nhật trạng thái đơn hàng và tự động ghi lại lịch sử thay đổi trên Blockchain.

---

## 🔄 Các Trạng Thái (6 trạng thái)

| Trạng Thái | Ý Nghĩa                         |
| ---------- | ------------------------------- |
| PENDING    | Đơn hàng vừa tạo, chưa xác nhận |
| CONFIRMED  | Đã xác nhận thanh toán          |
| PROCESSING | Đang chuẩn bị hàng              |
| SHIPPED    | Đã gửi đi                       |
| DELIVERED  | Đã nhận hàng                    |
| CANCELLED  | Bị hủy                          |

---

## 📋 Luật Chuyển Trạng Thái

```
PENDING
  → CONFIRMED (khi thanh toán được xác nhận)
  → CANCELLED (khách hủy đơn)

CONFIRMED
  → PROCESSING (farm bắt đầu chuẩn bị)
  → CANCELLED (thanh toán bị từ chối)

PROCESSING
  → SHIPPED (đã gửi đi)
  → CANCELLED (hết hàng)

SHIPPED
  → DELIVERED (khách nhận được)

DELIVERED
  → (không thể chuyển trạng thái khác)

CANCELLED
  → (không thể chuyển trạng thái khác)
```

**Ví dụ không được phép:**

- ❌ PENDING → SHIPPED (phải qua CONFIRMED, PROCESSING trước)
- ❌ DELIVERED → CANCELLED

---

## 🔐 Quyền Hạn

| Vai Trò          | Tạo Đơn | Cập Nhật | Xem Lịch Sử |
| ---------------- | :-----: | :------: | :---------: |
| RETAILER         |   ✅    |    ✅    |     ✅      |
| FARM             |   ❌    |    ✅    |     ✅      |
| SHIPPING_MANAGER |   ❌    |    ✅    |     ✅      |

---

## 📡 Endpoint #1: Cập Nhật Trạng Thái

### Yêu Cầu

```
METHOD: PATCH
URL: http://localhost:8080/api/v1/orders/123/status
```

### Header

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Body

```json
{
  "status": "CONFIRMED",
  "reason": "Thanh toán đã xác nhận"
}
```

- `status` (bắt buộc): Trạng thái mới
- `reason` (tùy chọn): Lý do thay đổi (tối đa 500 ký tự)

### Response Thành Công (200)

```json
{
  "code": 200,
  "success": true,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": {
    "orderId": 123,
    "retailerId": 45,
    "farmId": 67,
    "totalAmount": "250000.00",
    "status": "CONFIRMED",
    "createdAt": "2026-04-15T10:15:30",
    "updatedAt": "2026-04-15T10:20:45",
    "items": [...]
  }
}
```

### Response Lỗi

**Lỗi 400 - Trạng thái không hợp lệ:**

```json
{
  "code": 400,
  "success": false,
  "message": "Trạng thái không hợp lệ: INVALID_STATUS"
}
```

**Lỗi 400 - Không thể chuyển trạng thái:**

```json
{
  "code": 400,
  "success": false,
  "message": "Không thể chuyển từ trạng thái 'PENDING' sang 'SHIPPED'"
}
```

**Lỗi 404 - Không tìm thấy đơn hàng:**

```json
{
  "code": 404,
  "success": false,
  "message": "Không tìm thấy đơn hàng với ID: 999"
}
```

---

## 📜 Endpoint #2: Xem Lịch Sử Thay Đổi

### Yêu Cầu

```
METHOD: GET
URL: http://localhost:8080/api/v1/orders/123/status-history
```

### Header

```
Authorization: Bearer <JWT_TOKEN>
```

### Response Thành Công (200)

```json
{
  "code": 200,
  "success": true,
  "message": "Lấy lịch sử thay đổi trạng thái thành công",
  "data": {
    "items": [
      {
        "historyId": 1,
        "orderId": 123,
        "previousStatus": "PENDING",
        "newStatus": "CONFIRMED",
        "reason": "Thanh toán đã xác nhận",
        "blockchainTxHash": "0x1a2b3c4d5e6f7g8h...",
        "changedAt": "2026-04-15T10:20:45"
      },
      {
        "historyId": 2,
        "orderId": 123,
        "previousStatus": "CONFIRMED",
        "newStatus": "PROCESSING",
        "reason": "Farm bắt đầu chuẩn bị",
        "blockchainTxHash": "0x2b3c4d5e6f7g8h9i...",
        "changedAt": "2026-04-15T10:25:30"
      }
    ],
    "totalItems": 2
  }
}
```

**Các trường:**

- `historyId`: ID của bản ghi lịch sử
- `orderId`: ID đơn hàng
- `previousStatus`: Trạng thái trước
- `newStatus`: Trạng thái sau
- `reason`: Lý do (nếu có)
- `blockchainTxHash`: Mã giao dịch blockchain (chứng minh trên blockchain)
- `changedAt`: Thời gian thay đổi

---

## 💻 Ví Dụ Sử Dụng

### Cách 1: Dùng Curl

**Cập nhật trạng thái:**

```bash
curl -X PATCH http://localhost:8080/api/v1/orders/123/status \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED",
    "reason": "Thanh toán đã xác nhận"
  }'
```

**Xem lịch sử:**

```bash
curl -X GET http://localhost:8080/api/v1/orders/123/status-history \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Cách 2: Dùng JavaScript/Fetch

```javascript
const token = "<JWT_TOKEN>";
const orderId = 123;

// Cập nhật trạng thái
fetch(`http://localhost:8080/api/v1/orders/${orderId}/status`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    status: "CONFIRMED",
    reason: "Thanh toán đã xác nhận",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));

// Xem lịch sử
fetch(`http://localhost:8080/api/v1/orders/${orderId}/status-history`, {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((res) => res.json())
  .then((data) => console.log(data.data.items));
```

### Cách 3: Dùng Postman

1. **Tạo request PATCH:**
   - URL: `http://localhost:8080/api/v1/orders/123/status`
   - Headers: `Authorization: Bearer <token>`
   - Body (JSON):
     ```json
     {
       "status": "CONFIRMED",
       "reason": "Thanh toán đã xác nhận"
     }
     ```

2. **Tạo request GET:**
   - URL: `http://localhost:8080/api/v1/orders/123/status-history`
   - Headers: `Authorization: Bearer <token>`

---

## 🗄️ Cấu Trúc Database

### Bảng: orders

```sql
order_id          - ID đơn hàng (khóa chính)
retailer_id       - ID nhà bán lẻ (khóa ngoài)
farm_id           - ID nông trại (khóa ngoài)
total_amount      - Tổng tiền
status            - Trạng thái hiện tại
created_at        - Thời gian tạo
updated_at        - Thời gian cập nhật
```

### Bảng: order_status_history

```sql
history_id           - ID bản ghi (khóa chính)
order_id             - ID đơn hàng (khóa ngoài)
previous_status      - Trạng thái trước
new_status           - Trạng thái sau
reason               - Lý do thay đổi
blockchain_tx_hash   - Mã blockchain (chứng minh)
changed_at           - Thời gian thay đổi
```

---

## ⚙️ Cấu Hình

File: `application.properties`

```properties
# Blockchain
blockchain.enabled=true
blockchain.rpc-url=http://localhost:8545
blockchain.private-key=<PRIVATE_KEY>
blockchain.contract-address=<CONTRACT_ADDRESS>
blockchain.chain-id=11155111
```

---

## 🚀 Quy Trình Cập Nhật

```
1. Client gửi PATCH /api/v1/orders/{id}/status

2. Server kiểm tra:
   ✓ Trạng thái mới có hợp lệ không?
   ✓ Có thể chuyển từ trạng thái cũ sang mới không?

3. Nếu OK:
   ✓ Tạo bản ghi lịch sử trong database
   ✓ Ghi lên Blockchain (không chặn API)
   ✓ Cập nhật trạng thái đơn hàng
   ✓ Trả về phản hồi thành công (200)

4. Nếu lỗi:
   ✗ Trả về lỗi (400, 404, v.v.)
   ✗ Không cập nhật gì cả
```

---

## 📝 Các Scenario Kiểm Thử

### ✅ Test 1: Cập Nhật PENDING → CONFIRMED

```bash
# Tạo đơn hàng
POST /api/v1/orders
# Nhận được orderId = 123, status = PENDING

# Cập nhật sang CONFIRMED
PATCH /api/v1/orders/123/status
Body: { "status": "CONFIRMED" }
Response: 200 OK, status = CONFIRMED

# Xem lịch sử
GET /api/v1/orders/123/status-history
Response: 1 bản ghi lịch sử + tx hash blockchain
```

### ✅ Test 2: Quy Trình Đầy Đủ

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
```

### ❌ Test 3: Chuyển Trạng Thái Không Hợp Lệ

```bash
PATCH /api/v1/orders/123/status
Body: { "status": "SHIPPED" }  # Từ PENDING sang SHIPPED trực tiếp
Response: 400 Bad Request
Message: "Không thể chuyển từ trạng thái 'PENDING' sang 'SHIPPED'"
```

### ❌ Test 4: Trạng Thái Không Tồn Tại

```bash
PATCH /api/v1/orders/123/status
Body: { "status": "INVALID" }
Response: 400 Bad Request
Message: "Trạng thái không hợp lệ: INVALID"
```

---

## 🛠️ Xử Lý Lỗi

| Lỗi | Nguyên Nhân                 | Giải Pháp                           |
| --- | --------------------------- | ----------------------------------- |
| 401 | JWT token hết hạn           | Đăng nhập lại để lấy token mới      |
| 403 | Không có quyền              | Kiểm tra vai trò của user           |
| 400 | Trạng thái không hợp lệ     | Xem lại danh sách trạng thái hợp lệ |
| 400 | Không thể chuyển trạng thái | Xem lại sơ đồ chuyển trạng thái     |
| 404 | Không tìm thấy order        | Kiểm tra orderId có đúng không      |

---

## 🔗 Blockchain

**Mỗi khi cập nhật trạng thái:**

- Hệ thống tự động ghi lên Blockchain
- Lưu mã giao dịch (tx hash) vào database
- Nếu Blockchain down, API vẫn hoạt động (không chặn)

**Thông tin ghi lên Blockchain:**

```json
{
  "orderId": 123,
  "retailerId": 45,
  "farmId": 67,
  "previousStatus": "PENDING",
  "newStatus": "CONFIRMED",
  "reason": "Thanh toán đã xác nhận",
  "timestamp": "2026-04-15T10:20:45"
}
```

---

## 📊 Các File Liên Quan

| File                              | Mục Đích                        |
| --------------------------------- | ------------------------------- |
| OrderController.java              | Định nghĩa API endpoints        |
| OrderService.java                 | Xử lý logic cập nhật trạng thái |
| OrderStatusHistory.java           | Entity lưu lịch sử              |
| OrderStatusHistoryRepository.java | Tương tác với database          |
| UpdateOrderStatusRequest.java     | DTO nhận dữ liệu từ client      |
| OrderStatusHistoryResponse.java   | DTO gửi dữ liệu về client       |
| V12\_\_\*.sql                     | Script Flyway tạo bảng          |

---

## ❓ Câu Hỏi Thường Gặp

**Q: Tại sao phải đi qua CONFIRMED rồi mới sang PROCESSING?**

- A: Để đảm bảo thanh toán được xác nhận trước khi chuẩn bị hàng.

**Q: Có thể hủy đơn từ các trạng thái khác không?**

- A: Có, từ PENDING và CONFIRMED. Từ PROCESSING trở đi không thể hủy.

**Q: Tx hash là gì?**

- A: Mã định danh duy nhất của giao dịch trên Blockchain, dùng để kiểm chứng tính xác thực.

**Q: Nếu mất kết nối Blockchain có sao không?**

- A: Không, API vẫn cập nhật trạng thái bình thường. Chỉ là không có tx hash.

**Q: Lịch sử có thể xóa được không?**

- A: Không, lịch sử là bất biến (immutable) để audit trail.

---

**Ngày cập nhật:** 15/04/2026  
**Phiên bản:** 1.0
