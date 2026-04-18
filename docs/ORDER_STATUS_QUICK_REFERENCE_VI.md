# Tham Khảo Nhanh - Cập Nhật Trạng Thái Đơn Hàng

## 🚀 Bắt Đầu Nhanh

### Cập Nhật Trạng Thái

```bash
curl -X PATCH http://localhost:8080/api/v1/orders/123/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED", "reason": "Thanh toán xác nhận"}'
```

### Xem Lịch Sử

```bash
curl -X GET http://localhost:8080/api/v1/orders/123/status-history \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 📊 Các Trạng Thái (5 cái)

```
PENDING
  ├─→ CONFIRMED [Blockchain: ✅]
  └─→ CANCELLED

CONFIRMED
  └─→ SHIPPING

SHIPPING
  └─→ COMPLETED [Blockchain: ✅] (kết thúc)

CANCELLED (kết thúc - Chỉ được hủy từ PENDING)
```

---

## 🔐 Quyền Hạn

| Vai Trò          | Cập Nhật | Xem Lịch Sử |
| ---------------- | :------: | :---------: |
| RETAILER         |    ✅    |     ✅      |
| FARM             |    ✅    |     ✅      |
| SHIPPING_MANAGER |    ✅    |     ✅      |

---

## 💻 Code JavaScript

### Cập Nhật Trạng Thái

```javascript
const token = "eyJhbGc...";
const orderId = 123;

fetch(`http://localhost:8080/api/v1/orders/${orderId}/status`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    status: "CONFIRMED",
    reason: "Thanh toán xác nhận",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log("Cập nhật thành công:", data));
```

### Xem Lịch Sử

```javascript
fetch(`http://localhost:8080/api/v1/orders/${orderId}/status-history`, {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((res) => res.json())
  .then((data) => {
    data.data.items.forEach((item) => {
      console.log(
        `${item.previousStatus} → ${item.newStatus} (${item.changedAt})`,
      );
    });
  });
```

---

## 📋 DTO Structure

### Request

```json
{
  "status": "String (required)",
  "reason": "String (optional, max 500 char)"
}
```

### Response Items

```json
{
  "historyId": "Number",
  "orderId": "Number",
  "previousStatus": "String",
  "newStatus": "String",
  "reason": "String",
  "blockchainTxHash": "String (0x...)",
  "changedAt": "DateTime"
}
```

---

## 🚫 Lỗi Phổ Biến

| Lỗi                            | HTTP | Lý Do                        |
| ------------------------------ | ---- | ---------------------------- |
| "Trạng thái không hợp lệ"      | 400  | Status không trong danh sách |
| "Không thể chuyển từ X sang Y" | 400  | Transition không được phép   |
| "Không tìm thấy đơn hàng"      | 404  | Order ID không tồn tại       |
| Unauthorized                   | 401  | JWT hết hạn                  |
| Forbidden                      | 403  | Không có role                |

---

## 🔧 Cấu Hình MySQL

### Tạo Bảng

```bash
mvn flyway:migrate
```

### Xóa & Tạo Lại

```sql
DROP TABLE order_status_history;
DROP TABLE order_items;
DROP TABLE orders;
```

Rồi chạy `mvn flyway:migrate` lại

---

## 📝 Postman Setup

1. **Environment Variables:**
   - `base_url`: http://localhost:8080
   - `token`: <YOUR_JWT_TOKEN>
   - `orderId`: 123

2. **Headers mặc định:**

   ```
   Authorization: Bearer {{token}}
   Content-Type: application/json
   ```

3. **Endpoints:**
   - `PATCH {{base_url}}/api/v1/orders/{{orderId}}/status`
   - `GET {{base_url}}/api/v1/orders/{{orderId}}/status-history`

---

## 🔗 Blockchain

**Mỗi khi cập nhật:**

- Tự động ghi lên Blockchain
- Lưu tx hash vào database
- Không chặn API (fire & forget)

**Payload:**

```json
{
  "orderId": 123,
  "retailerId": 45,
  "farmId": 67,
  "previousStatus": "PENDING",
  "newStatus": "CONFIRMED",
  "reason": "...",
  "timestamp": "2026-04-15T10:20:45"
}
```

---

## 📂 Files Quan Trọng

| File                                              | Mục Đích       |
| ------------------------------------------------- | -------------- |
| OrderController.java                              | 2 endpoints    |
| OrderService.java                                 | Business logic |
| OrderStatusHistory.java                           | Entity         |
| UpdateOrderStatusRequest.java                     | Request DTO    |
| OrderStatusHistoryResponse.java                   | Response DTO   |
| V12\_\_create_orders_and_order_status_history.sql | Migration      |

---

## ⚙️ Configuration

```properties
blockchain.enabled=true
blockchain.rpc-url=http://localhost:8545
blockchain.private-key=<KEY>
blockchain.contract-address=<ADDRESS>
blockchain.chain-id=11155111
```

---

## 🔄 Quy Trình Đầy Đủ

```
1. POST /orders (tạo đơn) → status = PENDING
2. PATCH /orders/123/status → CONFIRMED
3. PATCH /orders/123/status → PROCESSING
4. PATCH /orders/123/status → SHIPPED
5. PATCH /orders/123/status → DELIVERED
6. GET /orders/123/status-history → xem 4 bản ghi lịch sử
```

---

## 💡 Mẹo

- Luôn dùng header `Authorization: Bearer <token>`
- Status là **case-sensitive** (phải in HOA)
- Reason là tùy chọn nhưng nên điền để audit tốt
- blockchain_tx_hash có thể NULL nếu blockchain disabled
- Không thể xóa lịch sử (immutable)

---

**Phiên bản:** 1.0  
**Ngày:** 15/04/2026  
**Ngôn ngữ:** Tiếng Việt
