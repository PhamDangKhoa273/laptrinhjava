# 📮 Hướng Dẫn Chi Tiết Test API Với Postman

## 📋 Nội Dung

1. [Cài Đặt Postman](#1-cài-đặt-postman)
2. [Tạo Environment](#2-tạo-environment)
3. [Tạo Collection](#3-tạo-collection)
4. [Test Từng Bước](#4-test-từng-bước)
5. [Kiểm Tra Kết Quả](#5-kiểm-tra-kết-quả)

---

## 1️⃣ Cài Đặt Postman

### Bước 1: Tải Postman
- Vào: https://www.postman.com/downloads/
- Chọn phiên bản cho Windows
- Cài đặt và mở

### Bước 2: Đăng Nhập (Tùy Chọn)
- Nếu muốn lưu collection để team dùng chung
- Hoặc dùng Postman Local (không cần đăng nhập)

---

## 2️⃣ Tạo Environment

### Bước 1: Mở Environment Manager
- Kéo xuống góc trái (hoặc `Ctrl+Alt+E`)
- Chọn **Environments**
- Click **"+"** để tạo environment mới

### Bước 2: Nhập Tên & Biến

**Environment Name:** `Order_API_Dev`

**Variables:**

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| base_url | http://localhost:8080 | http://localhost:8080 |
| token | (để trống) | (sẽ update sau login) |
| order_id | (để trống) | (sẽ update sau tạo order) |

**Cách nhập:**

```
1. Click "Add Variable" (phía dưới)
2. Variable name: base_url
3. Initial Value: http://localhost:8080
4. Current Value: http://localhost:8080
5. Lặp lại cho token, order_id
6. Click "Save"
```

### Bước 3: Chọn Environment
- Góc phải trên, chọn dropdown
- Chọn `Order_API_Dev`

✅ Khi chọn đúng sẽ thấy tên environment bên cạnh tab nước ngoài

---

## 3️⃣ Tạo Collection

### Bước 1: Tạo Collection
- Click **New** → **Collection**
- Name: `Order Status API`
- Click **Create**

### Bước 2: Thêm Requests

Sẽ tạo 6 requests theo thứ tự:

```
Q1: Login
Q2: Create Order
Q3: Update to CONFIRMED
Q4: Update to SHIPPING
Q5: Update to COMPLETED
Q6: Get Status History
```

---

## 4️⃣ Test Từng Bước

### 📝 Request 1: Login

**Trong Collection, click "+" → Add Request**

```
Name: 1_Login
Method: POST
URL: {{base_url}}/api/auth/login
```

**Tab Headers:**
```
Content-Type: application/json
```

**Tab Body (raw - JSON):**
```json
{
  "email": "retailer@example.com",
  "password": "YourPassword123"
}
```

**Tab Tests (Tự động lưu token):**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.accessToken);
    console.log("✅ Token lưu: " + jsonData.accessToken.substring(0, 20) + "...");
}
```

**Bước chạy:**
1. Click **Send**
2. Xem Response (status 200)
3. Kiểm tra biến `access_token` được lưu
   - Tab `Environment` → `Order_API_Dev` → Check `token` có value

✅ **Kết Quả Mong Đợi:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "tokenType": "Bearer"
}
```

---

### 📝 Request 2: Create Order

```
Name: 2_Create_Order
Method: POST
URL: {{base_url}}/api/v1/orders
```

**Tab Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Tab Body (raw - JSON):**
```json
{
  "items": [
    {
      "listingId": 1,
      "quantity": 5
    }
  ]
}
```

**Tab Tests (Lưu Order ID):**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    var orderId = jsonData.data.orderId;
    pm.environment.set("order_id", orderId);
    console.log("✅ Order ID lưu: " + orderId);
}
```

**Bước chạy:**
1. Click **Send**
2. Xem Response (status 200, data có orderId)
3. Kiểm tra biến `order_id` được lưu

✅ **Kết Quả Mong Đợi:**
```json
{
  "code": 200,
  "success": true,
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

**⚠️ Lỗi Phổ Biến:**
- **401 Unauthorized**: Token hết hạn → Login lại
- **400 items is required**: Quên items field → Thêm items vào body
- **400 quantity_available not enough**: Listing không đủ → Chọn quantity nhỏ hơn

---

### 📝 Request 3: Update to CONFIRMED

```
Name: 3_Update_to_CONFIRMED
Method: PATCH
URL: {{base_url}}/api/v1/orders/{{order_id}}/status
```

**Tab Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Tab Body (raw - JSON):**
```json
{
  "status": "CONFIRMED",
  "reason": "Farm xác nhận đơn hàng"
}
```

**Tab Tests:**
```javascript
if (pm.response.code === 200) {
    console.log("✅ Chuyển sang CONFIRMED thành công");
    var jsonData = pm.response.json();
    console.log("Status: " + jsonData.data.status);
}
```

**Bước chạy:**
1. Click **Send**
2. Kiểm tra Response (status = CONFIRMED)
3. Kiểm tra `updatedAt` được cập nhật

✅ **Kết Quả Mong Đợi:**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "orderId": 123,
    "status": "CONFIRMED",
    "updatedAt": "2026-04-15T10:20:45"
  }
}
```

**⚠️ Lỗi Phổ Biến:**
- **400 Invalid transition**: Trạng thái hiện tại không cho phép → Check trạng thái hiện tại
- **404 Not found**: Order ID sai → Kiểm tra biến `order_id`

---

### 📝 Request 4: Update to SHIPPING

```
Name: 4_Update_to_SHIPPING
Method: PATCH
URL: {{base_url}}/api/v1/orders/{{order_id}}/status
```

**Tab Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Tab Body (raw - JSON):**
```json
{
  "status": "SHIPPING",
  "reason": "Bắt đầu vận chuyển"
}
```

**Tab Tests:**
```javascript
if (pm.response.code === 200) {
    console.log("✅ Chuyển sang SHIPPING thành công");
}
```

**Bước chạy:**
1. Click **Send**
2. Response phải có `status: SHIPPING`

✅ **Kết Quả Mong Đợi:**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "orderId": 123,
    "status": "SHIPPING",
    "updatedAt": "2026-04-15T10:25:15"
  }
}
```

---

### 📝 Request 5: Update to COMPLETED

```
Name: 5_Update_to_COMPLETED
Method: PATCH
URL: {{base_url}}/api/v1/orders/{{order_id}}/status
```

**Tab Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Tab Body (raw - JSON):**
```json
{
  "status": "COMPLETED",
  "reason": "Retailer nhận hàng thành công"
}
```

**Tab Tests:**
```javascript
if (pm.response.code === 200) {
    console.log("✅ Chuyển sang COMPLETED thành công - Blockchain có ghi lại");
}
```

**Bước chạy:**
1. Click **Send**
2. Response phải có `status: COMPLETED`
3. **Đây là lần thứ 2 blockchain ghi lại** (lần 1 lúc CONFIRMED)

✅ **Kết Quả Mong Đợi:**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "orderId": 123,
    "status": "COMPLETED",
    "updatedAt": "2026-04-15T10:30:45"
  }
}
```

---

### 📝 Request 6: Get Status History

```
Name: 6_Get_Status_History
Method: GET
URL: {{base_url}}/api/v1/orders/{{order_id}}/status-history
```

**Tab Headers:**
```
Authorization: Bearer {{token}}
```

**Bước chạy:**
1. Click **Send**
2. Xem toàn bộ lịch sử thay đổi

✅ **Kết Quả Mong Đợi:**

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
        "reason": "Retailer nhận hàng thành công",
        "blockchainTxHash": "0x3c4d5e...",
        "changedAt": "2026-04-15T10:30:45"
      },
      {
        "historyId": 2,
        "orderId": 123,
        "previousStatus": "CONFIRMED",
        "newStatus": "SHIPPING",
        "reason": "Bắt đầu vận chuyển",
        "blockchainTxHash": null,
        "changedAt": "2026-04-15T10:25:15"
      },
      {
        "historyId": 1,
        "orderId": 123,
        "previousStatus": "PENDING",
        "newStatus": "CONFIRMED",
        "reason": "Farm xác nhận đơn hàng",
        "blockchainTxHash": "0x1a2b3c...",
        "changedAt": "2026-04-15T10:20:45"
      }
    ],
    "totalItems": 3
  }
}
```

**📌 Lưu Ý:**
- ✅ **CONFIRMED** có `blockchainTxHash` (ghi lại)
- ❌ **SHIPPING** có `blockchainTxHash: null` (không ghi lại)
- ✅ **COMPLETED** có `blockchainTxHash` (ghi lại)

---

## 5️⃣ Kiểm Tra Kết Quả

### 📊 Checklist Test Thành Công

- [ ] Login nhận được token
- [ ] Create order nhận được order ID
- [ ] Update PENDING → CONFIRMED ✅ (Blockchain hash có giá trị)
- [ ] Update CONFIRMED → SHIPPING ✅ (Blockchain hash = null, đó là bình thường)
- [ ] Update SHIPPING → COMPLETED ✅ (Blockchain hash có giá trị)
- [ ] Get history hiển thị 3 bản ghi
- [ ] CONFIRMED và COMPLETED có blockchain hash
- [ ] SHIPPING không có blockchain hash

### 🔍 Kiểm Tra Database (Optional)

```sql
-- Kết nối MySQL: localhost:3306, user: root, password: 1234, db: bicap_db

-- Xem tất cả orders
SELECT * FROM orders WHERE status = 'COMPLETED';

-- Xem lịch sử order 123
SELECT history_id, previous_status, new_status, blockchain_tx_hash, changed_at 
FROM order_status_history 
WHERE order_id = 123 
ORDER BY changed_at DESC;

-- Đếm có bao nhiêu lần ghi blockchain
SELECT COUNT(*) as blockchain_records 
FROM order_status_history 
WHERE order_id = 123 AND blockchain_tx_hash IS NOT NULL;
```

---

## ⚠️ Xử Lý Lỗi

### Lỗi 1: 401 Unauthorized

**Nguyên Nhân:** Token hết hạn hoặc không tìm thấy

**Giải Pháp:**
1. Quay lại Request 1 (Login)
2. Click **Send** để lấy token mới
3. Thử lại request hiện tại

---

### Lỗi 2: 400 Bad Request - Invalid Transition

**Nguyên Nhân:** Cố gắng chuyển trạng thái không hợp lệ

**Ví Dụ:** Cố gắng chuyển SHIPPING → CONFIRMED (sai thứ tự)

**Giải Pháp:**
Phải theo đúng sequence:
```
PENDING → CONFIRMED → SHIPPING → COMPLETED
```

---

### Lỗi 3: 404 Not Found

**Nguyên Nhân:** Order ID không tồn tại

**Giải Pháp:**
1. Kiểm tra biến `order_id` có được set không
   - Click **Environment** → `Order_API_Dev` → Check `order_id` value
2. Nếu không có, quay lại Request 2 (Create Order)
3. Click **Send**

---

### Lỗi 4: Status 500 Internal Server Error

**Nguyên Nhân:** Backend lỗi

**Giải Pháp:**
1. Kiểm tra backend có đang chạy không
   ```bash
   docker-compose ps
   ```
2. Kiểm tra logs
   ```bash
   docker-compose logs backend --tail=50
   ```
3. Restart docker nếu cần
   ```bash
   docker-compose restart backend
   ```

---

## 🚀 Tips & Tricks

### Tip 1: Chạy Collection Tự Động

**Postman Runner (Test Tất Cả Requests)**

1. Click **Collections**
2. Chuột phải vào `Order Status API`
3. Chọn **Run collection**
4. Chọn Environment: `Order_API_Dev`
5. Click **Run Order Status API**

Sẽ chạy tất cả requests theo thứ tự tự động!

---

### Tip 2: Lưu Request Dạng Code

**Share với Team (Postman Export)**

1. Click Collection → **...** (menu)
2. Chọn **Export**
3. Format: **Collection v2.1**
4. Gửi file `.json` cho team

Team import bằng:
**Import** → **Upload files** → Chọn file

---

### Tip 3: Kiểm Tra Variables

**Xem giá trị biến hiện tại**

1. Tab trên cùng, kéo phải → **Variables**
2. Hoặc `{{variable_name}}` sẽ highlight màu đỏ nếu chưa set

---

### Tip 4: Pretty Print Response

**Response khó hiểu?**

1. Tab **Body** → Chọn dropdown **JSON** (phía dưới)
2. Tự động format đẹp

---

## 📞 Hỗ Trợ

Nếu có lỗi:
1. Kiểm tra backend logs: `docker-compose logs backend`
2. Kiểm tra environment variables có set đúng không
3. Kiểm tra URL có gõ đúng không (case-sensitive)
4. Kiểm tra method (POST, PATCH, GET) có đúng không

---

**✅ Bây giờ bạn đã sẵn sàng test trên Postman!** 🚀

Hãy bắt đầu từ Request 1 (Login) và làm theo thứ tự!
