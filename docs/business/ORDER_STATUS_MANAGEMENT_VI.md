# Quản Lý Vòng Đời Đơn Hàng Với Blockchain

## 📌 Tổng Quan

Hệ thống này cho phép cập nhật trạng thái đơn hàng và tự động ghi lại tất cả thay đổi lên Blockchain một cách không thể thay đổi.

---

## 🔄 Cấu Trúc Database

### Bảng: orders (Đơn Hàng)

```sql
order_id          BIGINT PRIMARY KEY      - ID đơn hàng
retailer_id       BIGINT FOREIGN KEY      - ID nhà bán lẻ
farm_id           BIGINT FOREIGN KEY      - ID nông trại
total_amount      DECIMAL(18,2)           - Tổng tiền
status            VARCHAR(30) DEFAULT...  - Trạng thái
created_at        DATETIME                - Thời tạo
updated_at        DATETIME                - Thời cập nhật
```

### Bảng: order_items (Chi Tiết Đơn Hàng)

```sql
order_item_id     BIGINT PRIMARY KEY      - ID chi tiết
order_id          BIGINT FOREIGN KEY      - Liên kết đến orders
listing_id        BIGINT FOREIGN KEY      - Liên kết đến sản phẩm
quantity          DECIMAL(15,2)           - Số lượng
price             DECIMAL(15,2)           - Giá tại thời điểm mua
created_at        DATETIME                - Thời tạo
updated_at        DATETIME                - Thời cập nhật
```

### Bảng: order_status_history (Lịch Sử Thay Đổi Trạng Thái)

```sql
history_id              BIGINT PRIMARY KEY      - ID bản ghi
order_id                BIGINT FOREIGN KEY      - Đơn hàng bị thay đổi
previous_status         VARCHAR(30)             - Trạng thái cũ
new_status              VARCHAR(30)             - Trạng thái mới
reason                  VARCHAR(500)            - Lý do thay đổi
blockchain_tx_hash      VARCHAR(255)            - Mã giao dịch blockchain
changed_at              DATETIME                - Thời thay đổi
```

---

## 📡 Các Endpoint API

### 1️⃣ Endpoint: Cập Nhật Trạng Thái (PATCH)

**URL:** `PATCH /api/v1/orders/{id}/status`

**Quyền Hạn:** RETAILER, FARM, SHIPPING_MANAGER

**Request Body:**

```json
{
  "status": "CONFIRMED",
  "reason": "Thanh toán đã xác nhận"
}
```

**Response Thành Công (200):**

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
    "updatedAt": "2026-04-15T10:20:45"
  }
}
```

---

### 2️⃣ Endpoint: Xem Lịch Sử (GET)

**URL:** `GET /api/v1/orders/{id}/status-history`

**Quyền Hạn:** RETAILER, FARM, SHIPPING_MANAGER

**Response Thành Công (200):**

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
        "blockchainTxHash": "0x1a2b3c4d...",
        "changedAt": "2026-04-15T10:20:45"
      }
    ],
    "totalItems": 1
  }
}
```

---

## 🔐 Các Trạng Thái & Luật Chuyển

| Trạng Thái | Ý Nghĩa                       | Có Thể Chuyển Sang   | Blockchain |
| ---------- | ----------------------------- | -------------------- | ---------- |
| PENDING    | Đơn hàng vừa tạo              | CONFIRMED, CANCELLED | ❌ Không   |
| CONFIRMED  | Farm xác nhận đơn (minh bạch) | SHIPPING             | ✅ **Có**  |
| SHIPPING   | Bắt đầu giao hàng             | COMPLETED            | ❌ Không   |
| COMPLETED  | Retailer nhận hàng (kết thúc) | Không                | ✅ **Có**  |
| CANCELLED  | Bị hủy (chỉ từ PENDING)       | Không                | ❌ Không   |

```
PENDING
  → CONFIRMED [Blockchain: ✅ Ghi lại] (Farm xác nhận đơn)
  → CANCELLED (Hủy khi còn PENDING)

CONFIRMED
  → SHIPPING (Bắt đầu vận chuyển)

SHIPPING
  → COMPLETED [Blockchain: ✅ Ghi lại] (Retailer nhận hàng)

COMPLETED (final ✓)
CANCELLED (final ✗ - Chỉ hủy được từ PENDING)
```

---

## 📋 Các DTOs

### UpdateOrderStatusRequest

```json
{
  "status": "CONFIRMED", // Bắt buộc
  "reason": "Thanh toán xác nhận" // Tùy chọn (max 500 ký tự)
}
```

### OrderStatusHistoryResponse

```json
{
  "historyId": 1,
  "orderId": 123,
  "previousStatus": "PENDING",
  "newStatus": "CONFIRMED",
  "reason": "Thanh toán xác nhận",
  "blockchainTxHash": "0x1a2b3c4d...",
  "changedAt": "2026-04-15T10:20:45"
}
```

---

## 🔗 Blockchain Integration

### 📌 Ghi Lên Blockchain Khi:

- ✅ **PENDING → CONFIRMED** (Farm xác nhận đơn)
- ✅ **SHIPPING → COMPLETED** (Retailer nhận hàng)

### Dữ Liệu Ghi Lên Blockchain

```json
{
  "orderId": 123,
  "retailerId": 45,
  "farmId": 67,
  "previousStatus": "PENDING",
  "newStatus": "CONFIRMED",
  "reason": "Farm xác nhận đơn hàng",
  "timestamp": "2026-04-15T10:20:45"
}
```

**Đặc điểm:**

- Minh bạch hoá việc mua-bán trên blockchain
- Immutable audit trail (không thể thay đổi)
- **Non-blocking**: Lỗi blockchain không làm hại API
- Tx hash lưu trong `blockchain_tx_hash` của `order_status_history`

---

## 🚫 Xử Lý Lỗi

| Lỗi                         | HTTP | Thông Báo                                      |
| --------------------------- | ---- | ---------------------------------------------- |
| Trạng thái không hợp lệ     | 400  | "Trạng thái không hợp lệ: INVALID"             |
| Không thể chuyển trạng thái | 400  | "Không thể chuyển từ 'PENDING' sang 'SHIPPED'" |
| Không tìm thấy đơn hàng     | 404  | "Không tìm thấy đơn hàng với ID: 999"          |
| Hết hạn JWT                 | 401  | "Unauthorized"                                 |
| Không có quyền              | 403  | "Forbidden"                                    |

---

## 🏗️ Kiến Trúc Code

| File                                              | Loại | Mục Đích           |
| ------------------------------------------------- | ---- | ------------------ |
| OrderController.java                              | Java | 2 API endpoints    |
| OrderService.java                                 | Java | Business logic     |
| OrderStatusHistory.java                           | Java | Entity             |
| OrderStatusHistoryRepository.java                 | Java | Database query     |
| UpdateOrderStatusRequest.java                     | Java | Request DTO        |
| OrderStatusHistoryResponse.java                   | Java | Response DTO       |
| OrderStatusBlockchainPayload.java                 | Java | Blockchain payload |
| V12\_\_create_orders_and_order_status_history.sql | SQL  | Flyway migration   |

---

## ⚙️ Cấu Hình

File: `application.properties`

```properties
blockchain.enabled=true
blockchain.rpc-url=http://localhost:8545
blockchain.private-key=<YOUR_PRIVATE_KEY>
blockchain.contract-address=<CONTRACT_ADDRESS>
blockchain.chain-id=11155111
```

---

**Phiên bản:** 1.0  
**Ngày cập nhật:** 15/04/2026  
**Ngôn ngữ:** Tiếng Việt
