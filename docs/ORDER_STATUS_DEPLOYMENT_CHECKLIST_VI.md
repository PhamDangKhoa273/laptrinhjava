# Danh Sách Kiểm Tra Triển Khai

## ✅ Kiểm Tra Code

- [ ] Java code không có lỗi compile
- [ ] Không có warnings
- [ ] Import statements đúng
- [ ] Exception handling đúng
- [ ] DTOs dùng builder pattern
- [ ] Service method có `@Transactional`
- [ ] Controller có `@PreAuthorize`
- [ ] No circular dependencies

---

## ✅ Database Schema

- [ ] Flyway migration file: V12\_\_\*.sql
- [ ] Bảng `orders` được tạo
- [ ] Bảng `order_items` được tạo
- [ ] Bảng `order_status_history` được tạo
- [ ] Primary keys định nghĩa đúng
- [ ] Foreign keys đúng
- [ ] Indexes tạo đúng
- [ ] NOT NULL constraints đúng
- [ ] Default values đúng

---

## ✅ API Endpoints

- [ ] PATCH `/api/v1/orders/{id}/status` hoạt động
- [ ] GET `/api/v1/orders/{id}/status-history` hoạt động
- [ ] Request/Response DTOs đúng
- [ ] Role-based @PreAuthorize đúng
- [ ] Path variables mapped đúng
- [ ] Request body validation có
- [ ] Error responses đúng
- [ ] Success responses đúng

---

## ✅ Business Logic

- [ ] 6 trạng thái được định nghĩa
- [ ] Luật chuyển trạng thái đúng
- [ ] Invalid transitions bị reject
- [ ] Order lookup hoạt động
- [ ] History record được tạo
- [ ] Blockchain call không chặn API
- [ ] Transaction boundaries đúng
- [ ] Error handling không break blockchain

---

## ✅ Build & Compile

```bash
# Chạy các lệnh này
[ ] mvn clean compile
[ ] mvn clean package
[ ] Không có compile errors
[ ] Không có dependency conflicts
[ ] JAR builds successfully
```

---

## ✅ Database Migration

### Trước Migration

```bash
[ ] Run: mvn flyway:info
[ ] V12 phải appear trong pending
```

### Chạy Migration

```bash
[ ] Run: mvn flyway:migrate
[ ] Không có errors
[ ] Check: SELECT * FROM flyway_schema_history;
```

### Sau Migration

```sql
[ ] DESCRIBE orders;
[ ] DESCRIBE order_items;
[ ] DESCRIBE order_status_history;
[ ] Kiểm tra indexes
[ ] Kiểm tra foreign keys
[ ] Kiểm tra default values
```

---

## ✅ Manual Testing

### Test 1: Status Update - Happy Path

- [ ] Tạo 1 đơn hàng (POST /api/v1/orders)
- [ ] Save order_id
- [ ] Cập nhật sang CONFIRMED (PATCH /orders/{id}/status)
- [ ] Response code = 200
- [ ] order.status = CONFIRMED
- [ ] Kiểm tra DB: `SELECT * FROM orders WHERE order_id = {id};`
- [ ] Kiểm tra history: `SELECT * FROM order_status_history;`
- [ ] Blockchain hash có (sau 2-5 giây)

### Test 2: Status History Retrieval

- [ ] Tạo 5 status updates (PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED)
- [ ] Call GET /orders/{id}/status-history
- [ ] Response bao gồm 5 transitions
- [ ] blockchain hashes được populate
- [ ] Ordering là DESC by changed_at
- [ ] Response format đúng

### Test 3: Invalid Transition

- [ ] Tạo đơn hàng mới (status = PENDING)
- [ ] Try: PATCH /orders/{id}/status với status="SHIPPED"
- [ ] Response code = 400
- [ ] Error message đúng
- [ ] order.status vẫn = PENDING
- [ ] Không có history record

### Test 4: Invalid Status Value

- [ ] Try: PATCH /orders/{id}/status với status="INVALID_STATUS"
- [ ] Response code = 400
- [ ] Error mentions "không hợp lệ"

### Test 5: Order Not Found

- [ ] Try: PATCH /orders/9999999/status
- [ ] Response code = 404
- [ ] Error mentions order not found

### Test 6: Cancellation from PENDING

- [ ] Tạo đơn hàng mới (status = PENDING)
- [ ] PATCH với status="CANCELLED" và reason
- [ ] status = CANCELLED
- [ ] reason được lưu
- [ ] Try PATCH lần nữa → 400 (CANCELLED là terminal)

### Test 7: Cancellation from CONFIRMED

- [ ] PATCH PENDING → CONFIRMED
- [ ] PATCH CONFIRMED → CANCELLED
- [ ] History show transition
- [ ] Không thể chuyển sang trạng thái khác

---

## ✅ Role-Based Access

### RETAILER Role

- [ ] Có thể tạo đơn hàng
- [ ] Có thể cập nhật trạng thái
- [ ] Có thể xem lịch sử

### FARM Role

- [ ] Không thể tạo đơn hàng
- [ ] Có thể cập nhật trạng thái
- [ ] Có thể xem lịch sử

### SHIPPING_MANAGER Role

- [ ] Không thể tạo đơn hàng
- [ ] Có thể cập nhật trạng thái
- [ ] Có thể xem lịch sử

### GUEST/DRIVER Role

- [ ] Không thể truy cập bất kỳ endpoint nào

---

## ✅ Blockchain Integration

### Blockchain Enabled

- [ ] blockchain.enabled=true
- [ ] Cấu hình endpoints
- [ ] Cập nhật status → blockchain_tx_hash được populate
- [ ] TX hash format đúng (0x...)

### Blockchain Disabled

- [ ] blockchain.enabled=false
- [ ] Cập nhật status → status change succeeds
- [ ] blockchain_tx_hash = "DISABLED-..." hoặc NULL

### Blockchain Down

- [ ] Stop blockchain server
- [ ] Cập nhật status → success (non-blocking)
- [ ] blockchain_tx_hash = NULL hoặc error message
- [ ] Restart blockchain, check logs

---

## ✅ Performance

### Load Test

```bash
[ ] Tạo 50 đơn hàng
[ ] Cập nhật mỗi cái qua full workflow
[ ] Measure response time
[ ] Check DB query performance
[ ] Indexes được dùng không
[ ] Memory usage normal
```

### Query Performance

```sql
[ ] EXPLAIN SELECT * FROM orders WHERE order_id = 123;
[ ] EXPLAIN SELECT * FROM order_status_history WHERE order_id = 123;
[ ] Indexes được dùng
[ ] Query time < 10ms
```

---

## ✅ Security Checklist

### Input Validation

- [ ] Status phải non-empty
- [ ] Status phải trong whitelist
- [ ] Order ID phải valid Long
- [ ] Reason < 500 chars
- [ ] Không có SQL injection
- [ ] Không có XXE

### Authorization

- [ ] JWT required cho tất cả endpoints
- [ ] Role check enforced
- [ ] Không có privilege escalation
- [ ] Users không thể access others' data

### Audit Trail

- [ ] Tất cả changes được log
- [ ] Không thể xóa history
- [ ] Không thể modify history
- [ ] Blockchain provides immutability

---

## ✅ Pre-Deployment

- [ ] Tất cả tests pass
- [ ] Code review hoàn thành
- [ ] Documentation reviewed
- [ ] Database backup taken
- [ ] Rollback plan documented
- [ ] Deployment window scheduled

---

## ✅ Deployment Steps

1. **Pull code:** `git pull`
2. **Review migration:** `mvn flyway:info`
3. **Build:** `mvn clean package`
4. **Run migrations:** `mvn flyway:migrate`
5. **Start app:** `java -jar target/app.jar`
6. **Verify tables:** `DESC orders;`
7. **Check logs:** Không có errors
8. **Smoke test:** Test 1 endpoint

---

## ✅ Post-Deployment

- [ ] Verify endpoints accessible
- [ ] Create test order
- [ ] Update test order status
- [ ] Check history recorded
- [ ] Check blockchain hash stored
- [ ] Monitor logs (1 giờ)
- [ ] Monitor performance (24 giờ)
- [ ] Monitor error rate (24 giờ)

---

## 📊 Success Criteria

✅ PATCH /api/v1/orders/{id}/status endpoint hoạt động
✅ Status validation hoạt động
✅ Status transitions enforced
✅ Blockchain recording works
✅ History endpoint works
✅ Role-based access works
✅ Error handling appropriate
✅ DB migration successful
✅ Không có critical issues

**Deployment Ready?** [ ] YES [ ] NO

---

## 📝 Rollback Plan

Nếu có vấn đề:

```bash
# Revert migration
mvn flyway:undo

# Revert code
git revert <commit>

# Stop app và restart
```

---

## 🔗 Links

- **Controller:** OrderController.java
- **Service:** OrderService.java
- **Migration:** V12\_\_create_orders_and_order_status_history.sql
- **Testing:** ORDER_STATUS_API_TESTING_VI.md
- **Management:** ORDER_STATUS_MANAGEMENT_VI.md

---

**Phiên bản:** 1.0  
**Ngày:** 15/04/2026  
**Ngôn ngữ:** Tiếng Việt
