# TV3 Handoff - Product Batch + QR Code + Blockchain Integration

## 1. Mục tiêu TV3
TV3 phụ trách module:
- tạo và quản lý lô sản phẩm (`Product Batch`)
- tạo QR truy xuất nguồn gốc cho từng batch
- cung cấp API trace theo batch
- gọi blockchain service để ghi nhận dữ liệu batch

## 2. Phạm vi đã làm trong repo hiện tại
### Entity / Table
- `product_batches`
- `qr_codes`
- `blockchain_transactions`

### DTO
- `CreateBatchRequest`
- `UpdateBatchRequest`
- `BatchResponse`
- `QrCodeResponse`
- `TraceBatchResponse`
- `SeasonReferenceDto`
- `ProcessTraceItemDto`

### Service
- `ProductBatchService`
- `QrCodeService`
- `BlockchainService` *(hiện vẫn là mock/stub theo phạm vi TV3, chờ TV4 tích hợp thật)*
- `SeasonReferenceService`
- `ProcessTraceService`

### API
#### Batch
- `POST /api/batches`
- `GET /api/batches`
- `GET /api/batches/{id}`
- `PUT /api/batches/{id}`

#### QR
- `POST /api/batches/{id}/qr`
- `GET /api/batches/{id}/qr`

#### Trace
- `GET /api/trace/batches/{id}`
- endpoint trace đang được mở public trong security để phục vụ quét QR không cần token

## 3. Validate hiện có
- `batch_code` không trùng
- `available_quantity <= quantity`
- mỗi batch chỉ có 1 QR active
- `seasonId` phải hợp lệ (>0)
- `productId` phải hợp lệ (>0)
- validate cặp `season/product` bằng DB thật nếu schema TV1 đã có mặt trong database

## 4. Trace hiện tại đã làm gì
Trace API hiện trả theo dữ liệu thực tế đang có trong hệ thống:
- thông tin batch
- thông tin QR
- thông tin blockchain gần nhất của batch
- `seasonInfo` lấy từ DB thật nếu tìm thấy season/product tương ứng
- `processList` lấy từ DB thật nếu có bảng/process data của TV2 theo season

Nếu dữ liệu TV1/TV2 chưa merge vào schema hiện tại, API vẫn trả trace an toàn nhưng sẽ đánh dấu:
- `seasonInfo.status = MISSING_REFERENCE`
- `seasonInfo.validatedFromDb = false`
- `processList = []`
- `note` mô tả rõ đang thiếu dữ liệu nào

## 5. Những phần đã cải thiện so với bản trước
- không còn để trace ở mức placeholder cứng cho `seasonInfo`
- không còn để `processList` mặc định rỗng trong mọi trường hợp
- create/update batch đã chặn trường hợp `season/product` không khớp DB thật
- trace response hiện phản ánh trạng thái integration thực tế thay vì mô tả chung chung

## 6. Dữ liệu QR hiện tại
QR hiện chứa:
- `batch_id`
- `batch_code`
- `season_id`
- `trace_url`

Ví dụ:
```json
{
  "batch_id": 1,
  "batch_code": "BATCH-001",
  "season_id": 10,
  "trace_url": "/api/trace/batches/1"
}
```

## 7. Blockchain integration hiện tại
TV3 hiện gọi:
- `BlockchainService.saveBatch(batch)`

Service đang trả về:
- `txHash`
- `status`
- `message`

Kết quả được lưu vào bảng:
- `blockchain_transactions`

**Lưu ý:** phần này vẫn là mock transaction theo phạm vi TV3. TV4 sẽ thay bằng blockchain core service thật khi module dùng chung sẵn sàng.

## 8. Trạng thái hoàn thiện hiện tại
### Đã xử lý được
- trace không còn chỉ là placeholder đơn giản
- đã validate được `season/product` bằng DB thật nếu schema/dữ liệu liên quan đã có
- trace có thể trả `processList` thật nếu DB đã có dữ liệu process theo season
- trace note phản ánh đúng mức độ end-to-end hiện có

### Vẫn phụ thuộc module khác
- nếu TV1 chưa merge bảng/dữ liệu season-product vào DB hiện tại thì không thể xác thực sâu hơn ngoài mức detect thiếu reference
- nếu TV2 chưa merge bảng/dữ liệu process thì `processList` sẽ chưa có dữ liệu thật
- blockchain vẫn chưa phải integration sâu vì còn chờ TV4

## 9. Hướng nâng cấp tiếp theo
1. chốt chính xác schema season/product của TV1 để bỏ cơ chế candidate query/fallback
2. chốt chính xác schema process của TV2 để trace đọc dữ liệu ổn định hơn
3. thay blockchain mock bằng TV4 core service
4. bổ sung integration test end-to-end qua DB seed thật toàn nhóm
5. frontend TV5 dùng API TV3 để render batch/QR/trace

## 10. Ghi chú minh bạch
Module TV3 hiện đã hoàn thành phần backend cốt lõi và đã được nâng từ mức placeholder sang mức đọc/validate dữ liệu thật khi DB liên quan có sẵn.
Tuy nhiên độ sâu end-to-end cuối cùng vẫn còn phụ thuộc việc TV1/TV2/TV4 đã merge đầy đủ schema, data và service chung hay chưa.
